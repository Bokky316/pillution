package com.javalab.student.dto;

import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private Long user1Id;
    private Long user2Id;
    private boolean user1Left;
    private boolean user2Left;
    private LocalDateTime createdAt;

    public static ChatRoomDto fromEntity(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .user1Id(chatRoom.getUser1Id())
                .user2Id(chatRoom.getUser2Id())
                .user1Left(chatRoom.isUser1Left())
                .user2Left(chatRoom.isUser2Left())
                .createdAt(chatRoom.getCreatedAt())
                .build();
    }
}