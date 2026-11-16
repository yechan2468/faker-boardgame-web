package com.yechan.fakerblue.model.card;

public abstract class AttackCard extends GameCard {
    private final int damage;
    private final boolean area;

    protected AttackCard(String id, String ko, String en, int copies, int damage, boolean area) {
        super(id, ko, en, copies);
        this.damage = damage;
        this.area = area;
    }

    @Override
    public CardResolution resolve(CardContext context) {
        return new CardResolution(0, damage, area, 0, 0, false, true, true, false);
    }
}
