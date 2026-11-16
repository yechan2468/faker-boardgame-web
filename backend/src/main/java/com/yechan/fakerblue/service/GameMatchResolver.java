package com.yechan.fakerblue.service;

import com.yechan.fakerblue.model.card.CardCatalog;
import com.yechan.fakerblue.model.game.GamePlayer;
import com.yechan.fakerblue.model.game.MatchResult;
import java.util.List;

final class GameMatchResolver {
    Outcome resolveDeckExhaustion(List<GamePlayer> alivePlayers) {
        int highestHealth = alivePlayers.stream().mapToInt(GamePlayer::health).max().orElse(0);
        List<GamePlayer> healthLeaders = alivePlayers.stream()
                .filter(player -> player.health() == highestHealth)
                .toList();
        if (healthLeaders.size() == 1) {
            return new Outcome(healthLeaders, MatchResult.Reason.CARD_DECK_EMPTY_HEALTH,
                    "카드 더미가 모두 소진되어 체력 토큰이 가장 많은 플레이어가 승리했습니다.");
        }

        int maxCardValue = healthLeaders.stream().mapToInt(GameMatchResolver::highestCardValue).max().orElse(0);
        List<GamePlayer> cardLeaders = healthLeaders.stream()
                .filter(player -> highestCardValue(player) == maxCardValue)
                .toList();
        MatchResult.Reason reason = cardLeaders.size() == healthLeaders.size()
                ? MatchResult.Reason.CARD_DECK_EMPTY_TIE : MatchResult.Reason.CARD_DECK_EMPTY_CARD_VALUE;
        String message = reason == MatchResult.Reason.CARD_DECK_EMPTY_TIE
                ? "카드 더미가 모두 소진되었고 체력 토큰과 카드 가치가 같아 공동 승리했습니다."
                : "카드 더미가 모두 소진되고 체력 토큰이 같아 보유 카드 가치가 가장 높은 플레이어가 승리했습니다.";
        return new Outcome(cardLeaders, reason, message);
    }

    private static int highestCardValue(GamePlayer player) {
        return player.cards().stream().mapToInt(cardId -> CardCatalog.ALL.stream()
                .filter(card -> card.id().equals(cardId))
                .mapToInt(CardCatalog.CardSpec::cardValue)
                .findFirst().orElse(0)).max().orElse(0);
    }

    record Outcome(List<GamePlayer> winners, MatchResult.Reason reason, String message) {}
}
