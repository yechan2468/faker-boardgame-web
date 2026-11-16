package com.yechan.fakerblue.auth.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

public class LoginSourceAuthenticationDetails extends WebAuthenticationDetails {
    private final String loginSource;

    public LoginSourceAuthenticationDetails(HttpServletRequest request) {
        super(request);
        this.loginSource = request.getParameter("loginSource");
    }

    public String getLoginSource() {
        return loginSource;
    }
}
