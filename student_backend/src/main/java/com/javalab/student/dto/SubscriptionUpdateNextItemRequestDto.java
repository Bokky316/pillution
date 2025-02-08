package com.javalab.student.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * 다음 회차 결제 상품 추가/수정 요청 DTO
 */
@Getter
@Setter
public class SubscriptionUpdateNextItemRequestDto {
    private Long subscriptionId;  // ✅ 구독 ID 포함
    private List<SubscriptionUpdateNextItemDto> nextItems;  // ✅ 개별 상품 DTO 리스트로 변경
}
