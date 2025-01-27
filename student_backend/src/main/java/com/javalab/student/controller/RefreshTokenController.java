package com.javalab.student.controller;

import com.javalab.student.dto.CreateAccessTokenRequest;
import com.javalab.student.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/refresh-token")
@RequiredArgsConstructor
public class RefreshTokenController {
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/renew")
    public ResponseEntity<Map<String, String>> renewAccessToken(@RequestBody CreateAccessTokenRequest request) {
        String newAccessToken = refreshTokenService.renewAccessToken(request.getRefreshToken());
        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
