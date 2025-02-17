package com.javalab.student.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * 다음 회차 결제 상품 추가/수정 요청 DTO
 */
@Data
public class SubscriptionUpdateNextItemRequestDto {
    private Long subscriptionId;  // ✅ 구독 ID 포함
    private List<SubscriptionUpdateNextItemDto> updatedItems;  // 수정할 아이템 목록
    private String deliveryRequest;

    @Override
    public String toString() {
        return "SubscriptionUpdateNextItemRequestDto{" +
                "subscriptionId=" + subscriptionId +
                ", deliveryRequest='" + deliveryRequest + '\'' +
                '}';
    }
}
