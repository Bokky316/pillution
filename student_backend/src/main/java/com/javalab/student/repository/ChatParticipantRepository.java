package com.javalab.student.repository;

import com.javalab.student.entity.ChatParticipant;
import com.javalab.student.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ✅ 채팅 참가자 레포지토리
 * - 채팅 참가자 데이터를 데이터베이스에서 조회, 저장, 삭제하는 기능을 제공
 */
@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    /**
     * 🔹 특정 채팅방의 모든 참여자 조회
     * - 채팅방 엔터티를 기준으로 참여자를 반환
     */
    List<ChatParticipant> findByChatRoom(ChatRoom chatRoom);

    /**
     * 🔹 특정 회원이 참여한 모든 채팅방 조회
     * - 회원 ID를 기준으로 참여한 모든 채팅방을 반환
     */
    List<ChatParticipant> findByMemberId(Long memberId);


    /**
     * 🔹 특정 회원이 특정 채팅방에 참여하고 있는지 확인
     * - 회원 ID와 채팅방 ID를 기준으로 존재 여부를 반환
     */
    boolean existsByChatRoomIdAndMemberId(Long chatRoomId, Long memberId);

    /**
     * 🔹 특정 회원의 특정 채팅방 참가 정보 조회
     * - 회원 ID와 채팅방 ID를 기준으로 참가 정보를 반환
     */
    List<ChatParticipant> findByMemberIdAndChatRoomId(Long memberId, Long chatRoomId);

}
