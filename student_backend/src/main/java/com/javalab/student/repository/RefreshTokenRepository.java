package com.javalab.student.repository;

import com.javalab.student.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    // 특정 유저의 리프레시 토큰을 조회, RefreshToken에는 useId가 없음. 그래서 memberId로 변경
    Optional<RefreshToken> findByMemberId(Long userId);
    //Optional<RefreshToken> findByUserId(Long userId);
    Optional<RefreshToken> findByRefreshToken(String refreshToken);
}

