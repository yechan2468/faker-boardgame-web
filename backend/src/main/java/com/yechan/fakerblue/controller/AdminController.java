package com.yechan.fakerblue.controller;

import com.yechan.fakerblue.auth.guest.GuestAccessService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
public class AdminController {
    private final GuestAccessService guestAccessService;

    public AdminController(GuestAccessService guestAccessService) {
        this.guestAccessService = guestAccessService;
    }

    @PostMapping("/api/admin/guest-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setGuestPassword(@RequestBody GuestPasswordRequest request) {
        guestAccessService.setGuestPassword(request.guestPassword());
    }

    public record GuestPasswordRequest(String guestPassword) {}
}
