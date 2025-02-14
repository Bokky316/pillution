package com.javalab.student.repository;

import com.javalab.student.entity.SubscriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * subscription_item 테이블과 연결된 JPA 리포지토리로
 * 특정 구독(subscription)에 속한 제품 목록을 조회, 추가, 수정, 삭제하는 역할
 */
public interface SubscriptionItemRepository extends JpaRepository<SubscriptionItem, Long> {
    List<SubscriptionItem> findBySubscriptionId(Long subscriptionId);
}