package com.yechan.fakerblue.service;

import com.yechan.fakerblue.model.card.CardCatalog;
import com.yechan.fakerblue.model.game.GamePlayer;
import com.yechan.fakerblue.model.game.GameState;
import com.yechan.fakerblue.model.game.GameStatus;
import com.yechan.fakerblue.model.game.LeaderboardEntry;
import com.yechan.fakerblue.model.game.MatchResult;
import com.yechan.fakerblue.model.game.TurnState;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class GameTurnService {
    private final GameRuntimeState state;
    private final GamePlayerEffects playerEffects;
    private final GameMatchResolver matchResolver = new GameMatchResolver();

    GameTurnService(GameRuntimeState state) {
        this.state = state;
        this.playerEffects = new GamePlayerEffects(state);
    }
    GamePlayer endTurn(String playerId) {
        if (state.status != GameStatus.IN_GAME) throw new IllegalStateException("게임 중이 아닙니다.");
        if (state.pendingPlay != null) throw new IllegalStateException("제출된 카드의 판정이 끝나지 않았습니다.");
        if (!playerId.equals(state.turn.activePlayerId())) throw new IllegalStateException("현재 턴의 플레이어가 아닙니다.");
        if (player(playerId).health() <= 0) throw new IllegalStateException("탈락한 플레이어는 턴을 진행할 수 없습니다.");
        if (!"RESOLVED".equals(state.turn.phase())) throw new IllegalStateException("현재 턴의 카드 판정이 끝나지 않았습니다.");
        List<GamePlayer> players = state.playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (players.isEmpty()) throw new IllegalStateException("플레이어가 없습니다.");
        if (players.size() == 1) {
            finishMatch(List.of(players.getFirst()), MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하여 승리했습니다.");
            return null;
        }
        return advanceTurnAfter(playerId);
    }

    GameStateService.Declaration submitBluff(String actorId, String actualCardId, String declaredCardId,
            List<String> targets) {
        if (state.status != GameStatus.IN_GAME || state.pendingPlay != null) throw new IllegalStateException("현재 카드를 제출할 수 없습니다.");
        if (!CardCatalog.ALL.stream().anyMatch(card -> card.id().equals(declaredCardId))) throw new IllegalArgumentException("선언한 카드를 찾을 수 없습니다.");
        GamePlayer actor = player(actorId);
        if (!actorId.equals(state.turn.activePlayerId())) throw new IllegalStateException("현재 턴의 플레이어가 아닙니다.");
        if (!"START".equals(state.turn.phase())) throw new IllegalStateException("현재 턴에서 카드를 제출할 수 없습니다.");
        if (actor.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 카드를 제출할 수 없습니다.");
        if (!actor.cards().contains(actualCardId)) throw new IllegalArgumentException("보유하지 않은 카드입니다.");
        CardCatalog.CardSpec declaration = CardCatalog.ALL.stream().filter(c -> c.id().equals(declaredCardId)).findFirst().orElseThrow();
        if (declaration.kind() == CardCatalog.Kind.DEFEND || declaration.kind() == CardCatalog.Kind.REFLECT
                || declaration.kind() == CardCatalog.Kind.NO_ABILITY ||
                (actualCardId.equals("clown") && declaredCardId.equals("clown")))
            throw new IllegalArgumentException("이 카드는 공격 선언으로 사용할 수 없습니다.");
        List<String> selectedTargets = targets == null ? new ArrayList<>() : new ArrayList<>(targets);
        if (declaration.kind() == CardCatalog.Kind.AREA_ATTACK || declaration.kind() == CardCatalog.Kind.AREA_STEAL) {
            selectedTargets = state.playersBySession.values().stream().filter(p -> p.health() > 0)
                    .map(GamePlayer::id).filter(id -> !id.equals(actorId)).toList();
        } else if (declaration.kind() == CardCatalog.Kind.SINGLE_ATTACK
                || declaration.kind() == CardCatalog.Kind.SELF_COST_ATTACK
                || declaration.kind() == CardCatalog.Kind.SINGLE_STEAL
                || declaration.kind() == CardCatalog.Kind.HEAL_AND_EXCHANGE) {
            if (selectedTargets.size() != 1) throw new IllegalArgumentException("대상 플레이어 한 명을 지정해 주세요.");
            String targetId = selectedTargets.getFirst();
            GamePlayer target = player(targetId);
            if (target.health() <= 0 || actorId.equals(targetId))
                throw new IllegalArgumentException("살아 있는 다른 플레이어를 대상으로 지정해 주세요.");
        } else {
            selectedTargets = List.of();
        }
        state.pendingPlay = new GameRuntimeState.PendingPlay(actorId, actualCardId, declaredCardId, new ArrayList<>(selectedTargets));
        List<String> remainingHand = new ArrayList<>(actor.cards());
        remainingHand.remove(actualCardId);
        String actorSession = state.playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(actorId))
                .map(Map.Entry::getKey).findFirst().orElseThrow();
        state.playersBySession.put(actorSession, state.withCards(actor, remainingHand));
        state.turn = new TurnState(state.turn.number(), actorId, "SUSPICION");
        return new GameStateService.Declaration(actorId, declaredCardId, List.copyOf(state.pendingPlay.targets));
    }

    GameStateService.Resolution challenge(String challengerId) {
        return challenge(challengerId, null, null);
    }

    GameStateService.Resolution challenge(String challengerId, String challengedPlayerId) {
        return challenge(challengerId, challengedPlayerId, null);
    }

    GameStateService.Resolution challenge(String challengerId, String challengedPlayerId, Integer defenseIndex) {
        if (state.pendingPlay == null) throw new IllegalStateException("의심할 카드가 없습니다.");
        boolean attackSuspicion = "SUSPICION".equals(state.turn.phase());
        boolean defenseSuspicion = "DEFENSE_SUSPICION".equals(state.turn.phase());
        if (!attackSuspicion && !defenseSuspicion)
            throw new IllegalStateException("현재 의심 단계를 진행할 수 없습니다.");
        GamePlayer challenger = player(challengerId);
        if (challenger.health() <= 0) throw new IllegalStateException("생존 플레이어만 카드를 의심할 수 있습니다.");
        String actorId = state.pendingPlay.actorId;
        String targetId = challengedPlayerId == null ? actorId : challengedPlayerId;
        boolean challengingAttack = attackSuspicion && defenseIndex == null && targetId.equals(actorId);
        GameRuntimeState.PendingDefense defense = defenseSuspicion ? state.pendingPlay.defenses.stream()
                .filter(candidate -> candidate.playerId.equals(targetId)
                        && defenseIndex != null && candidate.index == defenseIndex
                        && state.pendingPlay.defenseSuspicionCursor < state.pendingPlay.defenses.size()
                        && candidate.index == state.pendingPlay.defenses.get(state.pendingPlay.defenseSuspicionCursor).index)
                .findFirst().orElse(null) : null;
        if (challengingAttack) {
            if (challengerId.equals(actorId)) throw new IllegalStateException("자신이 제출한 카드는 의심할 수 없습니다.");
            if (state.pendingPlay.attackerTruthful != null) throw new IllegalStateException("이미 의심한 카드입니다.");
        } else {
            if (!defenseSuspicion) throw new IllegalArgumentException("현재 의심할 수 있는 카드가 아닙니다.");
            if (defense == null) throw new IllegalArgumentException("의심할 카드 제출을 찾을 수 없습니다.");
            if (challengerId.equals(targetId)) throw new IllegalStateException("자신이 제출한 카드는 의심할 수 없습니다.");
            if (defense.truthful != null) throw new IllegalStateException("이미 의심한 카드입니다.");
        }

        boolean truthful = challengingAttack
                ? state.pendingPlay.actual.equals(state.pendingPlay.declared)
                : defense.actualCardId.equals(defense.declaredCardId);
        String actualCardId = challengingAttack ? state.pendingPlay.actual : defense.actualCardId;
        String declaredCardId = challengingAttack ? state.pendingPlay.declared : defense.declaredCardId;
        if (challengingAttack) {
            state.pendingPlay.attackerTruthful = truthful;
            if (truthful) playerEffects.changeHealth(challengerId, -2);
            else {
                playerEffects.changeHealth(actorId, -2);
                playerEffects.healFromSupply(challengerId, 2);
            }
        } else {
            defense.truthful = truthful;
            if (truthful) playerEffects.changeHealth(challengerId, -2);
            else {
                playerEffects.changeHealth(defense.playerId, -2);
                playerEffects.healFromSupply(challengerId, 2);
            }
        }

        if (state.status == GameStatus.IN_GAME && state.pendingPlay != null) {
            state.pendingPlay.suspicionPasses.clear();
            long aliveCount = state.playersBySession.values().stream().filter(candidate -> candidate.health() > 0).count();
            if (aliveCount <= 1 || (challengingAttack && !truthful)) {
                finishPendingPlay();
            } else if (challengingAttack) {
                advanceAfterAttackSuspicion();
            } else {
                advanceDefenseSuspicionCard();
            }
        }
        return new GameStateService.Resolution(truthful, challengerId, actorId, targetId, declaredCardId, actualCardId,
                challengingAttack ? -1 : defense.index);
    }

    void passSuspicion(String playerId) {
        if (state.pendingPlay == null || (!"SUSPICION".equals(state.turn.phase())
                && !"DEFENSE_SUSPICION".equals(state.turn.phase())))
            throw new IllegalStateException("현재 의심 단계를 진행할 수 없습니다.");
        String phase = state.turn.phase();
        GamePlayer passingPlayer = player(playerId);
        if (passingPlayer.health() <= 0) throw new IllegalStateException("생존 플레이어만 의심을 마칠 수 있습니다.");
        if (playerId.equals(suspicionCardOwnerId()))
            throw new IllegalStateException("자신이 제출한 카드는 의심하거나 패스할 수 없습니다.");
        state.pendingPlay.suspicionPasses.add(playerId);
        if (state.pendingPlay.suspicionPasses.containsAll(suspicionParticipantIds())) {
            if ("SUSPICION".equals(phase)) advanceAfterAttackSuspicion();
            else advanceDefenseSuspicionCard();
        }
    }

    void passDefense(String playerId) {
        if (state.pendingPlay == null || !"DEFENSE".equals(state.turn.phase()))
            throw new IllegalStateException("현재 방어 단계를 진행할 수 없습니다.");
        GamePlayer defender = player(playerId);
        if (defender.health() <= 0) throw new IllegalStateException("생존 플레이어만 방어를 선택할 수 있습니다.");
        if (!state.pendingPlay.targets.contains(playerId)) throw new IllegalStateException("방어할 공격 대상이 아닙니다.");
        state.pendingPlay.defensePasses.add(playerId);
        advanceAfterDefenseIfComplete();
    }

    GameState defendPending(String defenderId, String actualCardId, String defenseCardId,
            String redirectTargetId) {
        if (state.pendingPlay == null) throw new IllegalStateException("방어할 카드가 없습니다.");
        if (!"DEFENSE".equals(state.turn.phase())) throw new IllegalStateException("의심 단계에서는 방어할 수 없습니다.");
        if (state.pendingPlay.declared.equals("alchemist")) throw new IllegalStateException("연금술사의 교환은 방어할 수 없습니다.");
        GamePlayer defender = player(defenderId);
        if (defender.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 방어할 수 없습니다.");
        if (!state.pendingPlay.targets.contains(defenderId)) throw new IllegalArgumentException("공격 대상이 아닙니다.");
        if (!"defender".equals(defenseCardId) && !"wizard".equals(defenseCardId))
            throw new IllegalArgumentException("방패병 또는 마법사만 방어할 수 있습니다.");
        CardCatalog.CardSpec declared = CardCatalog.ALL.stream().filter(c -> c.id().equals(state.pendingPlay.declared)).findFirst().orElseThrow();
        if (declared.kind() != CardCatalog.Kind.SINGLE_ATTACK && declared.kind() != CardCatalog.Kind.AREA_ATTACK
                && declared.kind() != CardCatalog.Kind.SELF_COST_ATTACK && declared.kind() != CardCatalog.Kind.SINGLE_STEAL
                && declared.kind() != CardCatalog.Kind.AREA_STEAL)
            throw new IllegalStateException("이 카드는 방어할 수 있는 공격이 아닙니다.");
        if (!defender.cards().contains(actualCardId)) throw new IllegalArgumentException("보유하지 않은 방어 카드입니다.");
        if (defenseCardId.equals("wizard") && (redirectTargetId == null || defenderId.equals(redirectTargetId) ||
                state.playersBySession.values().stream().noneMatch(p -> p.id().equals(redirectTargetId) && p.health() > 0)
                || (state.pendingPlay.targets.contains(redirectTargetId) && !redirectTargetId.equals(defenderId))))
            throw new IllegalArgumentException("반사할 대상을 지정해 주세요.");
        List<String> hand = new ArrayList<>(defender.cards()); hand.remove(actualCardId);
        if (hand.isEmpty()) state.pendingPlay.emptyHandDefenders.add(defenderId);
        state.pendingPlay.defenses.add(new GameRuntimeState.PendingDefense(state.pendingPlay.defenses.size(), defenderId,
                actualCardId, defenseCardId, redirectTargetId));
        String session = state.playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(defenderId)).findFirst().orElseThrow().getKey();
        state.playersBySession.put(session, state.withCards(defender, hand));
        state.pendingPlay.targets.remove(defenderId);
        if (defenseCardId.equals("wizard")) {
            state.pendingPlay.targets.add(redirectTargetId);
            state.pendingPlay.defensePasses.remove(redirectTargetId);
        }
        advanceAfterDefenseIfComplete();
        return state.currentState();
    }

    private void advanceAfterAttackSuspicion() {
        if (state.pendingPlay == null || !"SUSPICION".equals(state.turn.phase())) return;
        state.pendingPlay.targets.removeIf(targetId -> state.playersBySession.values().stream()
                .noneMatch(player -> player.id().equals(targetId) && player.health() > 0));
        CardCatalog.Kind kind = CardCatalog.ALL.stream()
                .filter(card -> card.id().equals(state.pendingPlay.declared))
                .findFirst().orElseThrow().kind();
        boolean defendableAttack = !state.pendingPlay.targets.isEmpty() && (kind == CardCatalog.Kind.SINGLE_ATTACK
                || kind == CardCatalog.Kind.AREA_ATTACK || kind == CardCatalog.Kind.SELF_COST_ATTACK
                || kind == CardCatalog.Kind.SINGLE_STEAL || kind == CardCatalog.Kind.AREA_STEAL);
        if (defendableAttack) {
            state.pendingPlay.defensePasses.clear();
            state.turn = new TurnState(state.turn.number(), state.turn.activePlayerId(), "DEFENSE");
        } else {
            finishPendingPlay();
        }
    }

    private void advanceAfterDefenseIfComplete() {
        if (state.pendingPlay != null && "DEFENSE".equals(state.turn.phase())
                && state.pendingPlay.targets.stream().allMatch(state.pendingPlay.defensePasses::contains)) {
            state.pendingPlay.suspicionPasses.clear();
            if (state.pendingPlay.defenses.isEmpty()) finishPendingPlay();
            else {
                state.pendingPlay.defenseSuspicionCursor = 0;
                state.turn = new TurnState(state.turn.number(), state.turn.activePlayerId(), "DEFENSE_SUSPICION");
            }
        }
    }

    private void advanceDefenseSuspicionCard() {
        if (state.pendingPlay == null || !"DEFENSE_SUSPICION".equals(state.turn.phase())) return;
        state.pendingPlay.suspicionPasses.clear();
        state.pendingPlay.defenseSuspicionCursor++;
        if (state.pendingPlay.defenseSuspicionCursor >= state.pendingPlay.defenses.size()) finishPendingPlay();
    }

    private String suspicionCardOwnerId() {
        if (state.pendingPlay == null) return null;
        if ("SUSPICION".equals(state.turn.phase())) return state.pendingPlay.actorId;
        if ("DEFENSE_SUSPICION".equals(state.turn.phase())
                && state.pendingPlay.defenseSuspicionCursor < state.pendingPlay.defenses.size()) {
            return state.pendingPlay.defenses.get(state.pendingPlay.defenseSuspicionCursor).playerId;
        }
        return null;
    }

    private List<String> suspicionParticipantIds() {
        String cardOwnerId = suspicionCardOwnerId();
        return state.playersBySession.values().stream()
                .filter(candidate -> candidate.health() > 0 && !candidate.id().equals(cardOwnerId))
                .map(GamePlayer::id)
                .toList();
    }

    void advancePendingAfterPlayerDeparture() {
        if (state.pendingPlay == null) return;
        advanceAfterDefenseIfComplete();
        if (state.pendingPlay == null || !state.pendingPlay.suspicionPasses.containsAll(suspicionParticipantIds())) return;
        if ("SUSPICION".equals(state.turn.phase())) advanceAfterAttackSuspicion();
        else if ("DEFENSE_SUSPICION".equals(state.turn.phase())) advanceDefenseSuspicionCard();
    }

    private GamePlayer player(String id) {
        return state.playersBySession.values().stream().filter(p -> p.id().equals(id)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }

    private void finishPendingPlay() {
        if (state.pendingPlay == null) return;
        GameRuntimeState.PendingPlay completed = state.pendingPlay;
        state.pendingPlay = null;
        state.discardPile.add(completed.actual);
        completed.defenses.forEach(defense -> state.discardPile.add(defense.actualCardId));

        if (!Boolean.FALSE.equals(completed.attackerTruthful)) {
            List<String> resolvedTargets = new ArrayList<>(completed.originalTargets);
            for (GameRuntimeState.PendingDefense defense : completed.defenses) {
                if (!resolvedTargets.contains(defense.playerId) || Boolean.FALSE.equals(defense.truthful)) continue;
                resolvedTargets.remove(defense.playerId);
                if ("wizard".equals(defense.declaredCardId) && defense.redirectTargetId != null
                        && !resolvedTargets.contains(defense.redirectTargetId)) {
                    resolvedTargets.add(defense.redirectTargetId);
                }
            }
            CardCatalog.CardSpec declaration = CardCatalog.ALL.stream()
                    .filter(card -> card.id().equals(completed.declared)).findFirst().orElseThrow();
            applyEffect(completed.actorId, declaration, resolvedTargets);
        }

        drawForEmptyHandDefenders(completed.emptyHandDefenders);
        finishMatchIfOnePlayerRemains();
        if (state.status == GameStatus.IN_GAME) {
            if (player(completed.actorId).health() <= 0) advanceTurnAfter(completed.actorId);
            else state.turn = new TurnState(state.turn.number(), completed.actorId, "RESOLVED");
            finishIfDeckExhausted();
        }
    }

    private void applyEffect(String actorId, CardCatalog.CardSpec spec, List<String> targets) {
        switch (spec.kind()) {
            case SINGLE_ATTACK, SELF_COST_ATTACK -> {
                if (spec.kind() == CardCatalog.Kind.SELF_COST_ATTACK) playerEffects.changeHealth(actorId, -1);
                targets.forEach(id -> playerEffects.changeHealth(id, -spec.amount()));
            }
            case AREA_ATTACK -> targets.forEach(id -> playerEffects.changeHealth(id, -spec.amount()));
            case SINGLE_STEAL, AREA_STEAL -> targets.forEach(id -> playerEffects.transferHealth(id, actorId, spec.amount()));
            case HEAL -> playerEffects.healFromSupply(actorId, spec.amount());
            case HEAL_AND_EXCHANGE -> { playerEffects.healFromSupply(actorId, 1); if (!targets.isEmpty()) playerEffects.exchangeOneCard(actorId, targets.getFirst()); }
            case REFLECT, DEFEND, NO_ABILITY -> { }
        }
    }


    private void drawForEmptyHandDefenders(List<String> defenderIds) {
        if (defenderIds.isEmpty() || state.cardDeck.isEmpty() || state.turnOrder.isEmpty()) return;
        int firstIndex = Math.max(0, state.turnOrder.indexOf(state.firstPlayerId));
        for (int offset = 0; offset < state.turnOrder.size() && !state.cardDeck.isEmpty(); offset++) {
            String playerId = state.turnOrder.get((firstIndex + offset) % state.turnOrder.size());
            Map.Entry<String, GamePlayer> entry = state.playersBySession.entrySet().stream()
                    .filter(candidate -> candidate.getValue().id().equals(playerId)).findFirst().orElse(null);
            if (entry == null) continue;
            GamePlayer defender = entry.getValue();
            if (!defenderIds.contains(defender.id()) || defender.health() <= 0 || !defender.cards().isEmpty()) continue;
            List<String> hand = new ArrayList<>();
            hand.add(state.drawCard());
            state.playersBySession.put(entry.getKey(), state.withCards(defender, hand));
        }
    }

    GamePlayer advanceTurnAfter(String currentPlayerId) {
        if (state.turnOrder.isEmpty()) return null;
        int currentIndex = state.turnOrder.indexOf(currentPlayerId);
        if (currentIndex < 0) return null;
        for (int offset = 1; offset <= state.turnOrder.size(); offset++) {
            String nextPlayerId = state.turnOrder.get((currentIndex + offset) % state.turnOrder.size());
            Map.Entry<String, GamePlayer> candidate = state.playersBySession.entrySet().stream()
                    .filter(entry -> entry.getValue().id().equals(nextPlayerId)).findFirst().orElse(null);
            if (candidate == null) continue;
            if (candidate.getValue().health() <= 0) continue;
            GamePlayer next = candidate.getValue();
            List<String> hand = new ArrayList<>(next.cards());
            if (!state.cardDeck.isEmpty()) hand.add(state.drawCard());
            next = state.withCards(next, hand);
            state.playersBySession.put(candidate.getKey(), next);
            state.turn = new TurnState(state.turn.number() + 1, next.id(), "START");
            finishIfDeckExhausted();
            return state.status == GameStatus.IN_GAME ? next : null;
        }
        return null;
    }

    private void finishIfDeckExhausted() {
        if (state.status == GameStatus.IN_GAME && state.cardDeck.isEmpty()) finishMatchByDeckExhaustion();
    }

    GameState playCard(String actorId, String cardId, List<String> targetIds) {
        if (state.status != GameStatus.IN_GAME) throw new IllegalStateException("게임 중에만 카드를 사용할 수 있습니다.");
        if (state.pendingPlay != null || !actorId.equals(state.turn.activePlayerId()) || !"START".equals(state.turn.phase()))
            throw new IllegalStateException("현재 턴에서 카드를 사용할 수 없습니다.");
        String actorSession = state.playersBySession.entrySet().stream()
                .filter(e -> e.getValue().id().equals(actorId)).map(Map.Entry::getKey).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
        GamePlayer actor = state.playersBySession.get(actorSession);
        if (actor.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 카드를 사용할 수 없습니다.");
        if (!actor.cards().contains(cardId)) throw new IllegalArgumentException("보유하지 않은 카드입니다.");
        List<String> selectedTargets = targetIds == null ? List.of() : new ArrayList<>(targetIds);
        CardCatalog.CardSpec spec = CardCatalog.ALL.stream().filter(c -> c.id().equals(cardId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("알 수 없는 카드입니다."));
        if (spec.kind() == CardCatalog.Kind.DEFEND || spec.kind() == CardCatalog.Kind.REFLECT
                || spec.kind() == CardCatalog.Kind.NO_ABILITY)
            throw new IllegalArgumentException("이 카드는 공격 선언으로 사용할 수 없습니다.");
        if (spec.kind() == CardCatalog.Kind.AREA_ATTACK || spec.kind() == CardCatalog.Kind.AREA_STEAL) {
            selectedTargets = state.playersBySession.values().stream().filter(p -> p.health() > 0).map(GamePlayer::id)
                    .filter(id -> !id.equals(actorId)).toList();
        } else if (spec.kind() == CardCatalog.Kind.SINGLE_ATTACK || spec.kind() == CardCatalog.Kind.SELF_COST_ATTACK
                || spec.kind() == CardCatalog.Kind.SINGLE_STEAL || spec.kind() == CardCatalog.Kind.HEAL_AND_EXCHANGE) {
            if (selectedTargets.size() != 1) throw new IllegalArgumentException("대상 플레이어 한 명을 지정해 주세요.");
            GamePlayer target = player(selectedTargets.getFirst());
            if (target.health() <= 0 || target.id().equals(actorId))
                throw new IllegalArgumentException("살아 있는 다른 플레이어를 대상으로 지정해 주세요.");
        } else {
            selectedTargets = List.of();
        }
        final List<String> targets = selectedTargets;
        List<String> hand = new ArrayList<>(actor.cards());
        hand.remove(cardId);
        state.playersBySession.put(actorSession, state.withCards(actor, hand));
        applyEffect(actorId, spec, targets);
        state.discardPile.add(cardId);
        finishMatchIfOnePlayerRemains();
        return state.currentState();
    }


    private void finishMatchIfOnePlayerRemains() {
        if (state.status != GameStatus.IN_GAME) return;
        List<GamePlayer> alivePlayers = state.playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (alivePlayers.size() == 1) {
            discardPendingCards();
            finishMatch(alivePlayers, MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하여 승리했습니다.");
        }
        else if (alivePlayers.isEmpty()) {
            discardPendingCards();
            state.status = GameStatus.LOBBY;
            state.turn = new TurnState(0, null, "WAITING");
        }
    }

    void discardPendingCards() {
        if (state.pendingPlay == null) return;
        state.discardPile.add(state.pendingPlay.actual);
        state.pendingPlay.defenses.forEach(defense -> state.discardPile.add(defense.actualCardId));
        state.pendingPlay = null;
    }

    void finishMatch(List<GamePlayer> winners, MatchResult.Reason reason, String message) {
        discardPendingCards();
        for (GamePlayer winner : winners) {
            LeaderboardEntry previous = state.leaderboardByPlayerId.get(winner.id());
            state.leaderboardByPlayerId.put(winner.id(), new LeaderboardEntry(winner.id(), winner.nickname(),
                    previous == null ? 1 : previous.wins() + 1,
                    previous == null ? 1 : previous.totalScore() + 1));
        }
        state.matchResult = new MatchResult(winners.stream().map(GamePlayer::id).toList(), reason, message);
        state.status = GameStatus.LOBBY;
        state.turn = new TurnState(0, null, "WAITING");
        state.pendingPlay = null;
    }

    private void finishMatchByDeckExhaustion() {
        List<GamePlayer> alivePlayers = state.playersBySession.values().stream()
                .filter(player -> player.health() > 0)
                .toList();
        GameMatchResolver.Outcome outcome = matchResolver.resolveDeckExhaustion(alivePlayers);
        finishMatch(outcome.winners(), outcome.reason(), outcome.message());
    }
}