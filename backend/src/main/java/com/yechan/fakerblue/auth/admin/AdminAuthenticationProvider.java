package com.yechan.fakerblue.auth.admin;

import com.yechan.fakerblue.auth.common.GamePrincipal;
import com.yechan.fakerblue.auth.common.LoginSourceAuthenticationDetails;
import com.yechan.fakerblue.model.game.PlayerRole;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthenticationProvider implements AuthenticationProvider {
    private static final Logger logger = LoggerFactory.getLogger(AdminAuthenticationProvider.class);

    private final String adminUsername;
    private final String adminNickname;
    private final String encodedAdminPassword;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthenticationProvider(
            @Value("${faker.auth.admin.username:host}") String adminUsername,
            @Value("${faker.auth.admin.password:}") String adminPassword,
            @Value("${faker.auth.admin.nickname:호스트}") String adminNickname,
            PasswordEncoder passwordEncoder) {
        this.adminUsername = adminUsername;
        this.adminNickname = adminNickname;
        this.passwordEncoder = passwordEncoder;
        this.encodedAdminPassword = adminPassword.isBlank()
                ? null
                : passwordEncoder.encode(adminPassword);

        if (encodedAdminPassword == null) {
            logger.warn("Host login is disabled until FAKER_BLUE_ADMIN_PASSWORD is configured.");
        }
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication.getDetails() instanceof LoginSourceAuthenticationDetails details)
                || !"admin".equals(details.getLoginSource())) {
            return null;
        }

        String username = authentication.getName();
        if (!adminUsername.equals(username)) {
            throw new BadCredentialsException("호스트 로그인 정보를 확인해 주세요.");
        }

        Object credentials = authentication.getCredentials();
        if (encodedAdminPassword == null
                || credentials == null
                || !passwordEncoder.matches(credentials.toString(), encodedAdminPassword)) {
            throw new BadCredentialsException("호스트 로그인 정보를 확인해 주세요.");
        }

        GamePrincipal principal = new GamePrincipal(
                UUID.randomUUID().toString(), adminUsername, adminNickname, PlayerRole.HOST);
        return UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
