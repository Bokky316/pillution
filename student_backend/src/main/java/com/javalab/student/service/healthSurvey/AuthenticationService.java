package com.javalab.student.service.healthSurvey;

import com.javalab.student.entity.Member;
import com.javalab.student.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * 인증 및 사용자 정보 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final MemberRepository memberRepository;

    /**
     * 현재 로그인한 사용자의 인증 정보를 확인하고, Member 객체를 반환합니다.
     *
     * @return Member 객체
     * @throws IllegalStateException 인증된 사용자 정보를 찾을 수 없는 경우
     */
    public Member getAuthenticatedMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        String email = authentication.getName();
        log.debug("Authenticated user email: {}", email);

        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalStateException("회원 정보를 찾을 수 없습니다: " + email);
        }
        log.debug("Member found: {}", member);

        return member;
    }
}
