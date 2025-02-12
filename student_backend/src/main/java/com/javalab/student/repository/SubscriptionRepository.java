package com.javalab.student.repository;

import com.javalab.student.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * SubscriptionRepository
 * - Subscription 테이블에 대한 CRUD 작업 수행
 */
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByMemberId(Long memberId);

    // 특정 사용자의 모든 구독을 기준으로 내림차순 정렬하여 반환 거기서 0번 = 가장최신 구독
    List<Subscription> findByMemberIdOrderByNextBillingDateDesc(Long memberId);

    // 사용자의 구독 중 특정상태(active)를 가진 구독을 회차 기준으로 내림차순 정렬하여 가장 최신 구독 1개만 반환 (구독이 여러개여도 1개만 조회됨)
    Optional<Subscription> findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(Long memberId, String status);

    // 사용자의 구독 중 특정상태 구독중 다음 결제일이 가장 최근인 구독을 조회(1개만 조회됨)
    Optional<Subscription> findFirstByMemberIdAndStatusOrderByNextBillingDateDesc(Long memberId, String status);

    List<Subscription> findByMemberIdAndStatus(Long memberId, String status);

    List<Subscription> findByStatusAndNextBillingDate(String status, LocalDate nextBillingDate);

    // ✅ 오늘이 nextBillingDate인 ACTIVE 구독 조회 (자동 갱신 대상)
    List<Subscription> findByNextBillingDateAndStatus(LocalDate nextBillingDate, String status);
}
