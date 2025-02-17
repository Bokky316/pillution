package com.javalab.student.dto.message;

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
    private String receiverName;  // ✅ 프론트에서 받는 사람 이름을 표시하기 쉽게 추가
    private String content;
    private boolean isRead;
    private boolean isNotice;   //  ✅ 공지 여부
    private LocalDateTime regTime;
    private LocalDateTime updateTime;
    public MessageResponseDto(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getName(); // ✅ 사용자 이름 추가
        this.receiverId = message.getReceiver().getId();
        this.receiverName = message.getReceiver().getName();
        this.content = message.getContent();
        this.isRead = message.isRead();
        this.isNotice = message.isNotice();
        this.regTime = message.getRegTime();
        this.updateTime = message.getUpdateTime();
    }
}
