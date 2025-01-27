package com.javalab.student.controller;

import com.javalab.student.dto.LoginFormDto;
import com.javalab.student.entity.Member;
import com.javalab.student.service.AccessTokenService;
import com.javalab.student.service.MemberService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.token.TokenService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * AccessTokenController
 * - 로그인, 로그아웃, 사용자 정보 조회 API를 제공하는 컨트롤러
 * - 로그인 시 AccessToken 생성, 로그아웃 시 필요한 추가 작업 수행
 * - 사용자 정보 조회 API를 제공
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AccessTokenController {

    private final AccessTokenService accessTokenService;
    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginFormDto loginForm) {

        log.info("여기는 AccessTokenController login 메서드 입니다.")    ;

        try {
            String token = accessTokenService.generateAccessToken(loginForm);
            Member member = memberService.findByEmail(loginForm.getEmail()); // 사용자 정보 조회
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("name", member.getName()); // 사용자 이름 추가
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * 사용자 정보 조회
     * @param authentication
     * @return
     */
    @GetMapping("/userInfo")
    public ResponseEntity<Member> getUserInfo(Authentication authentication) {
        // 인증 객체에서 사용자 이메일 추출
        String email = authentication.getName();

        // 사용자 정보를 데이터베이스에서 가져옴
        Member member = memberService.findByEmail(email);
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // 사용자 정보를 응답으로 반환
        return ResponseEntity.ok(member);
    }

    /**
     * 로그인 실패 시 응답
     * @return
     */
    @GetMapping("/login/error")
    public ResponseEntity<Map<String, String>> loginError() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "로그인에 실패했습니다.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }


    // [수정]
    /**
     * 로그아웃 처리
     * - 토큰을 무효화하거나 로그아웃 시 필요한 추가 작업을 수행
     * @param authentication 현재 인증 객체
     * @return 로그아웃 메시지
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null) {
            // Security Context 초기화
            SecurityContextHolder.clearContext();
            log.info("로그아웃 처리 완료: Security Context 초기화");
        }
        return ResponseEntity.ok().build();
    }


}

