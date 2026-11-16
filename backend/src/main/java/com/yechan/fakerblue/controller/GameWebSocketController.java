package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.model.game.GameStateView;
import com.yechan.fakerblue.model.game.GameEvent;
import com.yechan.fakerblue.model.game.PlayerRole;
import com.yechan.fakerblue.model.game.PlayerSessionChangedEvent;
import com.yechan.fakerblue.service.GameStateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.yechan.fakerblue.auth.common.GamePrincipal;
import java.util.List;

@Slf4j
@Controller
public class GameWebSocketController {
    private final GameStateService state;
    private final SimpMessagingTemplate messaging;
    public GameWebSocketController(GameStateService state, SimpMessagingTemplate messaging) {
        this.state = state; this.messaging = messaging;
    }
    @MessageMapping("game/start")
    public void start(@AuthenticationPrincipal GamePrincipal host) {
        requireHost(host);
        state.startGame();
        state.currentState().players().forEach(player -> messaging.convertAndSendToUser(
                player.id(), "/queue/private", new PrivateHand(player.cards())));
        publish("MATCH_STARTED");
    }
    @MessageMapping("game/end")
    public void end(@AuthenticationPrincipal GamePrincipal host) {
        requireHost(host);
        state.endGame();
        publish("MATCH_ENDED");
    }
    @MessageMapping("game/hand")
    public void hand(@AuthenticationPrincipal GamePrincipal player) {
        messaging.convertAndSendToUser(player.getId(), "/queue/private",
                new PrivateHand(state.playerHand(player.getId())));
    }
    @MessageMapping("game/turn-end")
    public void turnEnd(@AuthenticationPrincipal GamePrincipal player) {
        var next = state.endTurn(player.getId());
        if (next != null) messaging.convertAndSendToUser(next.id(), "/queue/private", new PrivateHand(next.cards()));
        publish(next == null ? "MATCH_ENDED" : "TURN_STARTED");
    }
    @MessageMapping("game/bluff/submit")
    public void submitBluff(BluffMessage message, @AuthenticationPrincipal GamePrincipal player) {
        var declaration = state.submitBluff(player.getId(), message.actualCardId(), message.declaredCardId(), message.targetIds());
        messaging.convertAndSend("/topic/game", new BluffDeclared(declaration.actorId(), declaration.declaredCardId(), declaration.targetIds()));
        messaging.convertAndSendToUser(player.getUsername(), "/queue/private", new PrivateHand(
                state.currentState().players().stream().filter(p -> p.id().equals(player.getId())).findFirst().orElseThrow().cards()));
        publish("BLUFF_SUBMITTED");
    }
    @MessageMapping("game/bluff/challenge")
    public void challenge(ChallengeMessage message, @AuthenticationPrincipal GamePrincipal player) {
        var result = state.challenge(player.getId(), message == null ? null : message.challengedPlayerId());
        messaging.convertAndSend("/topic/game", new BluffResolved(result.truthful(), result.challengerId(),
                result.actorId(), result.challengedPlayerId(), result.declaredCardId(), result.actualCardId(),
                state.publicState()));
        publishPrivateHands();
        publish("STATE_CHANGED");
    }
    @MessageMapping("game/bluff/accept")
    public void accept(@AuthenticationPrincipal GamePrincipal player) {
        var result = state.acceptDeclaration(player.getId());
        messaging.convertAndSend("/topic/game", new BluffResolved(result.truthful(), result.challengerId(),
                result.actorId(), result.challengedPlayerId(), result.declaredCardId(), result.actualCardId(),
                state.publicState()));
        publishPrivateHands();
        publish("STATE_CHANGED");
    }
    @MessageMapping("game/card/defend")
    public void defend(DefenseMessage message, @AuthenticationPrincipal GamePrincipal player) {
        state.defendPending(player.getId(), message.actualCardId(), message.declaredCardId(),
                message.redirectTargetId());
        messaging.convertAndSend("/topic/game", new DefenseDeclared(player.getId(), message.declaredCardId(),
                message.redirectTargetId()));
        messaging.convertAndSendToUser(player.getUsername(), "/queue/private", new PrivateHand(
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
    public record ChallengeMessage(String challengedPlayerId) {}
    public record BluffDeclared(String actorId, String declaredCardId, List<String> targetIds) {}
    public record DefenseDeclared(String playerId, String declaredCardId, String redirectTargetId) {}
    public record BluffResolved(Boolean truthful, String challengerId, String actorId, String challengedPlayerId,
            String declaredCardId, String actualCardId, GameStateView state) {}
    public record DefenseMessage(String actualCardId, String declaredCardId, String redirectTargetId) {}

    private void publishPrivateHands() {
        state.currentState().players().forEach(player -> messaging.convertAndSendToUser(
                player.id(), "/queue/private", new PrivateHand(player.cards())));
    }

    private void requireHost(GamePrincipal principal) {
        if (principal == null || principal.getRole() != com.yechan.fakerblue.model.game.PlayerRole.HOST) {
            throw new IllegalStateException("호스트만 실행할 수 있습니다.");
        }
    }
}
