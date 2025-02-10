package com.javalab.student.service;

import com.javalab.student.dto.ChatRoomResponseDto;
import com.javalab.student.dto.ConsultationRequestDto;
import com.javalab.student.entity.ChatParticipant;
import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.ChatParticipantRepository;
import com.javalab.student.repository.ChatRoomRepository;
import com.javalab.student.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 상담 채팅방 관련 서비스
 */
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;

    /**
     * 🔹 상담 채팅방 생성 메서드
     *
     * @param request 상담 요청 DTO (ConsultationRequestDto)
     * @return 생성된 채팅방 엔터티 (ChatRoom)
     */
    @Transactional
    public ChatRoom createChatRoom(ConsultationRequestDto request) {
        Member customer = memberRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        Member csAgent = memberRepository.findById(request.getCsAgentId())
                .orElseThrow(() -> new RuntimeException("상담사를 찾을 수 없습니다."));

        // 새로운 채팅방 생성
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(request.getTopic().name() + " 상담"); // 주제를 기반으로 이름 설정
        chatRoom.setOwner(customer);

        // 참여자 추가 (고객과 상담사)
        chatParticipantRepository.save(new ChatParticipant(chatRoom, customer));
        chatParticipantRepository.save(new ChatParticipant(chatRoom, csAgent));

        return chatRoomRepository.save(chatRoom);
    }

    /**
     * 🔹 특정 회원이 참여한 상담 채팅방 목록 조회 메서드
     *
     * @param memberId 회원 ID
     * @return 해당 회원이 참여한 채팅방 목록 (DTO 리스트)
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getChatRoomsByMemberIdWithDetails(Long memberId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByMemberId(memberId);

        return chatRooms.stream()
                .map(chat -> new ChatRoomResponseDto(
                        chat.getId(),
                        chat.getName(),
                        chat.getRegTime(),
                        chat.getOwner().getId(),
                        chat.getOwner().getName(),
                        "DETAILS",
                        null // 주제는 필요 시 추가 구현 가능
                ))
                .collect(Collectors.toList());
    }

    /**
     * 🔹 특정 상담 채팅방 상세 조회 메서드
     *
     * @param roomId 채팅방 ID
     * @return 채팅방 상세 정보 (DTO)
     */
    @Transactional(readOnly = true)
    public ChatRoomResponseDto getChatRoomDetails(Long roomId) {
        ChatRoom chat = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        return new ChatRoomResponseDto(
                chat.getId(),
                chat.getName(),
                chat.getRegTime(),
                chat.getOwner().getId(),
                chat.getOwner().getName(),
                "DETAILS",
                null // 주제는 필요 시 추가 구현 가능
        );
    }

    /**
     * 🔹 특정 상담 채팅방 삭제 메서드
     *
     * @param roomId 채팅방 ID
     */
    @Transactional
    public void deleteChatRoom(Long roomId) {
        // 채팅방 조회
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 연관된 참가자 정보 삭제
        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom(chatRoom);
        if (!participants.isEmpty()) {
            chatParticipantRepository.deleteAll(participants);
        }

        // 채팅방 삭제
        chatRoomRepository.delete(chatRoom);
    }

    /**
     * 🔹 채팅방 나가기
     * - 특정 회원이 특정 채팅방에서 나갈 때 호출
     *
     * @param memberId 나가려는 회원의 ID
     * @param roomId 나가려는 채팅방의 ID
     */
    @Transactional
    public void leaveChatRoom(Long memberId, Long roomId) {
        // 해당 회원이 해당 채팅방에 참여 중인지 확인
        if (!chatParticipantRepository.existsByChatRoomIdAndMemberId(roomId, memberId)) {
            throw new RuntimeException("해당 채팅방에 참여하고 있지 않습니다.");
        }

        // 참여 정보를 가져와 상태를 '나감'으로 변경
        List<ChatParticipant> participants = chatParticipantRepository.findByMemberIdAndChatRoomId(memberId, roomId);
        participants.forEach(ChatParticipant::leaveRoom);

        // 변경된 상태 저장
        chatParticipantRepository.saveAll(participants);
    }
}