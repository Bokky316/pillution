package com.javalab.student.repository;

import com.javalab.student.entity.SubscriptionNextItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * SubscriptionNextItem Repository
 * - 다음 회차에 반영할 상품 데이터를 조회/저장/수정/삭제하는 역할
 */
public interface SubscriptionNextItemRepository extends JpaRepository<SubscriptionNextItem, Long> {

    /**
     * 특정 구독(subscription_id)에 속한 다음 회차 결제 상품 목록 조회
     */
    List<SubscriptionNextItem> findBySubscriptionId(Long subscriptionId);

    /**
     * 특정 구독(subscription_id)에 속한 모든 다음 회차 결제 상품 삭제
     */
    void deleteBySubscriptionId(Long subscriptionId);



}
