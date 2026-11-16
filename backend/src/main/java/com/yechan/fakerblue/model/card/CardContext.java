package com.yechan.fakerblue.model.card;

import java.util.List;

public record CardContext(String actorId, List<String> targetIds, int supplyHealth) {
}
