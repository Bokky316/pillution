package com.javalab.student.repository;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.entity.message.ChatRoom;
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
     * @param memberId 회원 ID
     * @return 회원이 참여했거나 초대받은 채팅방 목록
     */
    @Query(value = "SELECT cr.* FROM chat_room cr " +
            "JOIN chat_participant cp ON cr.id = cp.chat_room_id " +
            "WHERE cp.member_id = :memberId AND cr.status IN ('PENDING', 'IN_PROGRESS')",
            nativeQuery = true)
    List<ChatRoom> findUserChatRooms(@Param("memberId") Long memberId);

    /**
     * 🔹 대기 중인(PENDING) 상담 요청 목록 조회
     * - 상태가 PENDING인 모든 채팅방을 반환
     * @return 대기 중인 상담 요청 목록
     */
    List<ChatRoom> findByStatus(ConsultationRequestStatus status);

    /**
     * 🔹 특정 상담사가 참여한 종료된(CLOSED) 상담 목록 조회
     * @param counselorId 상담사 ID
     * @return 종료된 상담 목록
     */
    @Query(value = "SELECT cr.* FROM chat_room cr " +
            "JOIN chat_participant cp ON cr.id = cp.chat_room_id " +
            "WHERE cp.member_id = :counselorId AND cr.status = 'CLOSED'",
            nativeQuery = true)
    List<ChatRoom> findClosedChatRoomsByCounselor(@Param("counselorId") Long counselorId);

    /**
     * 🔹 모든 채팅방 조회
     * - 데이터베이스에 있는 모든 채팅방을 반환
     * @return 모든 채팅방 목록
     */
    List<ChatRoom> findAll();
}
