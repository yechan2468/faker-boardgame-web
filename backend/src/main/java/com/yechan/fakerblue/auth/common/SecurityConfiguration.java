package com.yechan.fakerblue.auth.common;

import com.yechan.fakerblue.auth.admin.AdminAuthenticationProvider;
import com.yechan.fakerblue.auth.guest.GuestAuthenticationProvider;
import jakarta.servlet.http.HttpSessionListener;
import java.util.List;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(
            AdminAuthenticationProvider adminAuthenticationProvider,
            GuestAuthenticationProvider guestAuthenticationProvider) {
        return new ProviderManager(List.of(adminAuthenticationProvider, guestAuthenticationProvider));
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationManager authenticationManager,
            GameAuthenticationSuccessHandler successHandler,
            GameAuthenticationFailureHandler failureHandler) throws Exception {
        http.authenticationManager(authenticationManager)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/api/auth/session").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/guest-password").hasRole("HOST")
                        .requestMatchers("/api/**", "/ws").authenticated()
                        .anyRequest().denyAll())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"로그인이 필요합니다.\"}");
                }))
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .authenticationDetailsSource(LoginSourceAuthenticationDetails::new)
                        .successHandler(successHandler)
                        .failureHandler(failureHandler)
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(HttpStatus.NO_CONTENT.value()))
                        .permitAll());

        return http.build();
    }

    @Bean
    ServletListenerRegistrationBean<HttpSessionListener> gameSessionListener(
            GameSessionService gameSessionService) {
        return new ServletListenerRegistrationBean<>(new GameHttpSessionListener(gameSessionService));
    }
}
