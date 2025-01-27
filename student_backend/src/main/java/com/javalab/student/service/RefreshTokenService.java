package com.javalab.student.service;

import com.javalab.student.config.jwt.TokenProvider;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.RefreshToken;
import com.javalab.student.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * 리프레시 토큰을 조회하는 서비스 클래스입니다.
 * - 전달받은 리프레시 토큰으로 리프레시 토큰을 조회합니다.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final TokenProvider tokenProvider;
    private final StoredRefreshTokenService storedRefreshTokenService; // 기존 RefreshTokenService 대체
    private final MemberService memberService;

    public String renewAccessToken(String refreshToken) {
        if (!tokenProvider.validToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        Long memberId = storedRefreshTokenService.findByToken(refreshToken).getMemberId();
        Member member = memberService.findById(memberId);

        // 새로운 액세스 토큰 생성
        return tokenProvider.generateToken(
                member.getEmail(),
                member.getAuthorities(), // Member 엔티티에 권한 정보가 포함되어 있다고 가정
                member.getName(),
                Duration.ofHours(1)
        );
    }
}


