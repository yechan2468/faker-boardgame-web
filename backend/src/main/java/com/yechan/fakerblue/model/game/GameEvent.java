package com.yechan.fakerblue.model.game;

import java.util.List;

public record GameEvent(
        String type,
        List<GameStateView.PlayerView> players,
        List<String> turnOrder,
        int supplyHealth,
        TurnState turn,
        int deckCount,
        GameStatus status,
        MatchResult matchResult,
        GameStateView.PendingActionView pendingAction) {
    public GameEvent {
        players = List.copyOf(players);
        turnOrder = List.copyOf(turnOrder);
    }

    public static GameEvent from(String type, GameStateView state) {
        return new GameEvent(type, state.players(), state.turnOrder(), state.supplyHealth(), state.turn(), state.cardDeckCount(),
                state.status(), state.matchResult(), state.pendingAction());
    }
}
