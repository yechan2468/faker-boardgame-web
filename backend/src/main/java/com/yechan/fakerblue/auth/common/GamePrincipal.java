package com.yechan.fakerblue.auth.common;

import com.yechan.fakerblue.model.game.PlayerRole;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.Getter;

@Getter
public final class GamePrincipal implements UserDetails {
    private final String id;
    private final String username;
    private final String nickname;
    private final PlayerRole role;

    public GamePrincipal(String id, String username, String nickname, PlayerRole role) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return id;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof GamePrincipal that)) {
            return false;
        }
        return role == that.role && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, role);
    }
}
