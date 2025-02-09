package com.javalab.student.dto;


import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.ChatRoomStatus;
import com.javalab.student.entity.ConsultationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 채팅방 DTO
 * 클라이언트와 서버 간 채팅방 데이터를 전송하는 데 사용됩니다.
 */
@Getter @Setter @NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDto {
    private Long id;
    private String name;
    private Long userId;
    private Long consultantId;
    private LocalDateTime createdAt;
    private ChatRoomStatus status;
    private ConsultationType consultationType;
    private String userIssue;

    public static ChatRoomDto fromEntity(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .userId(chatRoom.getUser() != null ? chatRoom.getUser().getId() : null)
                .consultantId(chatRoom.getConsultant() != null ? chatRoom.getConsultant().getId() : null)
                .createdAt(chatRoom.getCreatedAt())
                .status(chatRoom.getStatus())
                .consultationType(chatRoom.getConsultationType())
                .userIssue(chatRoom.getUserIssue())
                .build();
    }
}
