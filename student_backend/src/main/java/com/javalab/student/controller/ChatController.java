package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.dto.MemberDto;
import com.javalab.student.entity.ChatRoom;
import com.javalab.student.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 채팅 관련 요청을 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * [기존 기능 1] 채팅방 생성
     *
     * @param chatRoomDto 채팅방 정보
     * @return 생성된 채팅방 정보
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody ChatRoomDto chatRoomDto) {
        // chatRoomDto의 user1Id와 user2Id가 null인지 확인
        if (chatRoomDto.getUser1Id() == null || chatRoomDto.getUser2Id() == null) {
            throw new IllegalArgumentException("user1Id와 user2Id는 null일 수 없습니다.");
        }
        ChatRoomDto createdRoom = chatService.createChatRoom(chatRoomDto);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    /**
     * [기존 기능 2] 특정 채팅방 정보 조회
     *
     * @param roomId 채팅방 ID
     * @return 채팅방 정보
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDto> getChatRoom(@PathVariable Long roomId) {
        ChatRoomDto chatRoom = chatService.getChatRoom(roomId);
        return ResponseEntity.ok(chatRoom);
    }

    /**
     * [기존 기능 3] 모든 채팅방 목록 조회
     *
     * @return 채팅방 목록
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDto>> getAllChatRooms() {
        List<ChatRoomDto> chatRooms = chatService.getAllChatRooms();
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * [기존 기능 4] 채팅방 정보 수정
     *
     * @param roomId 채팅방 ID
     * @param chatRoomDto 수정할 채팅방 정보
     * @return 수정된 채팅방 정보
     */
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDto> updateChatRoom(@PathVariable Long roomId, @RequestBody ChatRoomDto chatRoomDto) {
        ChatRoomDto updatedRoom = chatService.updateChatRoom(roomId, chatRoomDto);
        return ResponseEntity.ok(updatedRoom);
    }

    /**
     * [기존 기능 5] 채팅방 삭제
     *
     * @param roomId 채팅방 ID
     * @return 삭제 성공 여부
     */
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Long roomId) {
        chatService.deleteChatRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    /**
     * [기존 기능 6] 채팅 메시지 전송
     *
     * @param chatMessageDto 채팅 메시지 정보
     * @return 전송된 채팅 메시지 정보
     */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatMessageDto chatMessageDto) {
        ChatMessageDto sentMessage = chatService.sendMessage(chatMessageDto);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }

    /**
     * [기존 기능 7] 특정 채팅방의 모든 메시지 조회
     *
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable("roomId") Long roomId) {
        List<ChatMessageDto> messages = chatService.getChatMessagesByRoomId(roomId);
        return ResponseEntity.ok(messages);
    }


    /**
     * [기존 기능 8] 채팅 메시지 수정
     *
     * @param messageId 메시지 ID
     * @param chatMessageDto 수정할 메시지 정보
     * @return 수정된 메시지 정보
     */
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageDto> updateMessage(@PathVariable Long messageId, @RequestBody ChatMessageDto chatMessageDto) {
        ChatMessageDto updatedMessage = chatService.updateMessage(messageId, chatMessageDto);
        return ResponseEntity.ok(updatedMessage);
    }

    /**
     * [기존 기능 9] 채팅 메시지 삭제
     *
     * @param messageId 메시지 ID
     * @return 삭제 성공 여부
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

    /**
     * [새로운 기능 1] 특정 채팅방의 읽지 않은 메시지 수를 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 읽지 않은 메시지 수
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@RequestParam("roomId") Long roomId) {
        int unreadCount = chatService.getUnreadMessageCount(roomId);
        return ResponseEntity.ok(unreadCount);
    }


    /**
     * [새로운 기능 2] 특정 사용자의 채팅방 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 채팅방 목록
     */
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@PathVariable Long userId) {
        List<ChatRoomDto> chatRooms = chatService.getChatRoomsByUserId(userId);
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * [새로운 기능 3] 사용자 이름으로 검색
     *
     * @param name 검색할 사용자 이름
     * @return 검색된 사용자 목록
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<MemberDto>> searchUsers(@RequestParam String name) {
        List<MemberDto> members = chatService.searchMembersByName(name);
        return ResponseEntity.ok(members);
    }

    /**
     * [새로운 기능 4] 새로운 1:1 채팅방 생성
     *
     * @param user1Id 첫 번째 사용자 ID
     * @param user2Id 두 번째 사용자 ID
     * @return 생성된 채팅방 정보
     */
    @PostMapping("/rooms/create")
    public ResponseEntity<ChatRoomDto> createOneToOneChatRoom(@RequestParam Long user1Id, @RequestParam Long user2Id) {
        ChatRoomDto chatRoomDto = new ChatRoomDto();
        chatRoomDto.setUser1Id(user1Id);
        chatRoomDto.setUser2Id(user2Id);
        chatRoomDto.setName(user1Id + "," + user2Id);
        ChatRoomDto createdRoom = chatService.createChatRoom(chatRoomDto);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }
}
