package com.javalab.student.repository;

import com.javalab.student.entity.ChatMessage;
import com.javalab.student.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomOrderByRegTimeAsc(ChatRoom chatRoom);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.sender.id <> :userId AND :userId NOT IN elements(m.readByUserIds)")
    int countUnreadMessages(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
