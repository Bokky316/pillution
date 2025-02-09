package com.javalab.student.service;


import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.entity.*;
import com.javalab.student.repository.ChatMessageRepository;
import com.javalab.student.repository.ChatRoomRepository;
import com.javalab.student.repository.MemberRepository;
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
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;

    /**
     * 새로운 채팅방을 생성합니다.
     *
     * @param userId 사용자 ID
     * @param consultationType 상담 유형
     * @param userIssue 사용자가 입력한 상담 주제
     * @return 생성된 채팅방 정보
     */
    @Transactional
    public ChatRoomDto createChatRoom(Long userId, ConsultationType consultationType, String userIssue) {
        Member user = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatRoom chatRoom = ChatRoom.builder()
                .name("Consultation for " + user.getName())
                .user(user)
                .status(ChatRoomStatus.WAITING)
                .consultationType(consultationType)
                .userIssue(userIssue)
                .build();

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(savedChatRoom);
    }

    /**
     * 상담사를 채팅방에 배정합니다.
     *
     * @param roomId 채팅방 ID
     * @param consultantId 상담사 ID
     * @return 업데이트된 채팅방 정보
     */
    @Transactional
    public ChatRoomDto assignConsultant(Long roomId, Long consultantId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        Member consultant = memberRepository.findById(consultantId)
                .orElseThrow(() -> new RuntimeException("Consultant not found"));

        chatRoom.setConsultant(consultant);
        chatRoom.setStatus(ChatRoomStatus.ACTIVE);

        Consultation consultation = Consultation.builder()
                .chatRoom(chatRoom)
                .startTime(LocalDateTime.now())
                .build();
        chatRoom.setConsultation(consultation);

        ChatRoom updatedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(updatedChatRoom);
    }

    /**
     * 상담을 종료합니다.
     *
     * @param roomId 채팅방 ID
     * @param result 상담 결과
     * @param consultantMemo 상담사 메모
     */
    @Transactional
    public void endConsultation(Long roomId, ConsultationResult result, String consultantMemo) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        chatRoom.setStatus(ChatRoomStatus.CLOSED);
        Consultation consultation = chatRoom.getConsultation();
        consultation.setResult(result);
        consultation.setConsultantMemo(consultantMemo);
        consultation.setEndTime(LocalDateTime.now());

        chatRoomRepository.save(chatRoom);
    }

    /**
     * 특정 채팅방 정보를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 조회된 채팅방 정보
     */
    @Transactional(readOnly = true)
    public ChatRoomDto getChatRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return ChatRoomDto.fromEntity(chatRoom);
    }

    /**
     * 모든 채팅방 목록을 조회합니다.
     *
     * @return 채팅방 목록
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getAllChatRooms() {
        List<ChatRoom> chatRooms = chatRoomRepository.findAll();
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 채팅방 정보를 수정합니다.
     *
     * @param roomId 채팅방 ID
     * @param chatRoomDto 수정할 채팅방 정보
     * @return 수정된 채팅방 정보
     */
    @Transactional
    public ChatRoomDto updateChatRoom(Long roomId, ChatRoomDto chatRoomDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        // 필요한 필드만 업데이트
        chatRoom.setName(chatRoomDto.getName());
        chatRoom.setStatus(chatRoomDto.getStatus());
        ChatRoom updatedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(updatedChatRoom);
    }

    /**
     * 채팅 메시지를 전송합니다.
     *
     * @param chatMessageDto 전송할 채팅 메시지 정보
     * @return 전송된 채팅 메시지 정보
     */
    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto chatMessageDto) {
        ChatMessage chatMessage = ChatMessage.fromDto(chatMessageDto);
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        return ChatMessageDto.fromEntity(savedMessage);
    }

    /**
     * 특정 채팅방의 모든 메시지를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatMessagesByRoomId(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return messages.stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 채팅 메시지를 수정합니다.
     *
     * @param messageId 메시지 ID
     * @param chatMessageDto 수정할 메시지 정보
     * @return 수정된 메시지 정보
     */
    @Transactional
    public ChatMessageDto updateMessage(Long messageId, ChatMessageDto chatMessageDto) {
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Chat message not found"));
        chatMessage.updateFromDto(chatMessageDto);
        ChatMessage updatedMessage = chatMessageRepository.save(chatMessage);
        return ChatMessageDto.fromEntity(updatedMessage);
    }

    /**
     * 채팅 메시지를 삭제합니다.
     *
     * @param messageId 메시지 ID
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        chatMessageRepository.deleteById(messageId);
    }

    /**
     * 특정 채팅방의 읽지 않은 메시지 수를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 읽지 않은 메시지 수
     */
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(Long roomId) {
        return chatMessageRepository.countByRoomIdAndIsReadFalse(roomId);
    }

    /**
     * 특정 사용자의 채팅방 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 채팅방 목록
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getChatRoomsByUserId(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByUserId(userId);
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 채팅방의 다른 참가자 ID를 가져옵니다.
     *
     * @param roomId 채팅방 ID
     * @param senderId 발신자 ID
     * @return 수신자 ID
     */
    public Long getReceiverIdForRoom(Long roomId, Long senderId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getUser().getId().equals(senderId)) {
            return chatRoom.getConsultant().getId();
        } else {
            return chatRoom.getUser().getId();
        }
    }
}
