package com.javalab.student.repository;

import com.javalab.student.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(Long roomId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.roomId IN " +
            "(SELECT c.id FROM ChatRoom c WHERE c.user.id = :userId OR c.consultant.id = :userId) " +
            "AND m.senderId != :userId AND m.isRead = false")
    int countUnreadMessagesByUserId(@Param("userId") Long userId);

    int countByRoomIdAndIsReadFalse(Long roomId);
}
