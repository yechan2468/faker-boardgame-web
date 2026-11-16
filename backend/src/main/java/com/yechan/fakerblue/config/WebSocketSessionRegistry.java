package com.yechan.fakerblue.config;

import java.io.IOException;
import java.security.Principal;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

@Component
public class WebSocketSessionRegistry {
    private final ConcurrentHashMap<String, Set<WebSocketSession>> sessionsByPlayer = new ConcurrentHashMap<>();

    public void register(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal != null) {
            sessionsByPlayer.computeIfAbsent(principal.getName(), ignored -> ConcurrentHashMap.newKeySet())
                    .add(session);
        }
    }

    public void remove(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal == null) return;
        Set<WebSocketSession> sessions = sessionsByPlayer.get(principal.getName());
        if (sessions == null) return;
        sessions.remove(session);
        if (sessions.isEmpty()) sessionsByPlayer.remove(principal.getName(), sessions);
    }

    public void closePlayerSessions(String playerId) {
        Set<WebSocketSession> sessions = sessionsByPlayer.remove(playerId);
        if (sessions == null) return;
        sessions.forEach(session -> {
            try {
                if (session.isOpen()) session.close(CloseStatus.NORMAL);
            } catch (IOException ignored) {
                // The socket may already be closing.
            }
        });
    }
}
