package com.javalab.student.dto;

import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅방 DTO
 * 클라이언트와 서버 간 채팅방 데이터를 전송하는 데 사용됩니다.
 */
@Getter
@Setter
public class ChatRoomDto {
    private Long id;
    private String name;
    private List<Long> participantIds;
    private List<String> participantNames;
    private LocalDateTime createdDate;

    public ChatRoomDto() {}

    /**
     * ChatRoom 엔티티로부터 DTO를 생성합니다.
     * @param chatRoom ChatRoom 엔티티
     */
    public ChatRoomDto(ChatRoom chatRoom) {
        this.id = chatRoom.getId();
        this.name = chatRoom.getName();
        this.participantIds = chatRoom.getParticipants().stream()
                .map(Member::getId)
                .collect(Collectors.toList());
        this.participantNames = chatRoom.getParticipants().stream()
                .map(Member::getName)
                .collect(Collectors.toList());
        this.createdDate = chatRoom.getRegTime();
    }
}
