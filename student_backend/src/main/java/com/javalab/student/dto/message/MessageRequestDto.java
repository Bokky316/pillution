package com.javalab.student.dto.message;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

/**
 * 메시지 요청 DTO (클라이언트 → 서버)
 * - 일반 메시지 및 관리자 메시지 요청 정보를 모두 담을 수 있도록 수정
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequestDto {

    private Long senderId;  // 발신자 ID
    private String receiverType; // 수신자 유형 (ALL, ROLE, USER)
    private Long receiverId; // 수신자 ID 또는 역할 (ROLE_ADMIN, ROLE_USER 등)

    @NotBlank(message = "메시지 내용은 필수 입력 값입니다.")
    private String content; // 메시지 내용

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("senderId", senderId);
        map.put("receiverType", receiverType);
        map.put("receiverId", receiverId);
        map.put("content", content);
        return map;
    }
}
