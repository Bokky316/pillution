package com.javalab.student.repository;

import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 채팅방 레포지토리
 * 채팅방과 관련된 데이터베이스 작업을 처리합니다.
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    /**
     * 특정 참가자가 속한 채팅방 목록을 조회합니다.
     * @param member 참가자
     * @return 채팅방 목록
     */
    List<ChatRoom> findByParticipantsContaining(Member member);
}
