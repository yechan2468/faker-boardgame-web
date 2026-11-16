package com.yechan.fakerblue.service;

import com.yechan.fakerblue.model.game.GamePlayer;
import com.yechan.fakerblue.model.game.GameState;
import com.yechan.fakerblue.model.game.GameStatus;
import com.yechan.fakerblue.model.game.LeaderboardEntry;
import com.yechan.fakerblue.model.game.MatchResult;
import com.yechan.fakerblue.model.game.TurnState;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class GameRuntimeState {
    static final int MAX_PLAYERS = 4;

    final Map<String, GamePlayer> playersBySession = new LinkedHashMap<>();
    final Map<String, LeaderboardEntry> leaderboardByPlayerId = new LinkedHashMap<>();
    final List<String> turnOrder = new ArrayList<>();
    GameStatus status = GameStatus.LOBBY;
    int supplyHealth;
    final List<String> cardDeck = new ArrayList<>();
    final List<String> discardPile = new ArrayList<>();
    TurnState turn = new TurnState(0, null, "WAITING");
    PendingPlay pendingPlay;
    MatchResult matchResult;
    String firstPlayerId;

    GamePlayer player(String id) {
        return playersBySession.values().stream().filter(player -> player.id().equals(id)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }

    GamePlayer withCards(GamePlayer player, List<String> cards) {
        return new GamePlayer(player.id(), player.nickname(), player.role(), player.connected(), player.health(), cards);
    }

    String drawCard() {
        return cardDeck.isEmpty() ? "" : cardDeck.remove(cardDeck.size() - 1);
    }

    List<LeaderboardEntry> leaderboard() {
        return leaderboardByPlayerId.values().stream()
                .sorted(java.util.Comparator.comparingInt(LeaderboardEntry::totalScore).reversed()
                        .thenComparing(java.util.Comparator.comparingInt(LeaderboardEntry::wins).reversed())
                        .thenComparing(LeaderboardEntry::nickname, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    GameState currentState() {
        return new GameState(status, new ArrayList<>(playersBySession.values()), leaderboard(), supplyHealth,
                cardDeck, discardPile, turn, matchResult);
    }

    static final class PendingDefense {
        final int index;
        final String playerId, actualCardId, declaredCardId, redirectTargetId;
        Boolean truthful;

        PendingDefense(int index, String playerId, String actualCardId, String declaredCardId, String redirectTargetId) {
            this.index = index;
            this.playerId = playerId;
            this.actualCardId = actualCardId;
            this.declaredCardId = declaredCardId;
            this.redirectTargetId = redirectTargetId;
        }
    }

    static final class PendingPlay {
        final String actorId, actual, declared;
        final List<String> originalTargets, targets;
        final java.util.Set<String> defensePasses = new java.util.LinkedHashSet<>();
        final java.util.Set<String> suspicionPasses = new java.util.LinkedHashSet<>();
        final List<String> emptyHandDefenders = new ArrayList<>();
        final List<PendingDefense> defenses = new ArrayList<>();
        int defenseSuspicionCursor;
        Boolean attackerTruthful;

        PendingPlay(String actorId, String actual, String declared, List<String> targets) {
            this.actorId = actorId;
            this.actual = actual;
            this.declared = declared;
            this.targets = targets;
            this.originalTargets = new ArrayList<>(targets);
        }
    }
}