package com.javalab.student.service;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.entity.*;
import com.javalab.student.repository.ChatMessageRepository;
import com.javalab.student.repository.ChatRoomRepository;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.security.dto.MemberSecurityDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 새로운 채팅방을 생성합니다.
     *
     * @param name 채팅방 이름
     * @param participantIds 참가자 ID 목록
     * @return 생성된 채팅방 정보
     * @throws RuntimeException 참가자를 찾을 수 없는 경우
     */
    @Transactional
    public ChatRoomDto createChatRoom(String name, List<Long> participantIds) {
        List<Member> participants = memberRepository.findAllById(participantIds);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(name);
        chatRoom.setParticipants(participants);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        return new ChatRoomDto(savedChatRoom);
    }

    /**
     * 모든 채팅방 목록을 조회합니다.
     *
     * @return 채팅방 목록
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getAllChatRooms() {
        return chatRoomRepository.findAll().stream()
                .map(ChatRoomDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 채팅 메시지를 전송합니다.
     * @param roomId 채팅방 ID
     * @param senderId 발신자 ID
     * @param content 메시지 내용
     * @return 저장된 채팅 메시지 정보
     */
    @Transactional
    public ChatMessageDto sendMessage(Long roomId, Long senderId, String content) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다."));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(content)
                .build();
        chatMessageRepository.save(chatMessage);

        ChatMessageDto messageDto = new ChatMessageDto(chatMessage);

        // WebSocket을 통해 실시간으로 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat", messageDto);

        return messageDto;
    }

    /**
     * 특정 채팅방의 메시지 목록을 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     * @throws RuntimeException 채팅방을 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatMessages(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        return chatMessageRepository.findByChatRoomOrderByRegTimeAsc(chatRoom).stream()
                .map(ChatMessageDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자의 채팅방 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자가 참여중인 채팅방 목록
     * @throws RuntimeException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getUserChatRooms(Long userId) {
        Member member = memberRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        List<ChatRoom> chatRooms = chatRoomRepository.findByParticipantsContaining(member);
        return chatRooms.stream().map(room -> {
            ChatRoomDto dto = new ChatRoomDto(room);
            dto.setParticipantIds(room.getParticipants().stream().map(Member::getId).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }


    /**
     * 채팅방에 새로운 참가자를 추가합니다.
     *
     * @param roomId 채팅방 ID
     * @param userId 추가할 사용자 ID
     * @throws RuntimeException 채팅방 또는 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void addParticipantToChatRoom(Long roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        Member newParticipant = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        if (!chatRoom.getParticipants().contains(newParticipant)) {
            chatRoom.getParticipants().add(newParticipant);
            chatRoomRepository.save(chatRoom);
        }
    }

    /**
     * 채팅방의 읽지 않은 메시지 수를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 읽지 않은 메시지 수
     */
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(Long roomId, Long userId) {
        return chatMessageRepository.countUnreadMessages(roomId, userId);
    }

    /**
     * 채팅 메시지를 읽음 처리합니다.
     *
     * @param messageId 메시지 ID
     * @param userId 사용자 ID
     */
    @Transactional
    public void markMessageAsRead(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다."));
        if (!message.getReadByUserIds().contains(userId)) {
            message.getReadByUserIds().add(userId);
            chatMessageRepository.save(message);
        }
    }


    /**
     * 사용자가 채팅방을 나갑니다.
     *
     * @param roomId 채팅방 ID
     * @throws RuntimeException 채팅방 또는 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void leaveChatRoom(Long roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (chatRoom.getParticipants().contains(member)) {
            chatRoom.getParticipants().remove(member);
            chatRoomRepository.save(chatRoom);

            if (chatRoom.getParticipants().isEmpty()) {
                chatRoomRepository.delete(chatRoom);
            } else {
                String content = member.getName() + "님이 채팅방을 나갔습니다.";
                ChatMessage systemMessage = ChatMessage.createSystemMessage(chatRoom, content);
                chatMessageRepository.save(systemMessage);
                messagingTemplate.convertAndSend("/topic/chat/" + roomId, new ChatMessageDto(systemMessage));
            }
        } else {
            throw new RuntimeException("사용자가 해당 채팅방의 참가자가 아닙니다.");
        }
    }

    /**
     * 사용자의 입력 상태를 설정합니다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @param isTyping 입력 중 여부
     */
    public void setUserTypingStatus(Long roomId, Long userId, boolean isTyping) {
        try {
            ChatMessageDto typingStatus = new ChatMessageDto();
            typingStatus.setRoomId(roomId);
            typingStatus.setTypingUserId(userId);
            typingStatus.setTyping(isTyping);
            messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing", typingStatus);
            log.info("사용자 타이핑 상태 업데이트: roomId={}, userId={}, isTyping={}", roomId, userId, isTyping);
        } catch (Exception e) {
            log.error("사용자 타이핑 상태 업데이트 중 오류 발생", e);
        }
    }

    /**
     * 메시지 읽음 상태를 업데이트합니다.
     * @param messageId 메시지 ID
     * @param userId 사용자 ID
     */
    @Transactional
    public void updateMessageReadStatus(Long messageId, Long userId) {
        try {
            ChatMessage message = chatMessageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다."));
            message.markAsRead(userId);
            chatMessageRepository.save(message);

            ChatMessageDto readStatus = new ChatMessageDto();
            readStatus.setId(messageId);
            readStatus.setSenderId(userId);
            messagingTemplate.convertAndSend("/topic/chat/" + message.getChatRoom().getId() + "/read", readStatus);
            log.info("메시지 읽음 상태 업데이트: messageId={}, userId={}", messageId, userId);
        } catch (Exception e) {
            log.error("메시지 읽음 상태 업데이트 중 오류 발생", e);
        }
    }

}
