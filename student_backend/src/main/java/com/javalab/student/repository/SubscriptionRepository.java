package com.javalab.student.repository;

import com.javalab.student.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 데이터베이스에서 구독 데이터를 조회 & 저장하는 레포지토리
 */
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByMemberId(Long memberId);
}