package com.javalab.student.dto;

import com.javalab.student.entity.message.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponseDto {

    private Long id;
    private Long senderId;
    private String senderName;  // ✅ 프론트에서 사용자 이름을 표시하기 쉽게 추가
    private Long receiverId;
    private String content;
    private boolean isRead;
    private LocalDateTime regTime;
    private LocalDateTime updateTime;
    public MessageResponseDto(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getName(); // ✅ 사용자 이름 추가
        this.receiverId = message.getReceiver().getId();
        this.content = message.getContent();
        this.isRead = message.isRead();
        this.regTime = message.getRegTime();
        this.updateTime = message.getUpdateTime();
    }
}
