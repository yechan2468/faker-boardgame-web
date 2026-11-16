package com.yechan.fakerblue.model.card;

import java.util.List;

public final class CardCatalog {
    private CardCatalog() {}

    public static final List<CardSpec> ALL = List.of(
            new CardSpec("assassin", "암살자", "Assassin", 1, Kind.SINGLE_ATTACK, 3, 12),
            new CardSpec("warlock", "흑마법사", "Warlock", 2, Kind.SELF_COST_ATTACK, 3, 9),
            new CardSpec("red-dragon", "불용", "Red Dragon", 1, Kind.AREA_ATTACK, 2, 10),
            new CardSpec("archer", "궁수", "Archer", 2, Kind.SINGLE_ATTACK, 2, 8),
            new CardSpec("bomber", "폭탄병", "Bomber", 2, Kind.AREA_ATTACK, 1, 6),
            new CardSpec("vampire-king", "뱀파이어킹", "Vampire King", 1, Kind.AREA_STEAL, 1, 13),
            new CardSpec("vampire", "뱀파이어", "Vampire", 2, Kind.SINGLE_STEAL, 1, 5),
            new CardSpec("alchemist", "연금술사", "Alchemist", 2, Kind.HEAL_AND_EXCHANGE, 1, 4),
            new CardSpec("high-priest", "고위사제", "High Priest", 1, Kind.HEAL, 3, 11),
            new CardSpec("priest", "사제", "Priest", 2, Kind.HEAL, 2, 7),
            new CardSpec("wizard", "마법사", "Wizard", 2, Kind.REFLECT, 0, 3),
            new CardSpec("defender", "방패병", "Defender", 3, Kind.DEFEND, 0, 2),
            new CardSpec("clown", "광대", "Clown", 8, Kind.NO_ABILITY, 0, 1));

    public enum Kind { SINGLE_ATTACK, SELF_COST_ATTACK, AREA_ATTACK, AREA_STEAL, SINGLE_STEAL,
        HEAL_AND_EXCHANGE, HEAL, REFLECT, DEFEND, NO_ABILITY }
    public record CardSpec(String id, String koreanName, String englishName, int copies, Kind kind, int amount, int cardValue) {}
}
