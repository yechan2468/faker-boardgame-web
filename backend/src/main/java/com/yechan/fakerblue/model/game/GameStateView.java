package com.yechan.fakerblue.model.game;

import java.util.List;

public record GameStateView(
        GameStatus status,
        String viewerId,
        List<PlayerView> players,
        List<LeaderboardEntry> leaderboard,
        int supplyHealth,
        int cardDeckCount,
        int discardPileCount,
        TurnState turn,
        MatchResult matchResult,
        PendingActionView pendingAction) {
    public GameStateView {
        players = List.copyOf(players);
        leaderboard = List.copyOf(leaderboard);
    }

    public static GameStateView from(GameState state, List<LeaderboardEntry> sortedLeaderboard, String viewerId,
            PendingActionView pendingAction) {
        return new GameStateView(
                state.status(),
                viewerId,
                state.players().stream()
                        .map(player -> new PlayerView(player.id(), player.nickname(), player.role(), player.connected(),
                                player.health(), player.health() > 0, player.cards().size()))
                        .toList(),
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

    public record PendingActionView(String actorId, String declaredCardId, List<String> targetIds,
            List<DefenseView> defenses) {
        public PendingActionView {
            targetIds = List.copyOf(targetIds);
            defenses = List.copyOf(defenses);
        }
    }

    public record DefenseView(String playerId, String declaredCardId, String redirectTargetId) {}
}
