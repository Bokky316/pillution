package com.javalab.student.repository;

import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 채팅방 레포지토리
 * 채팅방과 관련된 데이터베이스 작업을 처리합니다.
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByUser1IdOrUser2Id(Long user1Id, Long user2Id);

    /**
     * 특정 사용자가 참여하고 있는 모든 채팅방을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자가 참여하고 있는 채팅방 목록
     */
    @Query("SELECT c FROM ChatRoom c WHERE c.user1Id = :userId OR c.user2Id = :userId")
    List<ChatRoom> findByParticipantsId(@Param("userId") Long userId);
}
