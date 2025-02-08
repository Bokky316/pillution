package com.javalab.student.controller;

import com.javalab.student.dto.SubscriptionUpdateNextItemRequestDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemRequestDto;
import com.javalab.student.entity.Subscription;
import com.javalab.student.entity.SubscriptionNextItem;
import com.javalab.student.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 구독 관련 API 컨트롤러
 * - 사용자의 정기구독 정보를 조회, 생성, 수정, 취소하는 기능 제공
 */
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * 사용자의 최신 활성화된 구독 정보 조회
     */
    @GetMapping
    public ResponseEntity<?> getSubscription(@RequestParam(value = "memberId", required = false) Long memberId) {
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "memberId가 필요합니다."));
        }
        try {
            return ResponseEntity.ok(subscriptionService.getSubscription(memberId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 새로운 구독 생성 API
     */
    @PostMapping("/create")
    public ResponseEntity<Subscription> createSubscription(
            @RequestParam Long memberId,
            @RequestParam String paymentMethod,
            @RequestParam String deliveryAddress) {
        return ResponseEntity.ok(subscriptionService.createSubscription(memberId, paymentMethod, deliveryAddress));
    }

    /**
     * 결제일 업데이트 API
     */
    @PutMapping("/update-billing-date")
    public ResponseEntity<Void> updateBillingDate(@RequestParam Long subscriptionId, @RequestParam String newDate) {
        subscriptionService.updateBillingDate(subscriptionId, LocalDate.parse(newDate));
        return ResponseEntity.ok().build();
    }

    /**
     * 결제수단 변경 API
     */
    @PutMapping("/update-payment")
    public ResponseEntity<Void> updatePaymentMethod(@RequestParam Long subscriptionId, @RequestParam String method) {
        subscriptionService.updatePaymentMethod(subscriptionId, method);
        return ResponseEntity.ok().build();
    }

    /**
     * 배송정보 변경 API
     */
    @PutMapping("/update-delivery")
    public ResponseEntity<Void> updateDeliveryAddress(@RequestParam Long subscriptionId, @RequestParam String address) {
        subscriptionService.updateDeliveryAddress(subscriptionId, address);
        return ResponseEntity.ok().build();
    }

    /**
     * 구독 취소 API
     */
    @DeleteMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(@RequestParam Long subscriptionId) {
        subscriptionService.cancelSubscription(subscriptionId);
        return ResponseEntity.ok().build();
    }

    /**
     * 구독 정보 전체 수정 API
     */
    @PutMapping("/update")
    public ResponseEntity<Void> updateSubscriptionInfo(
            @RequestParam Long subscriptionId,
            @RequestParam(required = false) String newBillingDate,
            @RequestParam(required = false) String newPaymentMethod,
            @RequestParam(required = false) String newDeliveryAddress) {
        subscriptionService.updateSubscriptionInfo(subscriptionId,
                newBillingDate != null ? LocalDate.parse(newBillingDate) : null,
                newPaymentMethod,
                newDeliveryAddress);
        return ResponseEntity.ok().build();
    }

    /**
     * 다음 회차에 반영할 상품 추가/삭제 API
     * - 사용자가 다음 회차 결제 시 구매할 상품을 추가/수정하는 기능
     */
    @PostMapping("/update-next-items")
    public ResponseEntity<Void> updateNextSubscriptionItems(
            @RequestBody SubscriptionUpdateNextItemRequestDto requestDto
    ) {
        // nextItems가 null일 경우 빈 리스트로 초기화
        if (requestDto.getNextItems() == null) {
            requestDto.setNextItems(new ArrayList<>());
        }

        subscriptionService.updateNextSubscriptionItems(requestDto.getSubscriptionId(), requestDto.getNextItems());
        return ResponseEntity.ok().build();
    }
    /**
     * 자동 결제 처리 API
     * - 정기결제 날짜가 되면 자동으로 구독 상품을 결제하고, 회차 정보를 업데이트
     */
    @PostMapping("/process-billing")
    public ResponseEntity<Void> processSubscriptionBilling(@RequestParam Long subscriptionId) {
        subscriptionService.processSubscriptionBilling(subscriptionId);
        return ResponseEntity.ok().build();
    }

}
