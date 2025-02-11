package com.javalab.student.dto;

import com.javalab.student.constant.ConsultationTopic;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ✅ 상담 채팅방 응답 Dto
 * - 상담 채팅방 정보를 클라이언트에 전달하는 데이터 전송 객체
 */
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRoomResponseDto {
    private Long id;           // 채팅방 ID
    private String name;       // 채팅방 이름
    private LocalDateTime createdAt; // 채팅방 개설일자
    private Long csAgentId;    // 상담사 ID
    private String csAgentName; // 상담사 이름
    private String status;     // 상담 상태 ("WAITING", "IN_PROGRESS", "COMPLETED")
    private ConsultationTopic topic; // 상담 주제
}
