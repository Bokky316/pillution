package com.javalab.student.dto;

import com.javalab.student.constant.ConsultationTopic;
import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.entity.ConsultationRequest;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationRequestDto {
    private Long id;                 // 상담 요청 ID
    private Long customerId;         // 고객 ID
    private Long csAgentId;          // 상담사 ID (수락 시 설정됨)
    private Long orderId;            // 주문 ID (선택적)
    private String preMessage;       // 사전 메시지
    private ConsultationRequestStatus status; // 현재 상태 (PENDING, ACCEPTED 등)

    /**
     * 🔹 엔티티로부터 Dto 생성자 호출
     */
    public ConsultationRequestDto(ConsultationRequest request) {
        this.id = request.getId();
        this.customerId = request.getCustomer().getId();
        this.csAgentId = request.getCsAgent() != null ? request.getCsAgent().getId() : null;
        this.orderId = request.getOrderId();
        this.preMessage = request.getPreMessage();
        this.status = request.getStatus();
    }
}
