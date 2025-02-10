package com.javalab.student.service;

import com.javalab.student.constant.ConsultationRequestStatus;
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
 * 상담 채팅방 서비스 클래스
 * - 채팅방 생성, 조회, 삭제, 나가기, 상태 변경 등의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;

    /**
     * 상담 채팅방 생성
     *
     * @param request 상담 요청 DTO (ConsultationRequestDto)
     * @return 생성된 채팅방 엔티티 (ChatRoom)
     */
    @Transactional
    public ChatRoom createChatRoom(ConsultationRequestDto request) {
        Member customer = memberRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(request.getTopic().name() + " 상담");
        chatRoom.setOwner(customer);
        chatRoom.setStatus(ConsultationRequestStatus.PENDING);

        chatParticipantRepository.save(new ChatParticipant(chatRoom, customer));

        return chatRoomRepository.save(chatRoom);
    }

    /**
     * 상담사 연결 요청
     *
     * @param roomId 상담 채팅방 ID
     */
    @Transactional
    public void requestCounselor(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        chatRoom.updateStatus(ConsultationRequestStatus.IN_PROGRESS);
        chatRoomRepository.save(chatRoom);
    }

    /**
     * 특정 회원이 참여한 채팅방 목록 조회 (상세 정보 포함)
     *
     * @param memberId 회원 ID
     * @return 해당 회원이 참여한 채팅방 목록 (List<ChatRoomResponseDto>)
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getChatRoomsByMemberIdWithDetails(Long memberId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByMemberId(memberId);

        return chatRooms.stream()
                .map(this::convertToChatRoomResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 채팅방 상세 정보 조회
     *
     * @param roomId 채팅방 ID
     * @return 채팅방 상세 정보 (ChatRoomResponseDto)
     */
    @Transactional(readOnly = true)
    public ChatRoomResponseDto getChatRoomDetails(Long roomId) {
        ChatRoom chat = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        return convertToChatRoomResponseDto(chat);
    }

    /**
     * 특정 채팅방 삭제
     *
     * @param roomId 삭제할 채팅방 ID
     */
    @Transactional
    public void deleteChatRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom(chatRoom);
        if (!participants.isEmpty()) {
            chatParticipantRepository.deleteAll(participants);
        }

        chatRoomRepository.delete(chatRoom);
    }

    /**
     * 특정 회원이 채팅방에서 나가기
     *
     * @param memberId 회원 ID
     * @param roomId   나가려는 채팅방 ID
     */
    @Transactional
    public void leaveChatRoom(Long memberId, Long roomId) {
        if (!chatParticipantRepository.existsByChatRoomIdAndMemberId(roomId, memberId)) {
            throw new RuntimeException("해당 채팅방에 참여하고 있지 않습니다.");
        }

        List<ChatParticipant> participants = chatParticipantRepository.findByMemberIdAndChatRoomId(memberId, roomId);
        participants.forEach(ChatParticipant::leaveRoom);

        chatParticipantRepository.saveAll(participants);
    }

    /**
     * 특정 채팅방 상담 종료 처리
     *
     * @param roomId 종료할 채팅방 ID
     */
    @Transactional
    public void closeChat(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        chatRoom.updateStatus(ConsultationRequestStatus.CLOSED);
        chatRoomRepository.save(chatRoom);
    }

    /**
     * 대기 중인 상담 요청 목록 조회
     *
     * @return 대기 중인 상담 요청 목록 (List<ChatRoomResponseDto>)
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getPendingChatRooms() {
        List<ChatRoom> pendingRooms = chatRoomRepository.findByStatus(ConsultationRequestStatus.PENDING);

        return pendingRooms.stream()
                .map(this::convertToChatRoomResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 모든 상담 채팅방 조회
     *
     * @return 모든 상담 채팅방 목록 (List<ChatRoomResponseDto>)
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getAllChatRooms() {
        List<ChatRoom> allChatRooms = chatRoomRepository.findAll();

        return allChatRooms.stream()
                .map(this::convertToChatRoomResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 상담사의 종료된 상담 목록 조회
     *
     * @param counselorId 상담사 ID
     * @return 종료된 상담 목록 (List<ChatRoomResponseDto>)
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getClosedChatsByCounselor(Long counselorId) {
        List<ChatRoom> closedRooms = chatRoomRepository.findClosedChatRoomsByCounselor(counselorId);

        return closedRooms.stream()
                .map(this::convertToChatRoomResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * ChatRoom 엔티티를 ChatRoomResponseDto로 변환하는 메서드
     *
     * @param chat 변환할 ChatRoom 엔티티
     * @return 변환된 ChatRoomResponseDto 객체
     */
    private ChatRoomResponseDto convertToChatRoomResponseDto(ChatRoom chat) {
        return new ChatRoomResponseDto(
                chat.getId(),
                chat.getName(),
                chat.getRegTime(),
                chat.getOwner().getId(),
                chat.getOwner().getName(),
                chat.getStatus().name(),
                null // 주제는 필요 시 추가 구현 가능
        );
    }
}
