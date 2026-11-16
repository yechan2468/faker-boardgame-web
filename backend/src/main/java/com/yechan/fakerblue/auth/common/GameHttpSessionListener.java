package com.yechan.fakerblue.auth.common;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;

public class GameHttpSessionListener implements HttpSessionListener {
    private final GameSessionService gameSessionService;

    public GameHttpSessionListener(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        gameSessionService.sessionDestroyed(event.getSession().getId());
    }
}
