package com.yechan.fakerblue.model.card;

public abstract class GameCard implements CardEffect {
    private final String id;
    private final String koreanName;
    private final String englishName;
    private final int copies;

    protected GameCard(String id, String koreanName, String englishName, int copies) {
        this.id = id;
        this.koreanName = koreanName;
        this.englishName = englishName;
        this.copies = copies;
    }

    public String getId() { return id; }
    public String getKoreanName() { return koreanName; }
    public String getEnglishName() { return englishName; }
    public int getCopies() { return copies; }
}
