package com.javalab.student.repository;

import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.ChatRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 채팅방 레포지토리
 * 채팅방과 관련된 데이터베이스 작업을 처리합니다.
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /**
     * 특정 사용자가 참여하고 있는 모든 채팅방을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자가 참여하고 있는 채팅방 목록
     */
    @Query("SELECT c FROM ChatRoom c WHERE c.user.id = :userId OR c.consultant.id = :userId")
    List<ChatRoom> findByUserId(@Param("userId") Long userId);

    /**
     * 특정 상태의 모든 채팅방을 조회합니다.
     *
     * @param status 채팅방 상태
     * @return 해당 상태의 채팅방 목록
     */
    List<ChatRoom> findByStatus(ChatRoomStatus status);

    /**
     * 특정 사용자의 활성 상태 채팅방을 조회합니다.
     *
     * @param userId 사용자 ID
     * @param status 채팅방 상태
     * @return 사용자의 활성 상태 채팅방 목록
     */
    @Query("SELECT c FROM ChatRoom c WHERE (c.user.id = :userId OR c.consultant.id = :userId) AND c.status = :status")
    List<ChatRoom> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ChatRoomStatus status);
}
