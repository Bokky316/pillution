package com.javalab.student.entity;

import com.javalab.student.dto.ChatRoomDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 채팅방 엔티티
 * - 채팅방 정보를 저장하는 엔티티 클래스
 */
@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false)
    private Long user1Id;

    @Column(nullable = false)
    private boolean user1Left = false;

    @Column(nullable = false)
    private Long user2Id;

    @Column(nullable = false)
    private boolean user2Left = false;

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
                .user1Left(dto.isUser1Left())
                .user2Id(dto.getUser2Id())
                .user2Left(dto.isUser2Left())
                .createdAt(dto.getCreatedAt())
                .build();
    }

    /**
     * 엔티티 정보를 DTO로 변환합니다.
     *
     * @param chatRoom 변환할 ChatRoom 엔티티 객체
     * @return 생성된 ChatRoomDto 객체
     */
    public static ChatRoomDto fromEntity(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .user1Id(chatRoom.getUser1Id())
                .user1Left(chatRoom.isUser1Left())
                .user2Id(chatRoom.getUser2Id())
                .user2Left(chatRoom.isUser2Left())
                .createdAt(chatRoom.getCreatedAt())
                .build();
    }

    /**
     * DTO의 정보로 엔티티를 업데이트합니다.
     *
     * @param dto 업데이트할 정보가 담긴 ChatRoomDto 객체
     */
    public void updateFromDto(ChatRoomDto dto) {
        this.name = dto.getName();
        this.user1Id = dto.getUser1Id();
        this.user1Left = dto.isUser1Left();
        this.user2Id = dto.getUser2Id();
        this.user2Left = dto.isUser2Left();
    }

    /**
     * 사용자의 '나가기' 상태를 설정합니다.
     *
     * @param userId 상태를 변경할 사용자의 ID
     * @param left 나가기 상태 (true: 나감, false: 들어옴)
     */
    public void setUserLeft(Long userId, boolean left) {
        if (userId.equals(user1Id)) {
            this.user1Left = left;
        } else if (userId.equals(user2Id)) {
            this.user2Left = left;
        }
    }

    /**
     * 양쪽 사용자 모두 채팅방을 나갔는지 확인합니다.
     *
     * @return 양쪽 모두 나갔으면 true, 그렇지 않으면 false
     */
    public boolean isBothUsersLeft() {
        return user1Left && user2Left;
    }
}
