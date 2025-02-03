package com.javalab.student.controller;

import com.javalab.student.service.RefreshTokenService;
import com.javalab.student.config.jwt.TokenProvider;
import com.javalab.student.entity.RefreshToken;
import com.javalab.student.util.CookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;


/**
 * 리프레시 토큰으로 새로운 액세스 토큰 발급
 * 클라이언트가 리프레시 토큰을 서버로 전달 (쿠키를 통해).
 * 데이터베이스에서 리프레시 토큰 조회 (1차 유효성 검사).
 * JWT 서명 및 만료일 검증 (2차 유효성 검사).
 * 만료된 리프레시 토큰은 새 리프레시 토큰으로 갱신.
 * 새로운 액세스 토큰 발급 및 반환.
 */
@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;

    /**
     * 리프레시 토큰으로 새로운 액세스 토큰 발급
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {

        log.info("리프레시 토큰으로 새로운 액세스 토큰 발급");

        try {
            // 1. 쿠키에서 리프레시 토큰 추출
            String refreshToken = CookieUtil.getTokenFromCookies(request.getCookies(), "refToken");

            if (refreshToken == null) {
                return buildErrorResponse("리프레시 토큰이 쿠키에 없습니다.", HttpStatus.UNAUTHORIZED);
            }

            // 2. 리프레시 토큰 검증 및 갱신
            RefreshToken validatedToken = refreshTokenService.validateAndRefreshToken(refreshToken);

            // 3. 새로운 액세스 토큰 생성
            String newAccessToken = refreshTokenService.generateNewAccessToken(validatedToken.getEmail(), Duration.ofMinutes(1));

            // 4. 새로운 액세스 토큰을 쿠키에 저장
            CookieUtil.addHttpOnlyCookie(response, "accToken", newAccessToken, true);

            return buildSuccessResponse("새로운 액세스 토큰이 발급되었습니다.");
        } catch (Exception e) {
            return buildErrorResponse("서버 오류 발생: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<Map<String, Object>> buildSuccessResponse(String message) {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("status", "success");
        responseBody.put("message", message);
        return ResponseEntity.ok(responseBody);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("status", "error");
        responseBody.put("message", message);
        return ResponseEntity.status(status).body(responseBody);
    }
}
