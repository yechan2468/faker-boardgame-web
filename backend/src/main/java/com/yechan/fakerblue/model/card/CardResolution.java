package com.yechan.fakerblue.model.card;

public record CardResolution(int selfDamage, int damagePerTarget, boolean allPlayers,
        int healthSteal, int supplyHeal, boolean exchangeCards, boolean reflectable,
        boolean defendable, boolean noAbility) {
}
