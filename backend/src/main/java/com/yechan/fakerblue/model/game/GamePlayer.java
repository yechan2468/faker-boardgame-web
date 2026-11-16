package com.yechan.fakerblue.model.game;

import java.util.List;

public record GamePlayer(String id, String nickname, PlayerRole role, boolean connected, int health, List<String> cards) {
    public GamePlayer { cards = List.copyOf(cards); }
}
