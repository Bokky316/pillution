package com.javalab.student.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class EmailVerificationService {

    // 이메일 인증 여부를 저장하는 캐시
    private final Map<String, Boolean> emailVerificationCache = new ConcurrentHashMap<>();

    /**
     * 이메일 인증 상태 저장
     */
    public void setVerified(String email) {
        emailVerificationCache.put(email, true);
    }

    /**
     * 이메일 인증 상태 확인
     */
    public boolean isVerified(String email) {
        return emailVerificationCache.getOrDefault(email, false);
    }

    /**
     * 회원가입 완료 후 인증 정보 삭제
     */
    public void removeVerified(String email) {
        emailVerificationCache.remove(email);
    }
}
