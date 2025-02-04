package com.javalab.student.service;

import com.javalab.student.config.jwt.TokenProvider;
import com.javalab.student.entity.RefreshToken;
import com.javalab.student.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenProvider tokenProvider;

    /**
     * 리프레시 토큰 저장 또는 갱신
     */
    @Transactional
    public void saveOrUpdateRefreshToken(String email, String refreshToken) {
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByEmail(email);

        existingToken.ifPresentOrElse(
                // 기존 토큰이 존재하는 경우 갱신
                token -> {
                    token.update(refreshToken);
                },
                // 기존 토큰이 없는 경우 새로 저장
                () -> {
                    RefreshToken newToken = new RefreshToken(email, refreshToken);
                    refreshTokenRepository.save(newToken);
                }
        );
    }


    /**
     * 리프레시 토큰 검증 및 갱신
     */
    @Transactional
    public RefreshToken validateAndRefreshToken(String refreshToken) {
        try {
            // 1. 데이터베이스에서 리프레시 토큰 조회
            RefreshToken storedToken = refreshTokenRepository.findByRefreshToken(refreshToken)
                    .orElseThrow(() -> {
                        log.error("리프레시 토큰이 데이터베이스에 존재하지 않습니다.");
                        return new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
                    });

            log.info("DB에서 조회된 리프레시 토큰: {}", storedToken);

            // 2. 리프레시 토큰 유효성 검사
            if (!tokenProvider.validateToken(refreshToken)) {
                log.error("리프레시 토큰이 만료되었습니다.");
                throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다. 다시 로그인하십시오.");
            }

            // 3. 리프레시 토큰의 남은 유효 시간 확인
            long remainingTime = tokenProvider.getExpiration(refreshToken).getTime() - System.currentTimeMillis();
            log.info("리프레시 토큰 남은 유효 시간(ms): {}", remainingTime);

            long threeDaysInMillis = 1000 * 60 * 60 * 24 * 3; // 3일

            // 4. 리프레시 토큰 만료 시간이 3일 미만이면 리프레시 토큰 갱신
            if (remainingTime < threeDaysInMillis) {
                String newRefreshToken = tokenProvider.generateRefreshToken(storedToken.getEmail(), Duration.ofDays(7));
                storedToken.update(newRefreshToken); // 리프레시 토큰 갱신
                log.info("리프레시 토큰이 갱신되었습니다: {}", newRefreshToken);
            }

            log.info("validateAndRefreshToken 검증이 완료된  리프레시 토큰 반환 : {}", storedToken.getRefreshToken());
            return storedToken;
        } catch (Exception e) {
            log.error("validateAndRefreshToken 중 예외 발생: {}", e.getMessage(), e);
            throw e; // 예외를 호출부로 전달
        }
    }



    /**
     * 새로운 액세스 토큰 생성
     */
    public String generateNewAccessToken(String email, Duration duration) {
        return tokenProvider.generateToken(
                email,
                //Collections.emptyList(), // 권한 정보 필요시 추가
                //email,
                duration
        );
    }

    /**
     * 이메일로 리프레시 토큰 삭제
     * - 사용자가 제출한 리프레시 토큰과 데이터베이스의 토큰이 일치하지 않을 경우 호출됨.
     */
    public void deleteByEmail(String email) {
        refreshTokenRepository.deleteByEmail(email);
    }
}
