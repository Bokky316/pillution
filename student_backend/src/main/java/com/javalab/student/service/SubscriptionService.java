package com.javalab.student.service;

import com.javalab.student.entity.*;
import com.javalab.student.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 구독 조회 수정 해지 등의 기능의 비즈니스 로직 구현
 */
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    //  사용자의 정기구독 정보 조회
    public Subscription getSubscription(Long memberId) {
        return subscriptionRepository.findByMemberId(memberId).stream()
                .findFirst()
                .orElse(null);
    }

    //  정기구독 제품 추가/수정
    @Transactional
    public void updateSubscriptionItems(Long subscriptionId, List<SubscriptionItem> updatedItems) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        // 기존 제품 삭제 후 새로운 제품 추가
        subscriptionItemRepository.deleteAll(subscription.getItems());
        subscriptionItemRepository.saveAll(updatedItems);
    }

    //  결제일 변경
    @Transactional
    public void updateBillingDate(Long subscriptionId, LocalDate newBillingDate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setNextBillingDate(newBillingDate);
        subscriptionRepository.save(subscription);
    }

    //  결제수단 변경
    @Transactional
    public void updatePaymentMethod(Long subscriptionId, String newMethod) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setPaymentMethod(newMethod);
        subscriptionRepository.save(subscription);
    }

    //  정기구독 해지
    @Transactional
    public void cancelSubscription(Long subscriptionId, boolean immediately) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        if (immediately) {
            subscription.setStatus("cancelled");
            subscription.setEndDate(LocalDate.now());
        } else {
            subscription.setStatus("paused");
        }

        subscriptionRepository.save(subscription);
    }
}