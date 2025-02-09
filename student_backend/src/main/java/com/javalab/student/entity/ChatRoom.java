package com.javalab.student.entity;

import com.javalab.student.dto.ChatRoomDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    @Column(nullable = false) // [수정] null 값 허용 안함
    private Long user1Id;

    private boolean user1Left;

    @Column(nullable = false) // [수정] null 값 허용 안함
    private Long user2Id;

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
}
