package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.auth.common.GamePrincipal;
import com.yechan.fakerblue.auth.guest.GuestAccessService;
import com.yechan.fakerblue.model.game.PlayerRole;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthApiController {
    private final GuestAccessService guestAccessService;

    public AuthApiController(GuestAccessService guestAccessService) {
        this.guestAccessService = guestAccessService;
    }

    @GetMapping("/api/auth/session")
    public SessionView session(@AuthenticationPrincipal GamePrincipal principal) {
        return new SessionView(
                principal != null,
                principal == null ? null : principal.getId(),
                principal == null ? null : principal.getNickname(),
                principal == null ? null : principal.getRole(),
                guestAccessService.isGuestLoginEnabled());
    }

    public record SessionView(
            boolean authenticated,
            String playerId,
            String nickname,
            PlayerRole role,
            boolean guestLoginEnabled) {}
}
