package com.yechan.fakerblue.auth.common;

import com.yechan.fakerblue.auth.guest.GuestAccessService;
import com.yechan.fakerblue.model.game.PlayerRole;
import com.yechan.fakerblue.service.GameStateService;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.yechan.fakerblue.model.game.PlayerSessionChangedEvent;
import com.yechan.fakerblue.config.WebSocketSessionRegistry;

@Service
public class GameSessionService {
    private final GameStateService gameStateService;
    private final GuestAccessService guestAccessService;
    private final ApplicationEventPublisher eventPublisher;
    private final WebSocketSessionRegistry webSocketSessionRegistry;
    private final Map<String, ActiveSession> activeSessions = new LinkedHashMap<>();

    public GameSessionService(GameStateService gameStateService, GuestAccessService guestAccessService,
            ApplicationEventPublisher eventPublisher, WebSocketSessionRegistry webSocketSessionRegistry) {
        this.gameStateService = gameStateService;
        this.guestAccessService = guestAccessService;
        this.eventPublisher = eventPublisher;
        this.webSocketSessionRegistry = webSocketSessionRegistry;
    }

    public synchronized boolean register(HttpSession session, GamePrincipal principal) {
        String sessionId = session.getId();
        if (activeSessions.containsKey(sessionId)) {
            return false;
        }

        boolean registered;
        if (principal.getRole() == PlayerRole.HOST) {
            registered = gameStateService.registerHost(
                    sessionId, principal.getId(), principal.getNickname());
            if (registered) {
                guestAccessService.hostLoggedIn();
            }
        } else {
            registered = guestAccessService.isGuestLoginEnabled()
                    && gameStateService.registerPlayer(
                            sessionId, principal.getId(), principal.getNickname());
        }

        if (registered) {
            activeSessions.put(sessionId, new ActiveSession(session, principal));
        }
        return registered;
    }

    public synchronized boolean isActivePlayer(String playerId) {
        return activeSessions.values().stream().anyMatch(session -> session.principal().getId().equals(playerId));
    }

    public synchronized Optional<GamePrincipal> findActivePrincipal(String playerId) {
        return activeSessions.values().stream()
                .map(ActiveSession::principal)
                .filter(principal -> principal.getId().equals(playerId))
                .findFirst();
    }

    public void sessionDestroyed(String sessionId) {
        List<HttpSession> guestSessionsToInvalidate = new ArrayList<>();
        List<String> playerIdsToDisconnect = new ArrayList<>();
        boolean hostLoggedOut = false;

        synchronized (this) {
            ActiveSession removed = activeSessions.remove(sessionId);
            if (removed == null) {
                return;
            }

            if (removed.principal().getRole() == PlayerRole.HOST) {
                hostLoggedOut = true;
                playerIdsToDisconnect.add(removed.principal().getId());
                guestAccessService.hostLoggedOut();
                activeSessions.entrySet().removeIf(entry -> {
                    ActiveSession activeSession = entry.getValue();
                    if (activeSession.principal().getRole() == PlayerRole.PLAYER) {
                        playerIdsToDisconnect.add(activeSession.principal().getId());
                        guestSessionsToInvalidate.add(activeSession.session());
                        return true;
                    }
                    return false;
                });
                gameStateService.resetAfterHostLogout();
            } else {
                playerIdsToDisconnect.add(removed.principal().getId());
                gameStateService.removePlayer(sessionId);
            }
        }

        for (HttpSession guestSession : guestSessionsToInvalidate) {
            try {
                guestSession.invalidate();
            } catch (IllegalStateException ignored) {
                // The guest session may already have expired or logged out.
            }
        }
        playerIdsToDisconnect.forEach(webSocketSessionRegistry::closePlayerSessions);
        eventPublisher.publishEvent(new PlayerSessionChangedEvent(hostLoggedOut ? "ROOM_RESET" : "PLAYER_LEFT"));
    }

    private record ActiveSession(HttpSession session, GamePrincipal principal) {
    }
}
