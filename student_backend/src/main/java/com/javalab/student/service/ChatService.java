package com.javalab.student.service;

import com.javalab.student.constant.MessageType;
import com.javalab.student.constant.Role;
import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.entity.*;
import com.javalab.student.repository.ChatMessageRepository;
import com.javalab.student.repository.ChatRoomRepository;
import com.javalab.student.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;

    /**
     * 새로운 채팅방을 생성합니다.
     *
     * @param userId           사용자 ID
     * @param consultationType 상담 유형
     * @param userIssue        사용자 문제
     * @return 생성된 채팅방 정보
     */
    public ChatRoomDto createChatRoom(Long userId, ConsultationType consultationType, String userIssue) {
        ChatRoom chatRoom = ChatRoom.builder()
                .name("Chat Room " + System.currentTimeMillis()) // name 필드에 값을 설정
                .user(memberRepository.findById(userId).orElseThrow())
                .consultationType(consultationType)
                .userIssue(userIssue)
                .status(ChatRoomStatus.WAITING)
                .build();
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(savedChatRoom);
    }


    /**
     * 상담사를 채팅방에 배정합니다.
     *
     * @param roomId       채팅방 ID
     * @param consultantId 상담사 ID
     * @return 업데이트된 채팅방 정보
     */
    public ChatRoomDto assignConsultant(Long roomId, Long consultantId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow();
        chatRoom.setConsultant(memberRepository.findById(consultantId).orElseThrow());
        ChatRoom updatedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(updatedChatRoom);
    }

    /**
     * 상담을 종료합니다.
     *
     * @param roomId         채팅방 ID
     * @param result         상담 결과
     * @param consultantMemo 상담사 메모
     */
    public void endConsultation(Long roomId, ConsultationResult result, String consultantMemo) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));
        chatRoom.setStatus(ChatRoomStatus.CLOSED);
        chatRoom.getConsultation().setResult(result);
        chatRoom.getConsultation().setConsultantMemo(consultantMemo);
        chatRoom.setEndedAt(LocalDateTime.now());  // 상담 종료 시간 기록
        chatRoomRepository.save(chatRoom);
    }

    /**
     * 채팅 메시지를 전송합니다.
     *
     * @param chatMessageDto 채팅 메시지 정보
     * @return 전송된 채팅 메시지 정보
     */
    public ChatMessageDto sendMessage(ChatMessageDto chatMessageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(chatMessageDto.getRoomId())
                .senderId(chatMessageDto.getSenderId())
                .content(chatMessageDto.getContent())
                .build();
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        return ChatMessageDto.fromEntity(savedMessage);
    }

    /**
     * 특정 채팅방의 모든 메시지를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     */
    public List<ChatMessageDto> getChatMessagesByRoomId(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return messages.stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자의 채팅방 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 채팅방 목록
     */
    public List<ChatRoomDto> getChatRoomsByUserId(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByUserIdOrConsultantId(userId, userId);
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 상담 요청 목록을 조회합니다.
     *
     * @return 상담 요청 목록
     */
    public List<ChatRoomDto> getConsultationRequests() {
        List<ChatRoom> requests = chatRoomRepository.findByStatus(ChatRoomStatus.WAITING);
        return requests.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 상담 요청을 수락합니다.
     *
     * @param requestId 요청 ID
     * @return 수락된 채팅방 정보
     */
    public ChatRoomDto acceptConsultationRequest(Long requestId) {
        ChatRoom chatRoom = chatRoomRepository.findById(requestId).orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));
        chatRoom.setStatus(ChatRoomStatus.ACTIVE);
        chatRoom.setStartedAt(LocalDateTime.now());  // 상담 시작 시간 기록
        ChatRoom updatedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(updatedChatRoom);
    }

    /**
     * 채팅방의 다른 참가자 ID를 조회합니다.
     *
     * @param roomId   채팅방 ID
     * @param senderId 메시지 발신자 ID
     * @return 다른 참가자 ID
     */
    public Long getReceiverIdForRoom(Long roomId, Long senderId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow();
        if (chatRoom.getUser().getId().equals(senderId)) {
            return chatRoom.getConsultant().getId();
        } else {
            return chatRoom.getUser().getId();
        }
    }

    /**
     * 사용자를 채팅방에 참여시킵니다.
     *
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     */
    public void joinChatRoom(Long roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));
        Member member = memberRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 채팅방 입장 로직 구현
        if (chatRoom.getStatus() == ChatRoomStatus.WAITING) {
            chatRoom.setStatus(ChatRoomStatus.ACTIVE);
            chatRoom.setStartedAt(LocalDateTime.now());
        }

        // 필요한 경우 추가 로직 구현 (예: 참여자 목록에 추가 등)

        chatRoomRepository.save(chatRoom);
    }

    /**
     * 사용자를 채팅방에서 퇴장시킵니다.
     *
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     */
    public void leaveChatRoom(Long roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));
        Member member = memberRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 채팅방 퇴장 로직 구현
        if (chatRoom.getStatus() == ChatRoomStatus.ACTIVE) {
            chatRoom.setStatus(ChatRoomStatus.CLOSED);
            chatRoom.setEndedAt(LocalDateTime.now());
        }

        // 필요한 경우 추가 로직 구현 (예: 참여자 목록에서 제거 등)

        chatRoomRepository.save(chatRoom);
    }

    /**
     * 모든 채팅방 목록을 조회합니다.
     *
     * @return 채팅방 목록
     */
    public List<ChatRoomDto> getAllChatRooms() {
        List<ChatRoom> chatRooms = chatRoomRepository.findAll();
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }
}
