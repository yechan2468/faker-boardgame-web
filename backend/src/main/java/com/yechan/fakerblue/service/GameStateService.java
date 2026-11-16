package com.yechan.fakerblue.service;

import com.yechan.fakerblue.model.game.GamePlayer;
import com.yechan.fakerblue.model.card.CardCatalog;
import com.yechan.fakerblue.model.game.GameState;
import com.yechan.fakerblue.model.game.GameStateView;
import com.yechan.fakerblue.model.game.GameStatus;
import com.yechan.fakerblue.model.game.LeaderboardEntry;
import com.yechan.fakerblue.model.game.MatchResult;
import com.yechan.fakerblue.model.game.PlayerRole;
import com.yechan.fakerblue.model.game.TurnState;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GameStateService {
    private final GameRuntimeState state = new GameRuntimeState();
    private final GameTurnService turnService = new GameTurnService(state);
    public synchronized boolean registerHost(String sessionId, String playerId, String nickname) {
        if (state.playersBySession.values().stream().anyMatch(player -> player.role() == PlayerRole.HOST)) {
            return false;
        }

        state.playersBySession.put(sessionId, new GamePlayer(playerId, nickname, PlayerRole.HOST, true, 7, List.of()));
        return true;
    }

    public synchronized boolean registerPlayer(String sessionId, String playerId, String nickname) {
        if (state.status == GameStatus.IN_GAME) {
            return false;
        }
        boolean hostIsConnected = state.playersBySession.values().stream()
                .anyMatch(player -> player.role() == PlayerRole.HOST);
        if (!hostIsConnected || state.playersBySession.size() >= GameRuntimeState.MAX_PLAYERS) {
            return false;
        }

        state.playersBySession.put(sessionId, new GamePlayer(playerId, nickname, PlayerRole.PLAYER, true, 7, List.of()));
        return true;
    }

    public synchronized GamePlayer removePlayer(String sessionId) {
        GamePlayer removed = state.playersBySession.remove(sessionId);
        if (removed == null || state.status != GameStatus.IN_GAME) return removed;

        if (state.pendingPlay != null) {
            if (state.pendingPlay.actorId.equals(removed.id()) || removed.id().equals(state.turn.activePlayerId())) turnService.discardPendingCards();
            else {
                state.pendingPlay.targets.remove(removed.id());
                state.pendingPlay.defensePasses.remove(removed.id());
                state.pendingPlay.suspicionPasses.remove(removed.id());
            }
        }

        if (state.playersBySession.values().stream().noneMatch(p -> p.health() > 0)) {
            state.status = GameStatus.LOBBY;
            state.turn = new TurnState(0, null, "WAITING");
            state.pendingPlay = null;
            state.matchResult = null;
            return removed;
        }

        List<GamePlayer> alivePlayers = state.playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (alivePlayers.size() == 1) {
            turnService.finishMatch(alivePlayers, MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하거나 나가서 승리했습니다.");
            return removed;
        }

        turnService.advancePendingAfterPlayerDeparture();

        if (removed.id().equals(state.turn.activePlayerId())) turnService.advanceTurnAfter(removed.id());
        return removed;
    }

    public synchronized GameState currentState() {
        return state.currentState();
    }

    public synchronized GameStateView publicState() {
        return publicState(null);
    }

    public synchronized GameStateView publicState(String viewerId) {
        GameStateView.PendingActionView pendingAction = state.pendingPlay == null ? null
                : new GameStateView.PendingActionView(state.pendingPlay.actorId, state.pendingPlay.declared,
                        state.pendingPlay.attackerTruthful == null ? null : state.pendingPlay.actual,
                        state.pendingPlay.targets, state.pendingPlay.attackerTruthful,
                        List.copyOf(state.pendingPlay.defensePasses), List.copyOf(state.pendingPlay.suspicionPasses),
                        "DEFENSE_SUSPICION".equals(state.turn.phase())
                                && state.pendingPlay.defenseSuspicionCursor < state.pendingPlay.defenses.size()
                                        ? state.pendingPlay.defenses.get(state.pendingPlay.defenseSuspicionCursor).index : null,
                        java.util.stream.IntStream.range(0, state.pendingPlay.defenses.size())
                                .mapToObj(index -> {
                                    GameRuntimeState.PendingDefense defense = state.pendingPlay.defenses.get(index);
                                    return new GameStateView.DefenseView(defense.index, defense.playerId,
                                            defense.declaredCardId,
                                            defense.truthful == null ? null : defense.actualCardId,
                                            defense.redirectTargetId, defense.truthful);
                                })
                                .toList());
        return GameStateView.from(currentState(), state.turnOrder, leaderboard(), viewerId, pendingAction);
    }

    public synchronized List<String> playerHand(String playerId) {
        return List.copyOf(state.player(playerId).cards());
    }

    public synchronized List<LeaderboardEntry> leaderboard() {
        return state.leaderboard();
    }

    public synchronized void startGame() {
        if (state.status == GameStatus.IN_GAME) throw new IllegalStateException("이미 게임이 진행 중입니다.");
        initializeGame();
    }

    public synchronized void restartGame() {
        initializeGame();
    }

    private void initializeGame() {
        if (state.playersBySession.size() < 2 || state.playersBySession.size() > GameRuntimeState.MAX_PLAYERS)
            throw new IllegalStateException("게임은 2~4명으로 시작할 수 있습니다.");
        state.status = GameStatus.IN_GAME;
        state.matchResult = null;
        state.supplyHealth = 2;
        state.cardDeck.clear();
        state.discardPile.clear();
        CardCatalog.ALL.forEach(card -> { for (int i = 0; i < card.copies(); i++) state.cardDeck.add(card.id()); });
        java.util.Collections.shuffle(state.cardDeck);
        state.turnOrder.clear();
        state.playersBySession.values().forEach(player -> state.turnOrder.add(player.id()));
        java.util.Collections.shuffle(state.turnOrder);
        state.playersBySession.replaceAll((session, player) -> new GamePlayer(player.id(), player.nickname(),
                player.role(), true, 7, List.of(state.drawCard())));
        String firstPlayerId = state.turnOrder.getFirst();
        GamePlayer firstPlayer = state.player(firstPlayerId);
        String firstSession = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(firstPlayerId)).findFirst().orElseThrow().getKey();
        List<String> firstHand = new ArrayList<>(firstPlayer.cards());
        if (!state.cardDeck.isEmpty()) firstHand.add(state.drawCard());
        state.playersBySession.put(firstSession, state.withCards(firstPlayer, firstHand));
        state.firstPlayerId = firstPlayerId;
        state.turn = new TurnState(1, firstPlayerId, "START");
        state.pendingPlay = null;
    }

    public synchronized void endGame() {
        state.status = GameStatus.LOBBY;
        state.playersBySession.replaceAll((session, player) -> new GamePlayer(
                player.id(), player.nickname(), player.role(), player.connected(), 7, List.of()));
        state.supplyHealth = 0;
        state.cardDeck.clear();
        state.discardPile.clear();
        state.turn = new TurnState(0, null, "WAITING");
        state.pendingPlay = null;
        state.matchResult = null;
        state.turnOrder.clear();
        state.firstPlayerId = null;
    }

    public synchronized GamePlayer endTurn(String playerId) { return turnService.endTurn(playerId); }
    public synchronized Declaration submitBluff(String actorId, String actualCardId, String declaredCardId,
            List<String> targets) {
        return turnService.submitBluff(actorId, actualCardId, declaredCardId, targets);
    }
    public synchronized Resolution challenge(String challengerId) { return turnService.challenge(challengerId); }
    public synchronized Resolution challenge(String challengerId, String challengedPlayerId) {
        return turnService.challenge(challengerId, challengedPlayerId);
    }
    public synchronized Resolution challenge(String challengerId, String challengedPlayerId, Integer defenseIndex) {
        return turnService.challenge(challengerId, challengedPlayerId, defenseIndex);
    }
    public synchronized void passSuspicion(String playerId) { turnService.passSuspicion(playerId); }
    public synchronized void passDefense(String playerId) { turnService.passDefense(playerId); }
    public synchronized GameState defendPending(String defenderId, String actualCardId, String defenseCardId,
            String redirectTargetId) {
        return turnService.defendPending(defenderId, actualCardId, defenseCardId, redirectTargetId);
    }
    public synchronized GameState playCard(String actorId, String cardId, List<String> targetIds) {
        return turnService.playCard(actorId, cardId, targetIds);
    }

    public record Declaration(String actorId, String declaredCardId, List<String> targetIds) {}
    public record Resolution(Boolean truthful, String challengerId, String actorId, String challengedPlayerId,
            String declaredCardId, String actualCardId, int defenseIndex) {}
    public synchronized void resetAfterHostLogout() {
        state.playersBySession.clear();
        state.status = GameStatus.LOBBY;
        state.supplyHealth = 0;
        state.cardDeck.clear();
        state.discardPile.clear();
        state.turn = new TurnState(0, null, "WAITING");
        state.pendingPlay = null;
        state.matchResult = null;
        state.firstPlayerId = null;
        state.turnOrder.clear();
    }
}
