package com.yechan.fakerblue.service;

import com.yechan.fakerblue.model.game.GamePlayer;
import java.util.ArrayList;
import java.util.List;

final class GamePlayerEffects {
    private final GameRuntimeState state;

    GamePlayerEffects(GameRuntimeState state) {
        this.state = state;
    }

    int changeHealth(String playerId, int delta) {
        var entry = state.playersBySession.entrySet().stream()
                .filter(candidate -> candidate.getValue().id().equals(playerId)).findFirst();
        if (entry.isEmpty()) return 0;
        GamePlayer player = entry.get().getValue();
        if (player.health() <= 0) return 0;
        int actual = delta < 0 ? -Math.min(player.health(), -delta) : delta;
        int remainingHealth = player.health() + actual;
        if (actual < 0) state.supplyHealth += -actual;
        List<String> remainingCards = player.cards();
        if (remainingHealth == 0 && player.health() > 0) {
            state.discardPile.addAll(player.cards());
            remainingCards = List.of();
        }
        state.playersBySession.put(entry.get().getKey(), new GamePlayer(player.id(), player.nickname(), player.role(),
                player.connected(), remainingHealth, remainingCards));
        return -actual;
    }

    int transferHealth(String fromId, String toId, int amount) {
        if (fromId.equals(toId) || amount <= 0) return 0;
        var sourceEntry = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(fromId)).findFirst();
        var targetEntry = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(toId)).findFirst();
        if (sourceEntry.isEmpty() || targetEntry.isEmpty()) return 0;
        GamePlayer source = sourceEntry.get().getValue();
        GamePlayer target = targetEntry.get().getValue();
        if (source.health() <= 0 || target.health() <= 0) return 0;
        int transferred = Math.min(source.health(), amount);
        int remainingSourceHealth = source.health() - transferred;
        List<String> sourceCards = source.cards();
        if (remainingSourceHealth == 0) {
            state.discardPile.addAll(source.cards());
            sourceCards = List.of();
        }
        state.playersBySession.put(sourceEntry.get().getKey(), new GamePlayer(source.id(), source.nickname(), source.role(),
                source.connected(), remainingSourceHealth, sourceCards));
        state.playersBySession.put(targetEntry.get().getKey(), new GamePlayer(target.id(), target.nickname(), target.role(),
                target.connected(), target.health() + transferred, target.cards()));
        return transferred;
    }

    void healFromSupply(String playerId, int amount) {
        if (state.player(playerId).health() <= 0) return;
        int healed = Math.min(state.supplyHealth, amount);
        if (healed > 0) {
            state.supplyHealth -= healed;
            changeHealth(playerId, healed);
        }
    }

    void exchangeOneCard(String actorId, String targetId) {
        var actorEntry = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(actorId)).findFirst();
        var targetEntry = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(targetId)).findFirst();
        if (actorEntry.isEmpty() || targetEntry.isEmpty()) return;
        GamePlayer actor = actorEntry.get().getValue();
        GamePlayer target = targetEntry.get().getValue();
        if (actor.cards().isEmpty() || target.cards().isEmpty()) return;
        List<String> actorCards = new ArrayList<>(actor.cards());
        List<String> targetCards = new ArrayList<>(target.cards());
        String card = actorCards.removeLast();
        actorCards.add(targetCards.removeLast());
        targetCards.add(card);
        state.playersBySession.put(actorEntry.get().getKey(), state.withCards(actor, actorCards));
        state.playersBySession.put(targetEntry.get().getKey(), state.withCards(target, targetCards));
    }
}
