package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.entity.ConsultationResult;
import com.javalab.student.entity.ConsultationType;
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
     * 새로운 채팅방을 생성합니다.
     *
     * @param chatRoomDto 채팅방 생성 정보
     * @return 생성된 채팅방 정보
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody ChatRoomDto chatRoomDto) {
        try {
            ChatRoomDto createdRoom = chatService.createChatRoom(chatRoomDto.getUserId(), chatRoomDto.getConsultationType(), chatRoomDto.getUserIssue());
            return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 상담사를 채팅방에 배정합니다.
     *
     * @param roomId 채팅방 ID
     * @param consultantId 상담사 ID
     * @return 업데이트된 채팅방 정보
     */
    @PostMapping("/rooms/{roomId}/assign")
    public ResponseEntity<ChatRoomDto> assignConsultant(@PathVariable Long roomId,
                                                        @RequestParam Long consultantId) {
        ChatRoomDto updatedRoom = chatService.assignConsultant(roomId, consultantId);
        return ResponseEntity.ok(updatedRoom);
    }

    /**
     * 상담을 종료합니다.
     *
     * @param roomId 채팅방 ID
     * @param result 상담 결과
     * @param consultantMemo 상담사 메모
     * @return 종료 성공 여부
     */
    @PostMapping("/rooms/{roomId}/end")
    public ResponseEntity<Void> endConsultation(@PathVariable Long roomId,
                                                @RequestParam ConsultationResult result,
                                                @RequestParam String consultantMemo) {
        chatService.endConsultation(roomId, result, consultantMemo);
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅 메시지를 전송합니다.
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
     * 특정 채팅방의 모든 메시지를 조회합니다.
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
     * 특정 사용자의 채팅방 목록을 조회합니다.
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
     * 상담 요청 목록을 조회합니다.
     *
     * @return 상담 요청 목록
     */
    @GetMapping("/requests")
    public ResponseEntity<List<ChatRoomDto>> getConsultationRequests() {
        List<ChatRoomDto> requests = chatService.getConsultationRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * 상담 요청을 수락합니다.
     *
     * @param requestId 요청 ID
     * @return 수락된 채팅방 정보
     */
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<ChatRoomDto> acceptConsultationRequest(@PathVariable Long requestId) {
        ChatRoomDto acceptedRoom = chatService.acceptConsultationRequest(requestId);
        return ResponseEntity.ok(acceptedRoom);
    }

    /**
     * 모든 채팅방 목록을 조회합니다.
     *
     * @return 채팅방 목록
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDto>> getAllChatRooms() {
        List<ChatRoomDto> chatRooms = chatService.getAllChatRooms();
        return ResponseEntity.ok(chatRooms);
    }

}
