package com.javalab.student.dto.cartOrder;

import lombok.*;

/**
 * 배송 정보 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryInfoDto {

    private Long id;
    private String deliveryName;
    private String recipientName;
    private String recipientPhone;
    private String postalCode;
    private String roadAddress;
    private String detailAddress;
    private String deliveryMemo;
    private boolean isDefault;
}
