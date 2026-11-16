package com.yechan.fakerblue.auth.guest;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class GuestAccessService {
    private final PasswordEncoder passwordEncoder;
    private boolean hostConnected;
    private String encodedGuestPassword;

    public GuestAccessService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public synchronized void hostLoggedIn() {
        hostConnected = true;
    }

    public synchronized void hostLoggedOut() {
        hostConnected = false;
        encodedGuestPassword = null;
    }

    public synchronized void setGuestPassword(String guestPassword) {
        if (!hostConnected) {
            throw new IllegalStateException("호스트가 로그인한 상태에서만 비밀번호를 설정할 수 있습니다.");
        }
        if (guestPassword == null || guestPassword.isBlank()) {
            throw new IllegalArgumentException("게스트 비밀번호를 입력해 주세요.");
        }

        encodedGuestPassword = passwordEncoder.encode(guestPassword);
    }

    public synchronized boolean isGuestLoginEnabled() {
        return hostConnected && encodedGuestPassword != null;
    }

    public synchronized boolean matchesGuestPassword(String candidate) {
        return isGuestLoginEnabled()
                && candidate != null
                && passwordEncoder.matches(candidate, encodedGuestPassword);
    }
}
