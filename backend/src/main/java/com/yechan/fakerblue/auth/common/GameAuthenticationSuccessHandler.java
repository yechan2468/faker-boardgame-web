package com.yechan.fakerblue.auth.common;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class GameAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final GameSessionService gameSessionService;

    public GameAuthenticationSuccessHandler(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof GamePrincipal principal)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        HttpSession session = request.getSession(true);
        if (!gameSessionService.register(session, principal)) {
            SecurityContextHolder.clearContext();
            session.invalidate();
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"이미 접속한 플레이어가 있거나 방이 가득 찼습니다.\"}");
            return;
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"role\":\"" + principal.getRole().name()
                + "\",\"nickname\":\"" + jsonEscape(principal.getNickname()) + "\"}");
    }

    private String jsonEscape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
