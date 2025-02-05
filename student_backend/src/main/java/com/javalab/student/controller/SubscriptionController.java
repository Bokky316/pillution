package com.javalab.student.controller;

import com.javalab.student.entity.Subscription;
import com.javalab.student.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * 사용자의 요청을 처리하는 API 엔드포인트
 */
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

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


    // 결제일 변경
    @PutMapping("/update-billing-date")
    public ResponseEntity<Void> updateBillingDate(@RequestParam Long subscriptionId, @RequestParam String newDate) {
        subscriptionService.updateBillingDate(subscriptionId, LocalDate.parse(newDate));
        return ResponseEntity.ok().build();
    }

    // 결제수단 변경
    @PutMapping("/update-payment")
    public ResponseEntity<Void> updatePaymentMethod(@RequestParam Long subscriptionId, @RequestParam String method) {
        subscriptionService.updatePaymentMethod(subscriptionId, method);
        return ResponseEntity.ok().build();
    }

    // 구독 해지
    @DeleteMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(@RequestParam Long subscriptionId, @RequestParam boolean immediately) {
        subscriptionService.cancelSubscription(subscriptionId, immediately);
        return ResponseEntity.ok().build();
    }
}