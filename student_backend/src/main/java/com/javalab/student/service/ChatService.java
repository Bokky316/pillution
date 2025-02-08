package com.javalab.student.service;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.entity.ChatMessage;
import com.javalab.student.entity.ChatRoom;
import com.javalab.student.repository.ChatMessageRepository;
import com.javalab.student.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * [기존 기능 1] 새로운 채팅방을 생성합니다.
     *
     * @param chatRoomDto 생성할 채팅방 정보
     * @return 생성된 채팅방 정보
     */
    @Transactional
    public ChatRoomDto createChatRoom(ChatRoomDto chatRoomDto) {
        ChatRoom chatRoom = ChatRoom.fromDto(chatRoomDto);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(savedChatRoom);
    }

    /**
     * [기존 기능 2] 특정 채팅방 정보를 조회합니다.
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
     * [기존 기능 3] 모든 채팅방 목록을 조회합니다.
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
     * [기존 기능 4] 채팅방 정보를 수정합니다.
     *
     * @param roomId 채팅방 ID
     * @param chatRoomDto 수정할 채팅방 정보
     * @return 수정된 채팅방 정보
     */
    @Transactional
    public ChatRoomDto updateChatRoom(Long roomId, ChatRoomDto chatRoomDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        chatRoom.updateFromDto(chatRoomDto);
        ChatRoom updatedChatRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.fromEntity(updatedChatRoom);
    }

    /**
     * [기존 기능 5] 채팅방을 삭제합니다.
     *
     * @param roomId 채팅방 ID
     */
    @Transactional
    public void deleteChatRoom(Long roomId) {
        chatRoomRepository.deleteById(roomId);
    }

    /**
     * [기존 기능 6] 채팅 메시지를 전송합니다.
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
     * [기존 기능 7] 특정 채팅방의 모든 메시지를 조회합니다.
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
     * [기존 기능 8] 채팅 메시지를 수정합니다.
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
     * [기존 기능 9] 채팅 메시지를 삭제합니다.
     *
     * @param messageId 메시지 ID
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        chatMessageRepository.deleteById(messageId);
    }

    /**
     * [새로운 기능 1] 특정 채팅방의 읽지 않은 메시지 수를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 읽지 않은 메시지 수
     */
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(Long roomId) {
        return chatMessageRepository.countByRoomIdAndIsReadFalse(roomId);
    }

    /**
     * [새로운 기능 2] 특정 사용자의 채팅방 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 채팅방 목록
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getChatRoomsByUserId(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByParticipantsId(userId);
        return chatRooms.stream()
                .map(ChatRoomDto::fromEntity)
                .collect(Collectors.toList());
    }
}
