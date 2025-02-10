package com.javalab.student.repository;

import com.javalab.student.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ✅ 채팅 메시지 레포지토리
 * - 채팅 메시지 데이터를 데이터베이스에서 조회, 저장, 삭제하는 기능을 제공
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * 🔹 특정 채팅방의 모든 메시지 조회 (오래된 순)
     */
    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);

    /**
     * 🔹 특정 사용자가 보낸 메시지 조회 (최신순)
     */
    List<ChatMessage> findBySenderIdOrderBySentAtDesc(Long senderId);

    /**
     * 🔹 특정 채팅방에서 특정 사용자가 읽지 않은 메시지 조회
     */
    List<ChatMessage> findByChatRoomIdAndSenderIdNotAndIsReadFalse(Long chatRoomId, Long senderId);

    /**
     * 🔹 특정 채팅방에서 특정 사용자가 읽지 않은 메시지 개수 조회
     */
    long countByChatRoomIdAndSenderIdNotAndIsReadFalse(Long chatRoomId, Long senderId);
}
