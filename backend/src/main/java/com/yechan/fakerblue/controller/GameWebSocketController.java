package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.model.game.GameStateView;
import com.yechan.fakerblue.model.game.GameEvent;
import com.yechan.fakerblue.model.game.PlayerRole;
import com.yechan.fakerblue.model.game.PlayerSessionChangedEvent;
import com.yechan.fakerblue.auth.common.GameSessionService;
import com.yechan.fakerblue.service.GameStateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.context.event.EventListener;
import org.springframework.security.access.AccessDeniedException;
import com.yechan.fakerblue.auth.common.GamePrincipal;
import java.security.Principal;
import java.util.List;

@Slf4j
@Controller
public class GameWebSocketController {
    private final GameStateService state;
    private final GameSessionService gameSessionService;
    private final SimpMessagingTemplate messaging;
    public GameWebSocketController(GameStateService state, GameSessionService gameSessionService,
            SimpMessagingTemplate messaging) {
        this.state = state; this.gameSessionService = gameSessionService; this.messaging = messaging;
    }
    @MessageMapping("game/start")
    public void start(Principal user) {
        GamePrincipal host = requirePlayer(user);
        requireHost(host);
        state.startGame();
        publishPrivateHands();
        publish("MATCH_STARTED");
    }
    @MessageMapping("game/restart")
    public void restart(Principal user) {
        GamePrincipal host = requirePlayer(user);
        requireHost(host);
        state.restartGame();
        publishPrivateHands();
        publish("MATCH_STARTED");
    }
    @MessageMapping("game/end")
    public void end(Principal user) {
        GamePrincipal host = requirePlayer(user);
        requireHost(host);
        state.endGame();
        publishPrivateHands();
        publish("MATCH_ENDED");
    }
    @MessageMapping("game/hand")
    public void hand(Principal user) {
        GamePrincipal player = requirePlayer(user);
        messaging.convertAndSendToUser(player.getId(), "/queue/private",
                new PrivateHand(state.playerHand(player.getId())));
    }
    @MessageMapping("game/turn-end")
    public void turnEnd(Principal user) {
        GamePrincipal player = requirePlayer(user);
        var next = state.endTurn(player.getId());
        if (next != null) messaging.convertAndSendToUser(next.id(), "/queue/private", new PrivateHand(next.cards()));
        publish(next == null ? "MATCH_ENDED" : "TURN_STARTED");
    }
    @MessageMapping("game/bluff/submit")
    public void submitBluff(BluffMessage message, Principal user) {
        GamePrincipal player = requirePlayer(user);
        state.submitBluff(player.getId(), message.actualCardId(), message.declaredCardId(), message.targetIds());
        messaging.convertAndSendToUser(player.getId(), "/queue/private", new PrivateHand(
                state.currentState().players().stream().filter(p -> p.id().equals(player.getId())).findFirst().orElseThrow().cards()));
        publish("BLUFF_SUBMITTED");
    }
    @MessageMapping("game/bluff/challenge")
    public void challenge(ChallengeMessage message, Principal user) {
        GamePrincipal player = requirePlayer(user);
        var result = state.challenge(player.getId(), message == null ? null : message.challengedPlayerId(),
                message == null ? null : message.defenseIndex());
        messaging.convertAndSend("/topic/game", new BluffResolved(result.truthful(), result.challengerId(),
                result.actorId(), result.challengedPlayerId(), result.declaredCardId(), result.actualCardId(),
                result.defenseIndex(), state.publicState()));
        publishPrivateHands();
        publish("STATE_CHANGED");
    }
    @MessageMapping("game/bluff/pass")
    public void passSuspicion(Principal user) {
        GamePrincipal player = requirePlayer(user);
        state.passSuspicion(player.getId());
        publishPrivateHands();
        publish("STATE_CHANGED");
    }
    @MessageMapping("game/card/pass-defense")
    public void passDefense(Principal user) {
        GamePrincipal player = requirePlayer(user);
        state.passDefense(player.getId());
        publish("DEFENSE_PASSED");
    }
    @MessageMapping("game/card/defend")
    public void defend(DefenseMessage message, Principal user) {
        GamePrincipal player = requirePlayer(user);
        state.defendPending(player.getId(), message.actualCardId(), message.declaredCardId(),
                message.redirectTargetId());
        messaging.convertAndSendToUser(player.getId(), "/queue/private", new PrivateHand(
                state.currentState().players().stream().filter(p -> p.id().equals(player.getId())).findFirst().orElseThrow().cards()));
        publish("DEFENSE_SUBMITTED");
    }
    @MessageExceptionHandler(Exception.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public ErrorMessage handleWebSocketException(Exception exception) {
        String message = exception.getMessage();
        System.out.println("GameWebSocketController: " + message);
        return new ErrorMessage(message == null || message.isBlank() ? "요청을 처리하지 못했습니다." : message);
    }

    private void publish(String type) {
        var current = state.publicState();
        String eventType = current.matchResult() == null ? type : "MATCH_ENDED";
        messaging.convertAndSend("/topic/game", GameEvent.from(eventType, current));
    }

    @EventListener
    public void publishPlayerSessionChange(PlayerSessionChangedEvent event) {
        publish(event.type());
    }
    public record PrivateHand(List<String> cards) {}
    public record ErrorMessage(String message) {}
    public record BluffMessage(String actualCardId, String declaredCardId, List<String> targetIds) {}
    public record ChallengeMessage(String challengedPlayerId, Integer defenseIndex) {}
    public record BluffResolved(Boolean truthful, String challengerId, String actorId, String challengedPlayerId,
            String declaredCardId, String actualCardId, int defenseIndex, GameStateView state) {}
    public record DefenseMessage(String actualCardId, String declaredCardId, String redirectTargetId) {}

    private void publishPrivateHands() {
        state.currentState().players().forEach(player -> messaging.convertAndSendToUser(
                player.id(), "/queue/private", new PrivateHand(player.cards())));
    }

    private GamePrincipal requirePlayer(Principal user) {
        String playerId = user == null ? null : user.getName();
        GamePrincipal principal = playerId == null ? null : gameSessionService.findActivePrincipal(playerId)
                .orElse(null);
        if (principal == null || principal.getRole() == null) {
            throw new AccessDeniedException("로그인한 플레이어 정보를 확인할 수 없습니다.");
        }
        return principal;
    }

    private void requireHost(GamePrincipal principal) {
        if (principal.getRole() != PlayerRole.HOST) {
            throw new IllegalStateException("호스트만 실행할 수 있습니다.");
        }
    }
}
