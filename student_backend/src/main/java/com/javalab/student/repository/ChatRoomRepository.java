package com.javalab.student.repository;

import com.javalab.student.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ✅ 채팅방 관련 데이터베이스 접근 레포지토리
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /**
     * 🔹 특정 회원이 참여한 채팅방 목록 조회
     * - 회원이 참여 중인 채팅방을 반환
     * @param memberId 회원 ID
     * @return 회원이 참여한 채팅방 목록
     */
    @Query(value = "SELECT cr.* FROM chat_room cr " +
            "JOIN chat_participant cp ON cr.id = cp.chat_room_id " +
            "WHERE cp.member_id = :memberId",
            nativeQuery = true)
    List<ChatRoom> findByMemberId(@Param("memberId") Long memberId);

    /**
     * 🔹 특정 회원이 참여했거나 초대받은 채팅방 목록 조회
     * - JOINED 상태 또는 PENDING 상태의 채팅방을 반환
     */
    @Query(value = "SELECT cr.chat_room_id, cr.name, cr.reg_time, cr.owner_id, m.name AS owner_name, 'JOINED' AS status " +
            " FROM chat_room cr " +
            " JOIN member m ON cr.owner_id = m.member_id " +
            " WHERE cr.owner_id = :memberId " +
            " UNION " +
            " (SELECT cr.chat_room_id, cr.name, cr.reg_time, cr.owner_id, m.name AS owner_name, 'PENDING' AS status " +
            " FROM chat_room cr " +
            " JOIN chat_invitation ci ON cr.chat_room_id = ci.chat_room_id " +
            " JOIN member m ON cr.owner_id = m.member_id " +
            " WHERE ci.invited_member_id = :memberId AND ci.status = 'PENDING')",
            nativeQuery = true)
    List<Object[]> findUserChatRooms(@Param("memberId") Long memberId);
}
