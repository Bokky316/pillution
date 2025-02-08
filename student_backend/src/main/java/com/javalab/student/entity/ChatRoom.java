package com.javalab.student.entity;

import com.javalab.student.dto.ChatRoomDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 채팅방 엔티티
 * 참가자들이 메시지를 주고받는 채팅방을 나타냅니다.
 */
@Entity
@Table(name = "chat_rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Long user1Id;
    private Long user2Id;
    private boolean user1Left;
    private boolean user2Left;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * DTO로부터 엔티티를 생성합니다.
     *
     * @param dto 변환할 ChatRoomDto 객체
     * @return 생성된 ChatRoom 엔티티
     */
    public static ChatRoom fromDto(ChatRoomDto dto) {
        return ChatRoom.builder()
                .id(dto.getId())
                .name(dto.getName())
                .user1Id(dto.getUser1Id())
                .user2Id(dto.getUser2Id())
                .user1Left(dto.isUser1Left())
                .user2Left(dto.isUser2Left())
                .createdAt(dto.getCreatedAt())
                .build();
    }

    /**
     * DTO의 정보로 엔티티를 업데이트합니다.
     *
     * @param dto 업데이트할 정보가 담긴 ChatRoomDto 객체
     */
    public void updateFromDto(ChatRoomDto dto) {
        this.name = dto.getName();
        this.user1Left = dto.isUser1Left();
        this.user2Left = dto.isUser2Left();
        // 필요에 따라 다른 필드들도 업데이트
    }
}
