package com.javalab.student.repository;

import com.javalab.student.entity.ChatMessage;
import com.javalab.student.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(Long roomId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.roomId IN " +
            "(SELECT c.id FROM ChatRoom c WHERE c.user1Id = :userId OR c.user2Id = :userId) " +
            "AND m.senderId != :userId AND m.isRead = false")
    int countUnreadMessagesByUserId(Long userId);

    /**
     * 특정 채팅방의 읽지 않은 메시지 수를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 읽지 않은 메시지 수
     */
    int countByRoomIdAndIsReadFalse(Long roomId);
}
