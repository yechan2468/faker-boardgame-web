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
import java.util.List;
import java.util.Map;
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
            if (pendingPlay.actorId.equals(removed.id()) || removed.id().equals(turn.activePlayerId())) pendingPlay = null;
            else pendingPlay.targets.remove(removed.id());
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
                        pendingPlay.targets, pendingPlay.defenses.stream()
                                .map(defense -> new GameStateView.DefenseView(defense.playerId,
                                        defense.declaredCardId, defense.redirectTargetId))
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
        turn = new TurnState(turn.number(), actorId, "SUSPICION");
        return new Declaration(actorId, declaredCardId, List.copyOf(pendingPlay.targets));
    }

    public synchronized Resolution challenge(String challengerId) {
        return challenge(challengerId, null);
    }

    public synchronized Resolution challenge(String challengerId, String challengedPlayerId) {
        if (pendingPlay == null) throw new IllegalStateException("의심할 카드가 없습니다.");
        GamePlayer challenger = player(challengerId);
        if (challenger.health() <= 0 || pendingPlay.actorId.equals(challengerId))
            throw new IllegalStateException("다른 생존 플레이어만 카드를 의심할 수 있습니다.");
        String actorId = pendingPlay.actorId;
        String targetId = challengedPlayerId == null ? actorId : challengedPlayerId;
        PendingDefense defense = pendingPlay.defenses.stream()
                .filter(candidate -> candidate.playerId.equals(targetId)).findFirst().orElse(null);
        boolean challengingAttack = targetId.equals(actorId);
        if (!challengingAttack && defense == null)
            throw new IllegalArgumentException("의심할 카드 제출을 찾을 수 없습니다.");
        if (!challengingAttack && challengerId.equals(targetId))
            throw new IllegalStateException("자신이 제출한 카드는 의심할 수 없습니다.");
        boolean truthful = challengingAttack
                ? pendingPlay.actual.equals(pendingPlay.declared)
                : defense.actualCardId.equals(defense.declaredCardId);
        String actualCardId = challengingAttack ? pendingPlay.actual : defense.actualCardId;
        String declaredCardId = challengingAttack ? pendingPlay.declared : defense.declaredCardId;
        List<String> emptyHandDefenders = List.copyOf(pendingPlay.emptyHandDefenders);
        if (challengingAttack && !truthful) {
            GamePlayer actor = player(pendingPlay.actorId);
            List<String> hand = new ArrayList<>(actor.cards());
            hand.remove(pendingPlay.actual);
            String session = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(actor.id())).findFirst().orElseThrow().getKey();
            playersBySession.put(session, withCards(actor, hand));
            discardPile.add(pendingPlay.actual);
        } else {
            if (!challengingAttack && !truthful) {
                pendingPlay.targets.remove(defense.redirectTargetId);
                if (!pendingPlay.targets.contains(defense.playerId)) pendingPlay.targets.add(defense.playerId);
            }
            resolveCard(actorId, pendingPlay.declared, List.copyOf(pendingPlay.targets));
        }
        pendingPlay = null;
        if (status == GameStatus.IN_GAME) drawForEmptyHandDefenders(emptyHandDefenders);
        if (status == GameStatus.IN_GAME) {
            if (player(actorId).health() <= 0) advanceTurnAfter(actorId);
            else turn = new TurnState(turn.number(), actorId, "RESOLVED");
            finishIfDeckExhausted();
        }
        return new Resolution(truthful, challengerId, actorId, targetId, declaredCardId, actualCardId);
    }

    public synchronized Resolution acceptDeclaration(String accepterId) {
        if (pendingPlay == null) throw new IllegalStateException("확정할 카드가 없습니다.");
        GamePlayer accepter = player(accepterId);
        if (accepter.health() <= 0 || pendingPlay.actorId.equals(accepterId))
            throw new IllegalStateException("다른 생존 플레이어만 선언을 확정할 수 있습니다.");
        String actorId = pendingPlay.actorId;
        String declared = pendingPlay.declared;
        List<String> emptyHandDefenders = List.copyOf(pendingPlay.emptyHandDefenders);
        resolveCard(actorId, declared, List.copyOf(pendingPlay.targets));
        pendingPlay = null;
        if (status == GameStatus.IN_GAME) drawForEmptyHandDefenders(emptyHandDefenders);
        if (status == GameStatus.IN_GAME) {
            if (player(actorId).health() <= 0) advanceTurnAfter(actorId);
            else turn = new TurnState(turn.number(), actorId, "RESOLVED");
            finishIfDeckExhausted();
        }
        return new Resolution(null, null, actorId, null, declared, null);
    }

    public synchronized GameState defendPending(String defenderId, String actualCardId, String defenseCardId,
            String redirectTargetId) {
        if (pendingPlay == null) throw new IllegalStateException("방어할 카드가 없습니다.");
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
        pendingPlay.defenses.add(new PendingDefense(defenderId, actualCardId, defenseCardId, redirectTargetId));
        String session = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(defenderId)).findFirst().orElseThrow().getKey();
        playersBySession.put(session, withCards(defender, hand));
        pendingPlay.targets.remove(defenderId);
        if (defenseCardId.equals("wizard")) {
            pendingPlay.targets.add(redirectTargetId);
        }
        discardPile.add(actualCardId);
        return currentState();
    }

    public record Declaration(String actorId, String declaredCardId, List<String> targetIds) {}
    public record Resolution(Boolean truthful, String challengerId, String actorId, String challengedPlayerId,
            String declaredCardId, String actualCardId) {}
    private record PendingDefense(String playerId, String actualCardId, String declaredCardId,
            String redirectTargetId) {}
    private static class PendingPlay {
        final String actorId, actual, declared; final List<String> targets;
        final List<String> emptyHandDefenders = new ArrayList<>();
        final List<PendingDefense> defenses = new ArrayList<>();
        PendingPlay(String actorId, String actual, String declared, List<String> targets) {
            this.actorId = actorId; this.actual = actual; this.declared = declared; this.targets = targets;
        }
    }

    private GamePlayer player(String id) {
        return playersBySession.values().stream().filter(p -> p.id().equals(id)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }

    private void resolveCard(String actorId, String cardId, List<String> targets) {
        GamePlayer actor = player(actorId);
        List<String> hand = new ArrayList<>(actor.cards());
        String actual = pendingPlay.actual;
        hand.remove(actual);
        String session = playersBySession.entrySet().stream().filter(e -> e.getValue().id().equals(actorId)).findFirst().orElseThrow().getKey();
        playersBySession.put(session, withCards(actor, hand));
        CardCatalog.CardSpec spec = CardCatalog.ALL.stream().filter(c -> c.id().equals(cardId)).findFirst().orElseThrow();
        // Effect resolution is routed through the same card rules as direct play.
        applyEffect(actorId, spec, targets);
        discardPile.add(actual);
        finishMatchIfOnePlayerRemains();
    }

    private void applyEffect(String actorId, CardCatalog.CardSpec spec, List<String> targets) {
        switch (spec.kind()) {
            case SINGLE_ATTACK, SELF_COST_ATTACK -> {
                if (spec.kind() == CardCatalog.Kind.SELF_COST_ATTACK) changeHealth(actorId, -1);
                targets.forEach(id -> changeHealth(id, -spec.amount()));
            }
            case AREA_ATTACK -> playersBySession.values().stream().map(GamePlayer::id)
                    .filter(id -> !id.equals(actorId)).toList().forEach(id -> changeHealth(id, -spec.amount()));
            case SINGLE_STEAL, AREA_STEAL -> {
                List<String> victims = spec.kind() == CardCatalog.Kind.AREA_STEAL
                        ? playersBySession.values().stream().map(GamePlayer::id).filter(id -> !id.equals(actorId)).toList() : targets;
                for (String victim : victims) if (changeHealth(victim, -spec.amount()) > 0) changeHealth(actorId, spec.amount());
            }
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
        switch (spec.kind()) {
            case SINGLE_ATTACK, SELF_COST_ATTACK -> {
                if (spec.kind() == CardCatalog.Kind.SELF_COST_ATTACK) changeHealth(actorId, -1);
                targets.forEach(id -> changeHealth(id, -spec.amount()));
            }
            case AREA_ATTACK -> playersBySession.values().stream().map(GamePlayer::id)
                    .filter(id -> !id.equals(actorId)).toList().forEach(id -> changeHealth(id, -spec.amount()));
            case SINGLE_STEAL, AREA_STEAL -> {
                List<String> victims = spec.kind() == CardCatalog.Kind.AREA_STEAL
                        ? playersBySession.values().stream().map(GamePlayer::id).filter(id -> !id.equals(actorId)).toList()
                        : targets;
                for (String victim : victims) {
                    if (changeHealth(victim, -spec.amount()) > 0) changeHealth(actorId, spec.amount());
                }
            }
            case HEAL -> healFromSupply(actorId, spec.amount());
            case HEAL_AND_EXCHANGE -> {
                healFromSupply(actorId, 1);
                if (!targets.isEmpty()) exchangeOneCard(actorId, targets.getFirst());
            }
            case REFLECT, DEFEND, NO_ABILITY -> { }
        }
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
        List<String> remainingCards = p.cards();
        if (remainingHealth == 0 && p.health() > 0) {
            discardPile.addAll(p.cards());
            remainingCards = List.of();
        }
        playersBySession.put(entry.get().getKey(), new GamePlayer(p.id(), p.nickname(), p.role(), p.connected(),
                remainingHealth, remainingCards));
        return -actual;
    }

    private void finishMatchIfOnePlayerRemains() {
        if (status != GameStatus.IN_GAME) return;
        List<GamePlayer> alivePlayers = playersBySession.values().stream().filter(p -> p.health() > 0).toList();
        if (alivePlayers.size() == 1) finishMatch(alivePlayers, MatchResult.Reason.LAST_PLAYER_STANDING,
                "다른 모든 플레이어가 탈락하여 승리했습니다.");
        else if (alivePlayers.isEmpty()) {
            status = GameStatus.LOBBY;
            turn = new TurnState(0, null, "WAITING");
            pendingPlay = null;
        }
    }

    private void finishMatch(List<GamePlayer> winners, MatchResult.Reason reason, String message) {
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
        if (healed > 0) { supplyHealth -= healed; changeHealth(playerId, healed); }
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
