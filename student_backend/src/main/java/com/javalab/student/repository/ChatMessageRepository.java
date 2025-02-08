package com.javalab.student.repository;

import com.javalab.student.entity.ChatMessage;
import com.javalab.student.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * 채팅 메시지 레포지토리
 * 채팅 메시지와 관련된 데이터베이스 작업을 처리합니다.
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    /**
     * 특정 채팅방의 메시지를 시간 순으로 조회합니다.
     * @param chatRoom 조회할 채팅방
     * @return 채팅 메시지 목록
     */
    List<ChatMessage> findByChatRoomOrderByRegTimeAsc(ChatRoom chatRoom);

    /**
     * 특정 채팅방의 읽지 않은 메시지 수를 조회합니다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 읽지 않은 메시지 수
     */
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.sender.id != :userId AND m.read = false")
    int countUnreadMessages(Long roomId, Long userId);
}
