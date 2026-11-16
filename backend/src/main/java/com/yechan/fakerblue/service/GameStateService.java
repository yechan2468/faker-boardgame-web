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
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class GameStateService {
    private static final int MAX_PLAYERS = 4;

    private final Map<String, GamePlayer> playersBySession = new LinkedHashMap<>();
    private final Map<String, LeaderboardEntry> leaderboardByPlayerId = new LinkedHashMap<>();
    private GameStatus status = GameStatus.LOBBY;
    private int supplyHealth;
    private final List<String> cardDeck = new ArrayList<>();
    private final List<String> discardPile = new ArrayList<>();
    private TurnState turn = new TurnState(0, null, "WAITING");
    private PendingPlay pendingPlay;
    private MatchResult matchResult;
    private String firstPlayerId;

    private static final Map<String, Integer> CARD_VALUES = Map.ofEntries(
            Map.entry("vampire-king", 13), Map.entry("assassin", 12), Map.entry("high-priest", 11),
            Map.entry("red-dragon", 10), Map.entry("warlock", 9), Map.entry("archer", 8),
            Map.entry("priest", 7), Map.entry("bomber", 6), Map.entry("vampire", 5),
            Map.entry("alchemist", 4), Map.entry("wizard", 3), Map.entry("defender", 2),
            Map.entry("clown", 1));

    public synchronized boolean registerHost(String sessionId, String playerId, String nickname) {
        if (playersBySession.values().stream().anyMatch(player -> player.role() == PlayerRole.HOST)) {
            return false;
        }

        playersBySession.put(sessionId, new GamePlayer(playerId, nickname, PlayerRole.HOST, true, 7, List.of()));
        return true;
    }

    public synchronized boolean registerPlayer(String sessionId, String playerId, String nickname) {
        boolean hostIsConnected = playersBySession.values().stream()
                .anyMatch(player -> player.role() == PlayerRole.HOST);
        if (!hostIsConnected || playersBySession.size() >= MAX_PLAYERS) {
            return false;
        }

        playersBySession.put(sessionId, new GamePlayer(playerId, nickname, PlayerRole.PLAYER, true, 7, List.of()));
        return true;
    }

    public synchronized GamePlayer removePlayer(String sessionId) {
        List<String> orderBeforeRemoval = new ArrayList<>(playersBySession.keySet());
        int removedIndex = orderBeforeRemoval.indexOf(sessionId);
        GamePlayer removed = playersBySession.remove(sessionId);
        if (removed == null || status != GameStatus.IN_GAME) return removed;

        if (pendingPlay != null) {
            if (pendingPlay.actorId.equals(removed.id()) || removed.id().equals(turn.activePlayerId())) discardPendingCards();
            else {
                pendingPlay.targets.remove(removed.id());
                pendingPlay.defensePasses.remove(removed.id());
                pendingPlay.suspicionPasses.remove(removed.id());
            }
        }

        if (playersBySession.values().stream().noneMatch(p -> p.health() > 0)) {
            status = GameStatus.LOBBY;
            turn = new TurnState(0, null, "WAITING");
            pendingPlay = null;
            matchResult = null;
            return removed;
        }

        List<GamePlayer> alivePlayers = playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (alivePlayers.size() == 1) {
            finishMatch(alivePlayers, MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하거나 나가서 승리했습니다.");
            return removed;
        }

        advancePendingAfterPlayerDeparture();

        if (removed.id().equals(turn.activePlayerId())) {
            List<Map.Entry<String, GamePlayer>> remaining = new ArrayList<>(playersBySession.entrySet());
            int nextIndex = Math.min(Math.max(removedIndex, 0), remaining.size() - 1);
            GamePlayer next = null;
            String nextSession = null;
            for (int offset = 0; offset < remaining.size(); offset++) {
                Map.Entry<String, GamePlayer> candidate = remaining.get((nextIndex + offset) % remaining.size());
                if (candidate.getValue().health() > 0) {
                    next = candidate.getValue();
                    nextSession = candidate.getKey();
                    break;
                }
            }
            if (next != null) {
                List<String> hand = new ArrayList<>(next.cards());
                if (!cardDeck.isEmpty()) hand.add(drawCard());
                next = withCards(next, hand);
                playersBySession.put(nextSession, next);
                turn = new TurnState(turn.number() + 1, next.id(), "START");
                if (cardDeck.isEmpty()) finishMatchByDeckExhaustion();
            }
        }
        return removed;
    }

    public synchronized GameState currentState() {
        return new GameState(
                status,
                new ArrayList<>(playersBySession.values()),
                leaderboard(), supplyHealth, cardDeck, discardPile, turn, matchResult);
    }

    public synchronized GameStateView publicState() {
        return publicState(null);
    }

    public synchronized GameStateView publicState(String viewerId) {
        GameStateView.PendingActionView pendingAction = pendingPlay == null ? null
                : new GameStateView.PendingActionView(pendingPlay.actorId, pendingPlay.declared,
                        pendingPlay.attackerTruthful == null ? null : pendingPlay.actual,
                        pendingPlay.targets, pendingPlay.attackerTruthful,
                        List.copyOf(pendingPlay.defensePasses), List.copyOf(pendingPlay.suspicionPasses),
                        java.util.stream.IntStream.range(0, pendingPlay.defenses.size())
                                .mapToObj(index -> {
                                    PendingDefense defense = pendingPlay.defenses.get(index);
                                    return new GameStateView.DefenseView(defense.index, defense.playerId,
                                            defense.declaredCardId,
                                            defense.truthful == null ? null : defense.actualCardId,
                                            defense.redirectTargetId, defense.truthful);
                                })
                                .toList());
        return GameStateView.from(currentState(), leaderboard(), viewerId, pendingAction);
    }

    public synchronized List<String> playerHand(String playerId) {
        return List.copyOf(player(playerId).cards());
    }

    public synchronized List<LeaderboardEntry> leaderboard() {
        return leaderboardByPlayerId.values().stream()
                .sorted(java.util.Comparator.comparingInt(LeaderboardEntry::totalScore).reversed()
                        .thenComparing(java.util.Comparator.comparingInt(LeaderboardEntry::wins).reversed())
                        .thenComparing(LeaderboardEntry::nickname, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public synchronized void startGame() {
        if (status == GameStatus.IN_GAME) throw new IllegalStateException("이미 게임이 진행 중입니다.");
        if (playersBySession.size() < 2 || playersBySession.size() > MAX_PLAYERS)
            throw new IllegalStateException("게임은 2~4명으로 시작할 수 있습니다.");
        status = GameStatus.IN_GAME;
        matchResult = null;
        supplyHealth = 2;
        cardDeck.clear();
        discardPile.clear();
        CardCatalog.ALL.forEach(card -> { for (int i = 0; i < card.copies(); i++) cardDeck.add(card.id()); });
        java.util.Collections.shuffle(cardDeck);
        playersBySession.replaceAll((session, player) -> new GamePlayer(player.id(), player.nickname(),
                player.role(), true, 7, List.of(drawCard())));
        GamePlayer firstPlayer = playersBySession.values().stream().findFirst().orElseThrow();
        String firstSession = playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(firstPlayer.id())).findFirst().orElseThrow().getKey();
        List<String> firstHand = new ArrayList<>(firstPlayer.cards());
        if (!cardDeck.isEmpty()) firstHand.add(drawCard());
        playersBySession.put(firstSession, withCards(firstPlayer, firstHand));
        firstPlayerId = firstPlayer.id();
        turn = new TurnState(1, firstPlayer.id(), "START");
        pendingPlay = null;
    }

    public synchronized void endGame() {
        discardPendingCards();
        status = GameStatus.LOBBY;
        turn = new TurnState(0, null, "WAITING");
        pendingPlay = null;
        matchResult = null;
    }

    public synchronized GamePlayer endTurn(String playerId) {
        if (status != GameStatus.IN_GAME) throw new IllegalStateException("게임 중이 아닙니다.");
        if (pendingPlay != null) throw new IllegalStateException("제출된 카드의 판정이 끝나지 않았습니다.");
        if (!playerId.equals(turn.activePlayerId())) throw new IllegalStateException("현재 턴의 플레이어가 아닙니다.");
        if (player(playerId).health() <= 0) throw new IllegalStateException("탈락한 플레이어는 턴을 진행할 수 없습니다.");
        if (!"RESOLVED".equals(turn.phase())) throw new IllegalStateException("현재 턴의 카드 판정이 끝나지 않았습니다.");
        List<GamePlayer> players = playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (players.isEmpty()) throw new IllegalStateException("플레이어가 없습니다.");
        if (players.size() == 1) {
            finishMatch(List.of(players.getFirst()), MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하여 승리했습니다.");
            return null;
        }
        return advanceTurnAfter(playerId);
    }

    public synchronized Declaration submitBluff(String actorId, String actualCardId, String declaredCardId,
            List<String> targets) {
        if (status != GameStatus.IN_GAME || pendingPlay != null) throw new IllegalStateException("현재 카드를 제출할 수 없습니다.");
        if (!CardCatalog.ALL.stream().anyMatch(card -> card.id().equals(declaredCardId))) throw new IllegalArgumentException("선언한 카드를 찾을 수 없습니다.");
        GamePlayer actor = player(actorId);
        if (!actorId.equals(turn.activePlayerId())) throw new IllegalStateException("현재 턴의 플레이어가 아닙니다.");
        if (!"START".equals(turn.phase())) throw new IllegalStateException("현재 턴에서 카드를 제출할 수 없습니다.");
        if (actor.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 카드를 제출할 수 없습니다.");
        if (!actor.cards().contains(actualCardId)) throw new IllegalArgumentException("보유하지 않은 카드입니다.");
        CardCatalog.CardSpec declaration = CardCatalog.ALL.stream().filter(c -> c.id().equals(declaredCardId)).findFirst().orElseThrow();
        if (declaration.kind() == CardCatalog.Kind.DEFEND || declaration.kind() == CardCatalog.Kind.REFLECT
                || declaration.kind() == CardCatalog.Kind.NO_ABILITY ||
                (actualCardId.equals("clown") && declaredCardId.equals("clown")))
            throw new IllegalArgumentException("이 카드는 공격 선언으로 사용할 수 없습니다.");
        List<String> selectedTargets = targets == null ? new ArrayList<>() : new ArrayList<>(targets);
        if (declaration.kind() == CardCatalog.Kind.AREA_ATTACK || declaration.kind() == CardCatalog.Kind.AREA_STEAL) {
            selectedTargets = playersBySession.values().stream().filter(p -> p.health() > 0)
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
        pendingPlay = new PendingPlay(actorId, actualCardId, declaredCardId, new ArrayList<>(selectedTargets));
        List<String> remainingHand = new ArrayList<>(actor.cards());
        remainingHand.remove(actualCardId);
        String actorSession = playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(actorId))
                .map(Map.Entry::getKey).findFirst().orElseThrow();
        playersBySession.put(actorSession, withCards(actor, remainingHand));
        boolean defenseWindow = declaration.kind() != CardCatalog.Kind.HEAL_AND_EXCHANGE
                && !selectedTargets.isEmpty();
        turn = new TurnState(turn.number(), actorId, defenseWindow ? "DEFENSE" : "SUSPICION");
        return new Declaration(actorId, declaredCardId, List.copyOf(pendingPlay.targets));
    }

    public synchronized Resolution challenge(String challengerId) {
        return challenge(challengerId, null, null);
    }

    public synchronized Resolution challenge(String challengerId, String challengedPlayerId) {
        return challenge(challengerId, challengedPlayerId, null);
    }

    public synchronized Resolution challenge(String challengerId, String challengedPlayerId, Integer defenseIndex) {
        if (pendingPlay == null) throw new IllegalStateException("의심할 카드가 없습니다.");
        if (!"SUSPICION".equals(turn.phase())) throw new IllegalStateException("방어 단계가 끝난 뒤 의심할 수 있습니다.");
        GamePlayer challenger = player(challengerId);
        if (challenger.health() <= 0) throw new IllegalStateException("생존 플레이어만 카드를 의심할 수 있습니다.");
        String actorId = pendingPlay.actorId;
        String targetId = challengedPlayerId == null ? actorId : challengedPlayerId;
        boolean challengingAttack = defenseIndex == null && targetId.equals(actorId);
        PendingDefense defense = challengingAttack ? null : pendingPlay.defenses.stream()
                .filter(candidate -> candidate.playerId.equals(targetId)
                        && (defenseIndex == null || candidate.index == defenseIndex))
                .findFirst().orElse(null);
        if (challengingAttack) {
            if (challengerId.equals(actorId)) throw new IllegalStateException("자신이 제출한 카드는 의심할 수 없습니다.");
            if (pendingPlay.attackerTruthful != null) throw new IllegalStateException("이미 의심한 카드입니다.");
        } else {
            if (defense == null) throw new IllegalArgumentException("의심할 카드 제출을 찾을 수 없습니다.");
            if (challengerId.equals(targetId)) throw new IllegalStateException("자신이 제출한 카드는 의심할 수 없습니다.");
            if (defense.truthful != null) throw new IllegalStateException("이미 의심한 카드입니다.");
        }

        boolean truthful = challengingAttack
                ? pendingPlay.actual.equals(pendingPlay.declared)
                : defense.actualCardId.equals(defense.declaredCardId);
        String actualCardId = challengingAttack ? pendingPlay.actual : defense.actualCardId;
        String declaredCardId = challengingAttack ? pendingPlay.declared : defense.declaredCardId;
        if (challengingAttack) {
            pendingPlay.attackerTruthful = truthful;
            if (truthful) changeHealth(challengerId, -2);
            else {
                changeHealth(actorId, -2);
                healFromSupply(challengerId, 2);
            }
        } else {
            defense.truthful = truthful;
            if (truthful) changeHealth(challengerId, -2);
            else {
                changeHealth(defense.playerId, -2);
                healFromSupply(challengerId, 2);
            }
        }

        if (status == GameStatus.IN_GAME && pendingPlay != null) {
            pendingPlay.suspicionPasses.clear();
            long aliveCount = playersBySession.values().stream().filter(candidate -> candidate.health() > 0).count();
            if (aliveCount <= 1 || allPendingCardsWereChallenged()) finishPendingPlay();
        }
        return new Resolution(truthful, challengerId, actorId, targetId, declaredCardId, actualCardId,
                challengingAttack ? -1 : defense.index);
    }

    public synchronized void passSuspicion(String playerId) {
        if (pendingPlay == null || !"SUSPICION".equals(turn.phase()))
            throw new IllegalStateException("현재 의심 단계를 진행할 수 없습니다.");
        GamePlayer passingPlayer = player(playerId);
        if (passingPlayer.health() <= 0) throw new IllegalStateException("생존 플레이어만 의심을 마칠 수 있습니다.");
        pendingPlay.suspicionPasses.add(playerId);
        List<String> alivePlayerIds = playersBySession.values().stream()
                .filter(candidate -> candidate.health() > 0).map(GamePlayer::id).toList();
        if (pendingPlay.suspicionPasses.containsAll(alivePlayerIds)) finishPendingPlay();
    }

    public synchronized void passDefense(String playerId) {
        if (pendingPlay == null || !"DEFENSE".equals(turn.phase()))
            throw new IllegalStateException("현재 방어 단계를 진행할 수 없습니다.");
        GamePlayer defender = player(playerId);
        if (defender.health() <= 0) throw new IllegalStateException("생존 플레이어만 방어를 선택할 수 있습니다.");
        if (!pendingPlay.targets.contains(playerId)) throw new IllegalStateException("방어할 공격 대상이 아닙니다.");
        pendingPlay.defensePasses.add(playerId);
        advanceToSuspicionIfDefenseComplete();
    }

    public synchronized GameState defendPending(String defenderId, String actualCardId, String defenseCardId,
            String redirectTargetId) {
        if (pendingPlay == null) throw new IllegalStateException("방어할 카드가 없습니다.");
        if (!"DEFENSE".equals(turn.phase())) throw new IllegalStateException("의심 단계에서는 방어할 수 없습니다.");
        if (pendingPlay.declared.equals("alchemist")) throw new IllegalStateException("연금술사의 교환은 방어할 수 없습니다.");
        GamePlayer defender = player(defenderId);
        if (defender.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 방어할 수 없습니다.");
        if (!pendingPlay.targets.contains(defenderId)) throw new IllegalArgumentException("공격 대상이 아닙니다.");
        if (!"defender".equals(defenseCardId) && !"wizard".equals(defenseCardId))
            throw new IllegalArgumentException("방패병 또는 마법사만 방어할 수 있습니다.");
        CardCatalog.CardSpec declared = CardCatalog.ALL.stream().filter(c -> c.id().equals(pendingPlay.declared)).findFirst().orElseThrow();
        if (declared.kind() != CardCatalog.Kind.SINGLE_ATTACK && declared.kind() != CardCatalog.Kind.AREA_ATTACK
                && declared.kind() != CardCatalog.Kind.SELF_COST_ATTACK && declared.kind() != CardCatalog.Kind.SINGLE_STEAL
                && declared.kind() != CardCatalog.Kind.AREA_STEAL)
            throw new IllegalStateException("이 카드는 방어할 수 있는 공격이 아닙니다.");
        if (!defender.cards().contains(actualCardId)) throw new IllegalArgumentException("보유하지 않은 방어 카드입니다.");
        if (defenseCardId.equals("wizard") && (redirectTargetId == null || defenderId.equals(redirectTargetId) ||
                playersBySession.values().stream().noneMatch(p -> p.id().equals(redirectTargetId) && p.health() > 0)
                || (pendingPlay.targets.contains(redirectTargetId) && !redirectTargetId.equals(defenderId))))
            throw new IllegalArgumentException("반사할 대상을 지정해 주세요.");
        List<String> hand = new ArrayList<>(defender.cards()); hand.remove(actualCardId);
        if (hand.isEmpty()) pendingPlay.emptyHandDefenders.add(defenderId);
        pendingPlay.defenses.add(new PendingDefense(pendingPlay.defenses.size(), defenderId,
                actualCardId, defenseCardId, redirectTargetId));
        String session = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(defenderId)).findFirst().orElseThrow().getKey();
        playersBySession.put(session, withCards(defender, hand));
        pendingPlay.targets.remove(defenderId);
        if (defenseCardId.equals("wizard")) {
            pendingPlay.targets.add(redirectTargetId);
            pendingPlay.defensePasses.remove(redirectTargetId);
        }
        advanceToSuspicionIfDefenseComplete();
        return currentState();
    }

    private void advanceToSuspicionIfDefenseComplete() {
        if (pendingPlay != null && "DEFENSE".equals(turn.phase())
                && pendingPlay.targets.stream().allMatch(pendingPlay.defensePasses::contains)) {
            pendingPlay.suspicionPasses.clear();
            turn = new TurnState(turn.number(), turn.activePlayerId(), "SUSPICION");
        }
    }

    private void advancePendingAfterPlayerDeparture() {
        if (pendingPlay == null) return;
        advanceToSuspicionIfDefenseComplete();
        if (!"SUSPICION".equals(turn.phase())) return;
        List<String> alivePlayerIds = playersBySession.values().stream()
                .filter(candidate -> candidate.health() > 0).map(GamePlayer::id).toList();
        if (pendingPlay.suspicionPasses.containsAll(alivePlayerIds)) finishPendingPlay();
    }

    public record Declaration(String actorId, String declaredCardId, List<String> targetIds) {}
    public record Resolution(Boolean truthful, String challengerId, String actorId, String challengedPlayerId,
            String declaredCardId, String actualCardId, int defenseIndex) {}
    private static class PendingDefense {
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
    private static class PendingPlay {
        final String actorId, actual, declared;
        final List<String> originalTargets, targets;
        final Set<String> defensePasses = new LinkedHashSet<>();
        final Set<String> suspicionPasses = new LinkedHashSet<>();
        final List<String> emptyHandDefenders = new ArrayList<>();
        final List<PendingDefense> defenses = new ArrayList<>();
        Boolean attackerTruthful;

        PendingPlay(String actorId, String actual, String declared, List<String> targets) {
            this.actorId = actorId; this.actual = actual; this.declared = declared; this.targets = targets;
            this.originalTargets = new ArrayList<>(targets);
        }
    }

    private GamePlayer player(String id) {
        return playersBySession.values().stream().filter(p -> p.id().equals(id)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }

    private boolean allPendingCardsWereChallenged() {
        return pendingPlay != null && pendingPlay.attackerTruthful != null
                && pendingPlay.defenses.stream().allMatch(defense -> defense.truthful != null);
    }

    private void finishPendingPlay() {
        if (pendingPlay == null) return;
        PendingPlay completed = pendingPlay;
        pendingPlay = null;
        discardPile.add(completed.actual);
        completed.defenses.forEach(defense -> discardPile.add(defense.actualCardId));

        if (!Boolean.FALSE.equals(completed.attackerTruthful)) {
            List<String> resolvedTargets = new ArrayList<>(completed.originalTargets);
            for (PendingDefense defense : completed.defenses) {
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
        if (status == GameStatus.IN_GAME) {
            if (player(completed.actorId).health() <= 0) advanceTurnAfter(completed.actorId);
            else turn = new TurnState(turn.number(), completed.actorId, "RESOLVED");
            finishIfDeckExhausted();
        }
    }

    private void applyEffect(String actorId, CardCatalog.CardSpec spec, List<String> targets) {
        switch (spec.kind()) {
            case SINGLE_ATTACK, SELF_COST_ATTACK -> {
                if (spec.kind() == CardCatalog.Kind.SELF_COST_ATTACK) changeHealth(actorId, -1);
                targets.forEach(id -> changeHealth(id, -spec.amount()));
            }
            case AREA_ATTACK -> targets.forEach(id -> changeHealth(id, -spec.amount()));
            case SINGLE_STEAL, AREA_STEAL -> targets.forEach(id -> transferHealth(id, actorId, spec.amount()));
            case HEAL -> healFromSupply(actorId, spec.amount());
            case HEAL_AND_EXCHANGE -> { healFromSupply(actorId, 1); if (!targets.isEmpty()) exchangeOneCard(actorId, targets.getFirst()); }
            case REFLECT, DEFEND, NO_ABILITY -> { }
        }
    }

    private String drawCard() { return cardDeck.isEmpty() ? "" : cardDeck.remove(cardDeck.size() - 1); }

    private void drawForEmptyHandDefenders(List<String> defenderIds) {
        if (defenderIds.isEmpty() || cardDeck.isEmpty()) return;
        List<Map.Entry<String, GamePlayer>> order = new ArrayList<>(playersBySession.entrySet());
        int firstIndex = 0;
        for (int i = 0; i < order.size(); i++) {
            if (order.get(i).getValue().id().equals(firstPlayerId)) {
                firstIndex = i;
                break;
            }
        }
        for (int offset = 0; offset < order.size() && !cardDeck.isEmpty(); offset++) {
            Map.Entry<String, GamePlayer> entry = order.get((firstIndex + offset) % order.size());
            GamePlayer defender = entry.getValue();
            if (!defenderIds.contains(defender.id()) || defender.health() <= 0 || !defender.cards().isEmpty()) continue;
            List<String> hand = new ArrayList<>();
            hand.add(drawCard());
            playersBySession.put(entry.getKey(), withCards(defender, hand));
        }
    }

    private GamePlayer advanceTurnAfter(String currentPlayerId) {
        List<Map.Entry<String, GamePlayer>> order = new ArrayList<>(playersBySession.entrySet());
        int currentIndex = -1;
        for (int i = 0; i < order.size(); i++) {
            if (order.get(i).getValue().id().equals(currentPlayerId)) {
                currentIndex = i;
                break;
            }
        }
        for (int offset = 1; offset <= order.size(); offset++) {
            Map.Entry<String, GamePlayer> candidate = order.get((currentIndex + offset + order.size()) % order.size());
            if (candidate.getValue().health() <= 0) continue;
            GamePlayer next = candidate.getValue();
            List<String> hand = new ArrayList<>(next.cards());
            if (!cardDeck.isEmpty()) hand.add(drawCard());
            next = withCards(next, hand);
            playersBySession.put(candidate.getKey(), next);
            turn = new TurnState(turn.number() + 1, next.id(), "START");
            finishIfDeckExhausted();
            return status == GameStatus.IN_GAME ? next : null;
        }
        return null;
    }

    private void finishIfDeckExhausted() {
        if (status == GameStatus.IN_GAME && cardDeck.isEmpty()) finishMatchByDeckExhaustion();
    }

    public synchronized GameState playCard(String actorId, String cardId, List<String> targetIds) {
        if (status != GameStatus.IN_GAME) throw new IllegalStateException("게임 중에만 카드를 사용할 수 있습니다.");
        if (pendingPlay != null || !actorId.equals(turn.activePlayerId()) || !"START".equals(turn.phase()))
            throw new IllegalStateException("현재 턴에서 카드를 사용할 수 없습니다.");
        String actorSession = playersBySession.entrySet().stream()
                .filter(e -> e.getValue().id().equals(actorId)).map(Map.Entry::getKey).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
        GamePlayer actor = playersBySession.get(actorSession);
        if (actor.health() <= 0) throw new IllegalStateException("탈락한 플레이어는 카드를 사용할 수 없습니다.");
        if (!actor.cards().contains(cardId)) throw new IllegalArgumentException("보유하지 않은 카드입니다.");
        List<String> selectedTargets = targetIds == null ? List.of() : new ArrayList<>(targetIds);
        CardCatalog.CardSpec spec = CardCatalog.ALL.stream().filter(c -> c.id().equals(cardId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("알 수 없는 카드입니다."));
        if (spec.kind() == CardCatalog.Kind.DEFEND || spec.kind() == CardCatalog.Kind.REFLECT
                || spec.kind() == CardCatalog.Kind.NO_ABILITY)
            throw new IllegalArgumentException("이 카드는 공격 선언으로 사용할 수 없습니다.");
        if (spec.kind() == CardCatalog.Kind.AREA_ATTACK || spec.kind() == CardCatalog.Kind.AREA_STEAL) {
            selectedTargets = playersBySession.values().stream().filter(p -> p.health() > 0).map(GamePlayer::id)
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
        playersBySession.put(actorSession, withCards(actor, hand));
        applyEffect(actorId, spec, targets);
        discardPile.add(cardId);
        finishMatchIfOnePlayerRemains();
        return currentState();
    }

    private GamePlayer withCards(GamePlayer p, List<String> cards) {
        return new GamePlayer(p.id(), p.nickname(), p.role(), p.connected(), p.health(), cards);
    }

    private int changeHealth(String id, int delta) {
        var entry = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(id)).findFirst();
        if (entry.isEmpty()) return 0;
        GamePlayer p = entry.get().getValue();
        if (p.health() <= 0) return 0;
        int actual = delta < 0 ? -Math.min(p.health(), -delta) : delta;
        int remainingHealth = p.health() + actual;
        if (actual < 0) supplyHealth += -actual;
        List<String> remainingCards = p.cards();
        if (remainingHealth == 0 && p.health() > 0) {
            discardPile.addAll(p.cards());
            remainingCards = List.of();
        }
        playersBySession.put(entry.get().getKey(), new GamePlayer(p.id(), p.nickname(), p.role(), p.connected(),
                remainingHealth, remainingCards));
        return -actual;
    }

    private int transferHealth(String fromId, String toId, int amount) {
        if (fromId.equals(toId) || amount <= 0) return 0;
        var sourceEntry = playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(fromId)).findFirst();
        var targetEntry = playersBySession.entrySet().stream()
                .filter(entry -> entry.getValue().id().equals(toId)).findFirst();
        if (sourceEntry.isEmpty() || targetEntry.isEmpty()) return 0;
        GamePlayer source = sourceEntry.get().getValue();
        GamePlayer target = targetEntry.get().getValue();
        if (source.health() <= 0 || target.health() <= 0) return 0;
        int transferred = Math.min(source.health(), amount);
        int remainingSourceHealth = source.health() - transferred;
        List<String> sourceCards = source.cards();
        if (remainingSourceHealth == 0) {
            discardPile.addAll(source.cards());
            sourceCards = List.of();
        }
        playersBySession.put(sourceEntry.get().getKey(), new GamePlayer(source.id(), source.nickname(), source.role(),
                source.connected(), remainingSourceHealth, sourceCards));
        playersBySession.put(targetEntry.get().getKey(), new GamePlayer(target.id(), target.nickname(), target.role(),
                target.connected(), target.health() + transferred, target.cards()));
        return transferred;
    }

    private void finishMatchIfOnePlayerRemains() {
        if (status != GameStatus.IN_GAME) return;
        List<GamePlayer> alivePlayers = playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (alivePlayers.size() == 1) {
            discardPendingCards();
            finishMatch(alivePlayers, MatchResult.Reason.LAST_PLAYER_STANDING,
                    "다른 모든 플레이어가 탈락하여 승리했습니다.");
        }
        else if (alivePlayers.isEmpty()) {
            discardPendingCards();
            status = GameStatus.LOBBY;
            turn = new TurnState(0, null, "WAITING");
        }
    }

    private void discardPendingCards() {
        if (pendingPlay == null) return;
        discardPile.add(pendingPlay.actual);
        pendingPlay.defenses.forEach(defense -> discardPile.add(defense.actualCardId));
        pendingPlay = null;
    }

    private void finishMatch(List<GamePlayer> winners, MatchResult.Reason reason, String message) {
        discardPendingCards();
        for (GamePlayer winner : winners) {
            LeaderboardEntry previous = leaderboardByPlayerId.get(winner.id());
            leaderboardByPlayerId.put(winner.id(), new LeaderboardEntry(winner.id(), winner.nickname(),
                    previous == null ? 1 : previous.wins() + 1,
                    previous == null ? 1 : previous.totalScore() + 1));
        }
        matchResult = new MatchResult(winners.stream().map(GamePlayer::id).toList(), reason, message);
        status = GameStatus.LOBBY;
        turn = new TurnState(0, null, "WAITING");
        pendingPlay = null;
    }

    private void finishMatchByDeckExhaustion() {
        List<GamePlayer> alivePlayers = playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        int highestHealth = alivePlayers.stream().mapToInt(GamePlayer::health).max().orElse(0);
        List<GamePlayer> healthLeaders = alivePlayers.stream().filter(p -> p.health() == highestHealth).toList();
        if (healthLeaders.size() == 1) {
            finishMatch(healthLeaders, MatchResult.Reason.CARD_DECK_EMPTY_HEALTH,
                    "카드 더미가 모두 소진되어 체력 토큰이 가장 많은 플레이어가 승리했습니다.");
            return;
        }

        int maxCardValue = healthLeaders.stream().mapToInt(this::highestCardValue).max().orElse(0);
        List<GamePlayer> cardLeaders = healthLeaders.stream()
                .filter(p -> highestCardValue(p) == maxCardValue).toList();
        MatchResult.Reason reason = cardLeaders.size() == healthLeaders.size()
                ? MatchResult.Reason.CARD_DECK_EMPTY_TIE : MatchResult.Reason.CARD_DECK_EMPTY_CARD_VALUE;
        String message = reason == MatchResult.Reason.CARD_DECK_EMPTY_TIE
                ? "카드 더미가 모두 소진되었고 체력 토큰과 카드 가치가 같아 공동 승리했습니다."
                : "카드 더미가 모두 소진되고 체력 토큰이 같아 보유 카드 가치가 가장 높은 플레이어가 승리했습니다.";
        finishMatch(cardLeaders, reason, message);
    }

    private int highestCardValue(GamePlayer player) {
        return player.cards().stream().mapToInt(cardId -> CARD_VALUES.getOrDefault(cardId, 0)).max().orElse(0);
    }

    private void healFromSupply(String playerId, int amount) {
        if (player(playerId).health() <= 0) return;
        int healed = Math.min(supplyHealth, amount);
        if (healed > 0) {
            supplyHealth -= healed;
            changeHealth(playerId, healed);
        }
    }

    private void exchangeOneCard(String actorId, String targetId) {
        var actorEntry = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(actorId)).findFirst();
        var targetEntry = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(targetId)).findFirst();
        if (actorEntry.isEmpty() || targetEntry.isEmpty()) return;
        GamePlayer a = actorEntry.get().getValue(), t = targetEntry.get().getValue();
        if (a.cards().isEmpty() || t.cards().isEmpty()) return;
        List<String> ah = new ArrayList<>(a.cards()), th = new ArrayList<>(t.cards());
        String card = ah.removeLast(); ah.add(th.removeLast()); th.add(card);
        playersBySession.put(actorEntry.get().getKey(), withCards(a, ah));
        playersBySession.put(targetEntry.get().getKey(), withCards(t, th));
    }

    public synchronized void resetAfterHostLogout() {
        playersBySession.clear();
        status = GameStatus.LOBBY;
        supplyHealth = 0;
        cardDeck.clear();
        discardPile.clear();
        turn = new TurnState(0, null, "WAITING");
        pendingPlay = null;
        matchResult = null;
        firstPlayerId = null;
    }
}
