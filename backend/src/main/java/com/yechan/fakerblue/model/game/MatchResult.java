package com.yechan.fakerblue.model.game;

import java.util.List;

public record MatchResult(List<String> winnerIds, Reason reason, String message) {
    public MatchResult {
        winnerIds = List.copyOf(winnerIds);
    }

    public enum Reason {
        LAST_PLAYER_STANDING,
        CARD_DECK_EMPTY_HEALTH,
        CARD_DECK_EMPTY_CARD_VALUE,
        CARD_DECK_EMPTY_TIE
    }
}
