package com.javalab.student.service;

import com.javalab.student.entity.Member;
import com.javalab.student.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;


import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Redis 서비스 클래스
 * - 사용자의 권한 정보를 Redis에 캐싱하고 조회하는 역할을 수행합니다.
 * - Redis를 활용하여 사용자 권한 정보를 관리하는 역할을 수행합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final MemberRepository memberRepository;

    /**
     * 사용자의 권한 정보를 Redis에 캐싱
     * - 사용자의 이메일을 전달 받아 권한 정보를 데이터베이스에서 조회한 뒤 Redis에 저장합니다.
     * - 이 메서드는 로그인 성공 시 CustomAuthenticationSuccessHandler에서 호출됩니다.
     * @param email 사용자 이메일 (고유 식별자)
     */
    public void cacheUserAuthorities(String email) {
        log.info("사용자 [{}]의 권한 정보를 Redis에 캐싱합니다.", email);

        // 1. 전달받은 이메일로 데이터베이스 조회
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalArgumentException("해당 이메일을 가진 사용자가 존재하지 않습니다.");
        }


        // 2. 사용자의 권한 정보를 SimpleGrantedAuthority 리스트로 변환
        // - 결과 예시 : ["ROLE_USER", "ROLE_ADMIN"]
        List<String> authorities = member.getAuthorities().stream()
                .map(role -> role.getAuthority()) // GrantedAuthority에서 권한 문자열 추출
                .collect(Collectors.toList());


        // 3️Redis에 저장 (Key: "AUTH:사용자이메일", Value: 권한 리스트, 유효시간: 6시간)
        redisTemplate.opsForValue().set("AUTH:" + email, authorities, Duration.ofHours(6));
        /*
            Redis에 저장된 예시: 권한이 여러개일 경우에는 List로 저장됨
            AUTH:test@example.com : Redis의 고유 식별자, 사용자 이메일로 설정
            ["ROLE_USER", "ROLE_ADMIN"] : value로 사용자의 권한 리스트를 저장
            {
                "AUTH:test@example.com": ["ROLE_USER", "ROLE_ADMIN"]
            }
        */


        log.info("사용자 [{}]의 권한 정보가 Redis에 성공적으로 저장되었습니다: {}", email, authorities);
    }

    /**
     * Redis에서 사용자의 권한 정보를 조회
     * @param email 사용자 이메일
     * @return 사용자 권한 리스트
     */
    public List<String> getUserAuthoritiesFromCache(String email) {
        return (List<String>) redisTemplate.opsForValue().get("AUTH:" + email);
    }

    /**
     * Redis에서 사용자 권한 정보를 삭제 (로그아웃 시 사용)
     * @param email 사용자 이메일
     */
    public void removeUserAuthorities(String email) {
        redisTemplate.delete("AUTH:" + email);
        log.info("사용자 [{}]의 권한 정보가 Redis에서 삭제되었습니다.", email);
    }

}
