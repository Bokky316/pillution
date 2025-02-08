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
        if (participants.size() != participantIds.size()) {
            throw new RuntimeException("일부 참가자를 찾을 수 없습니다.");
        }
        ChatRoom chatRoom = ChatRoom.builder()
                .name(name)
                .participants(participants)
                .build();
        chatRoomRepository.save(chatRoom);
        return new ChatRoomDto(chatRoom);
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
     *
     * @param roomId 채팅방 ID
     * @param senderId 발신자 ID
     * @param content 메시지 내용
     * @return 저장된 채팅 메시지 정보
     * @throws RuntimeException 채팅방 또는 발신자를 찾을 수 없는 경우
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
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, messageDto);

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
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return chatRoomRepository.findByParticipantsContaining(member).stream()
                .map(ChatRoomDto::new)
                .collect(Collectors.toList());
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
        message.markAsRead(userId);
        chatMessageRepository.save(message);
    }

    /**
     * 사용자가 채팅방을 나갑니다.
     *
     * @param roomId 채팅방 ID
     * @throws RuntimeException 채팅방 또는 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void leaveChatRoom(Long roomId) {
        // 1. Authentication 객체를 사용하여 현재 인증된 사용자의 정보를 가져옴
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 2. 인증된 사용자인지 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("인증되지 않은 사용자가 채팅방 나가기를 시도했습니다.");
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        // 3. 사용자 ID 확인 (Principal 타입에 따라 처리)
        Object principal = authentication.getPrincipal();
        Long userId = null;

        if (principal instanceof MemberSecurityDto) {
            MemberSecurityDto userDetails = (MemberSecurityDto) principal;
            userId = userDetails.getId();
        } else if (principal instanceof String) {
            String email = (String) principal;
            Member member = memberRepository.findByEmail(email);
            if (member != null) {
                userId = member.getId();
            } else {
                throw new RuntimeException("사용자를 찾을 수 없습니다.");
            }
        } else if (principal instanceof OAuth2AuthenticatedPrincipal) {
            OAuth2AuthenticatedPrincipal oAuth2Principal = (OAuth2AuthenticatedPrincipal) principal;
            String email = oAuth2Principal.getAttribute("email"); // OAuth2 사용자의 이메일
            Member member = memberRepository.findByEmail(email);
            if (member != null) {
                userId = member.getId();
            } else {
                throw new RuntimeException("사용자를 찾을 수 없습니다.");
            }
        }
        else {
            log.error("알 수 없는 Principal 타입: " + principal.getClass().getName());
            throw new RuntimeException("알 수 없는 사용자 정보 타입입니다.");
        }

        try {
            ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
            Member member = memberRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            if (chatRoom.getParticipants().contains(member)) {
                chatRoom.getParticipants().remove(member);
                chatRoomRepository.save(chatRoom);

                // 채팅방에 남은 참가자가 없으면 채팅방 삭제
                if (chatRoom.getParticipants().isEmpty()) {
                    chatRoomRepository.delete(chatRoom);
                } else {
                    // 채팅방에 사용자가 나갔다는 메시지 추가
                    String content = member.getName() + "님이 채팅방을 나갔습니다.";
                    ChatMessage systemMessage = ChatMessage.builder()
                            .chatRoom(chatRoom)
                            .sender(null)  // 시스템 메시지
                            .content(content)
                            .isSystemMessage(true)
                            .build();
                    chatMessageRepository.save(systemMessage);

                    // WebSocket을 통해 실시간으로 메시지 전송
                    messagingTemplate.convertAndSend("/topic/chat/" + roomId, new ChatMessageDto(systemMessage));
                }
            } else {
                throw new RuntimeException("사용자가 해당 채팅방의 참가자가 아닙니다.");
            }
        } catch (Exception e) {
            log.error("채팅방 나가기 처리 중 오류 발생", e);
            throw new RuntimeException("채팅방 나가기 처리 중 오류가 발생했습니다.");
        }
    }
    /**
     * 사용자의 입력 상태를 설정합니다.
     *
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @param isTyping 입력 중 여부
     */
    public void setUserTypingStatus(Long roomId, Long userId, boolean isTyping) {
        //String status = isTyping ? "typing" : "not_typing";
        //messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing",
        //        new TypingStatusDto(userId, status));
        ChatMessageDto typingStatus = new ChatMessageDto();
        typingStatus.setRoomId(roomId);
        typingStatus.setTypingUserId(userId);
        typingStatus.setTyping(isTyping);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing", typingStatus);
    }

    /**
     * 메시지 읽음 상태를 업데이트합니다.
     *
     * @param messageId 메시지 ID
     * @param userId 사용자 ID
     */
    @Transactional
    public void updateMessageReadStatus(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다."));
        message.markAsRead(userId);
        chatMessageRepository.save(message);
        // 읽음 상태 변경을 실시간으로 전파
        //messagingTemplate.convertAndSend("/topic/chat/" + message.getChatRoom().getId() + "/read",
        //        new ReadStatusDto(messageId, userId));
        ChatMessageDto readStatus = new ChatMessageDto();
        readStatus.setId(messageId);
        readStatus.setSenderId(userId);
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChatRoom().getId() + "/read", readStatus);
    }
}
