package com.javalab.student.dto;

import lombok.*;

/**
 * 타이핑 상태 DTO (Data Transfer Object)
 * 클라이언트와 서버 간 사용자의 타이핑 상태 데이터를 전송하는 데 사용됩니다.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypingStatus {
    private Long roomId;
    private Long senderId;
    private String senderName;
    private boolean typing;
}
