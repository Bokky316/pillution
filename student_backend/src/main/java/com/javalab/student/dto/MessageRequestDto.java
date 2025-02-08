package com.javalab.student.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

/**
 * 메시지 요청 DTO (클라이언트 → 서버)
 */
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequestDto {

    private Long senderId;  // ✅ Member ID를 사용
    private Long receiverId;

    @NotBlank(message = "메시지 내용은 필수 입력 값입니다.")
    private String content;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("senderId", senderId);
        map.put("receiverId", receiverId);
        map.put("content", content);
        return map;
    }
}
