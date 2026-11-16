package com.yechan.fakerblue.model.game;

import java.util.List;

public record GameState(GameStatus status, List<GamePlayer> players, List<LeaderboardEntry> leaderboard,
        int supplyHealth, List<String> cardDeck, List<String> discardPile, TurnState turn, MatchResult matchResult) {
    public GameState {
        players = List.copyOf(players);
        leaderboard = List.copyOf(leaderboard);
        cardDeck = List.copyOf(cardDeck);
        discardPile = List.copyOf(discardPile);
    }
}
