package com.yechan.fakerblue.auth.guest;

import com.yechan.fakerblue.auth.common.GamePrincipal;
import com.yechan.fakerblue.auth.common.LoginSourceAuthenticationDetails;
import com.yechan.fakerblue.model.game.PlayerRole;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
public class GuestAuthenticationProvider implements AuthenticationProvider {
    private final GuestAccessService guestAccessService;

    public GuestAuthenticationProvider(GuestAccessService guestAccessService) {
        this.guestAccessService = guestAccessService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication.getDetails() instanceof LoginSourceAuthenticationDetails details)
                || !"player".equals(details.getLoginSource())) {
            return null;
        }

        String nickname = authentication.getName() == null ? "" : authentication.getName().trim();
        if (nickname.isBlank()) {
            throw new BadCredentialsException("닉네임을 확인해 주세요.");
        }

        Object credentials = authentication.getCredentials();
        if (credentials == null || !guestAccessService.matchesGuestPassword(credentials.toString())) {
            throw new BadCredentialsException("호스트가 방을 열었는지, 비밀번호가 맞는지 확인해 주세요.");
        }

        GamePrincipal principal = new GamePrincipal(
                UUID.randomUUID().toString(), "guest", nickname, PlayerRole.PLAYER);
        return UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
