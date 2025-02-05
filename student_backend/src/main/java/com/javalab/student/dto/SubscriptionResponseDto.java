package com.javalab.student.dto;

import com.javalab.student.entity.Subscription;
import lombok.Getter;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class SubscriptionResponseDto {
    private Long id;
    private String memberEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextBillingDate;
    private String status;
    private String paymentMethod;
    private String deliveryAddress;
    private List<SubscriptionItemDto> items;
    private LocalDate lastBillingDate; // 추가: 최근 결제일
    private int currentCycle; // 추가: 현재 회차 정보

    public SubscriptionResponseDto(Subscription subscription) {
        this.id = subscription.getId();
        this.memberEmail = subscription.getMember().getEmail();
        this.startDate = subscription.getStartDate();
        this.endDate = subscription.getEndDate();
        this.nextBillingDate = subscription.getNextBillingDate();
        this.status = subscription.getStatus();
        this.paymentMethod = subscription.getPaymentMethod();
        this.deliveryAddress = subscription.getDeliveryAddress();
        this.items = subscription.getItems().stream()
                .map(SubscriptionItemDto::new)
                .collect(Collectors.toList());

        // 최근 결제일 계산 (가정: 결제는 매월 1회, 이전 결제일은 다음 결제일 - 1개월)
        this.lastBillingDate = subscription.getNextBillingDate().minusMonths(1);

        // 현재 구독 회차 계산 (가정: 구독 시작일부터 현재까지의 개월 수)
        this.currentCycle = (int) subscription.getStartDate().until(LocalDate.now()).toTotalMonths();

    }
}

