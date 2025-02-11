package com.javalab.student.service;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.entity.ChatMessage;
import com.javalab.student.entity.ChatRoom;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.ChatMessageRepository;
import com.javalab.student.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ✅ 채팅 메시지 관련 서비스
 * - 상담 채팅 메시지 관련 비즈니스 로직을 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 🔹 메시지를 저장하고 WebSocket을 통해 채팅방에 전달
     */
    @Transactional
    public void saveAndSendMessage(ChatMessageDto messageDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(messageDto.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("상담 채팅방을 찾을 수 없습니다."));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(Member.builder().id(messageDto.getSenderId()).build())
                .content(messageDto.getContent())
                .sentAt(LocalDateTime.now())
                .isSystemMessage(messageDto.isSystemMessage())
                .isRead(false) // 새 메시지는 기본적으로 읽지 않은 상태로 저장
                .build();

        chatMessageRepository.save(chatMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + messageDto.getChatRoomId(), messageDto);
    }

    /**
     * 🔹 특정 상담 채팅방의 메시지 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessagesByChatRoom(Long chatRoomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderBySentAtAsc(chatRoomId);

        return messages.stream().map(msg -> new ChatMessageDto(
                msg.getId(),
                msg.getContent(),
                msg.getChatRoom().getId(),
                msg.getSender().getId(),
                msg.getSentAt(),
                msg.isSystemMessage(),
                msg.isRead()
        )).collect(Collectors.toList());
    }

    /**
     * 🔹 특정 사용자가 읽지 않은 메시지 개수 조회
     */
    @Transactional(readOnly = true)
    public long countUnreadMessages(Long chatRoomId, Long memberId) {
        return chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(chatRoomId, memberId);
    }

    /**
     * 🔹 특정 사용자가 해당 채팅방의 모든 메시지를 읽음 처리
     */
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long memberId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findByChatRoomIdAndSenderIdNotAndIsReadFalse(chatRoomId, memberId);
        unreadMessages.forEach(msg -> msg.setRead(true));
        chatMessageRepository.saveAll(unreadMessages);
    }
    /**
     * 🔹 특정 상담 채팅방의 이전 메시지를 조회
     *
     * @param roomId 채팅방 ID
     * @return 해당 채팅방의 모든 메시지 목록 DTO
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getPreviousMessages(Long roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderBySentAtAsc(roomId);
        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 🔹 ChatMessage 엔티티를 ChatMessageDto로 변환
     */
    private ChatMessageDto convertToDto(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .id(chatMessage.getId())
                .chatRoomId(chatMessage.getChatRoom().getId())
                .senderId(chatMessage.getSender().getId())
                .content(chatMessage.getContent())
                .sentAt(chatMessage.getSentAt())
                .isSystemMessage(chatMessage.isSystemMessage())
                .isRead(chatMessage.isRead())
                .build();
    }
}
