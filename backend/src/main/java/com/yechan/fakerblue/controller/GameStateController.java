package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.auth.common.GamePrincipal;
import com.yechan.fakerblue.model.game.GameStateView;
import com.yechan.fakerblue.service.GameStateService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GameStateController {
    private final GameStateService gameStateService;

    public GameStateController(GameStateService gameStateService) {
        this.gameStateService = gameStateService;
    }

    @GetMapping("/api/game")
    public GameStateView currentGameState(@AuthenticationPrincipal GamePrincipal principal) {
        return gameStateService.publicState(principal.getId());
    }
}
