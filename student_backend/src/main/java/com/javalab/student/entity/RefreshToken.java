package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * RefreshToken 엔티티
 * - 사용자의 리프레시 토큰 정보를 저장하는 엔티티 클래스
 * - 기본 생성자의 접근 권한을 PROTECTED로 설정하여 외부에서 생성하지 못하도록 한다. 왜냐하면? JPA 스펙을 준수하기 위해
 *
 */
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // 기본 생성자 생성을 막고, JPA 스펙을 준수하기 위해 PROTECTED로 설정
@Getter
@Entity
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "member_id", nullable = false, unique = true)
    private Long memberId;

    @Column(name = "refresh_token", nullable = false)
    private String refreshToken;

    public RefreshToken(Long memberId, String refreshToken) {
        this.memberId = memberId;
        this.refreshToken = refreshToken;
    }

    public RefreshToken update(String newRefreshToken) {
        this.refreshToken = newRefreshToken;

        return this;
    }
}

