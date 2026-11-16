package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.model.game.LeaderboardEntry;
import com.yechan.fakerblue.service.GameStateService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LeaderboardController {
    private final GameStateService gameStateService;
    public LeaderboardController(GameStateService gameStateService) { this.gameStateService = gameStateService; }
    @GetMapping("/api/leaderboard")
    public List<LeaderboardEntry> getLeaderboard() { return gameStateService.leaderboard(); }
}
