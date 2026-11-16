package com.yechan.fakerblue.model.game;

import java.util.List;

public record GameStateView(
        GameStatus status,
        String viewerId,
        List<PlayerView> players,
        List<String> turnOrder,
        List<LeaderboardEntry> leaderboard,
        int supplyHealth,
        int cardDeckCount,
        int discardPileCount,
        TurnState turn,
        MatchResult matchResult,
        PendingActionView pendingAction) {
    public GameStateView {
        players = List.copyOf(players);
        turnOrder = List.copyOf(turnOrder);
        leaderboard = List.copyOf(leaderboard);
    }

    public static GameStateView from(GameState state, List<String> turnOrder,
            List<LeaderboardEntry> sortedLeaderboard, String viewerId, PendingActionView pendingAction) {
        return new GameStateView(
                state.status(),
                viewerId,
                state.players().stream()
                        .map(player -> new PlayerView(player.id(), player.nickname(), player.role(), player.connected(),
                                player.health(), player.health() > 0, player.cards().size()))
                        .toList(),
                turnOrder,
                sortedLeaderboard,
                state.supplyHealth(),
                state.cardDeck().size(),
                state.discardPile().size(),
                state.turn(),
                state.matchResult(),
                pendingAction);
    }

    public record PlayerView(String id, String nickname, PlayerRole role, boolean connected, int health,
            boolean alive, int cardCount) {}

    public record PendingActionView(String actorId, String declaredCardId, String attackerActualCardId,
            List<String> targetIds, Boolean attackerTruthful, List<String> defensePasses, List<String> suspicionPasses,
            Integer suspicionDefenseIndex, List<DefenseView> defenses) {
        public PendingActionView {
            targetIds = List.copyOf(targetIds);
            defensePasses = List.copyOf(defensePasses);
            suspicionPasses = List.copyOf(suspicionPasses);
            defenses = List.copyOf(defenses);
        }
    }

    public record DefenseView(int index, String playerId, String declaredCardId, String actualCardId,
            String redirectTargetId, Boolean truthful) {}
}
