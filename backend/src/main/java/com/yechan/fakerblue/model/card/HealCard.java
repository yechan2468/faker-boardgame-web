package com.yechan.fakerblue.model.card;

public abstract class HealCard extends GameCard {
    private final int amount;

    protected HealCard(String id, String ko, String en, int copies, int amount) {
        super(id, ko, en, copies);
        this.amount = amount;
    }

    @Override
    public CardResolution resolve(CardContext context) {
        return new CardResolution(0, 0, false, 0, Math.min(amount, context.supplyHealth()), false,
                false, false, false);
    }
}
