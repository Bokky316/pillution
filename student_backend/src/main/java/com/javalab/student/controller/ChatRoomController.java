package com.javalab.student.controller;

import com.javalab.student.dto.ChatRoomResponseDto;
import com.javalab.student.dto.ConsultationRequestDto;
import com.javalab.student.entity.ChatRoom;
import com.javalab.student.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 상담 채팅방 컨트롤러
 * - 상담 채팅방 생성, 목록 조회, 상세 조회, 삭제 API를 제공합니다.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    /**
     * 상담 채팅방 생성 API
     *
     * @param request 상담 요청 DTO (ConsultationRequestDto)
     * @return 생성된 채팅방 정보 (ChatRoomResponseDto)
     */
    @PostMapping("/rooms/create")
    public ResponseEntity<ChatRoomResponseDto> createChatRoom(@RequestBody ConsultationRequestDto request) {
        ChatRoom chatRoom = chatRoomService.createChatRoom(request);
        ChatRoomResponseDto response = new ChatRoomResponseDto(
                chatRoom.getId(),
                chatRoom.getName(),
                chatRoom.getRegTime(),
                chatRoom.getOwner().getId(),
                chatRoom.getOwner().getName(),
                "CREATED",
                request.getTopic()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 회원이 참여한 상담 채팅방 목록 조회 API
     *
     * @param memberId 회원 ID
     * @return 해당 회원이 참여한 채팅방 목록
     */
    @GetMapping("/rooms/{memberId}")
    public ResponseEntity<List<ChatRoomResponseDto>> getUserChatRooms(@PathVariable("memberId") Long memberId) {
        List<ChatRoomResponseDto> chatRooms = chatRoomService.getChatRoomsByMemberIdWithDetails(memberId);
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * 특정 상담 채팅방 상세 조회 API
     *
     * @param roomId 채팅방 ID
     * @return 채팅방 상세 정보
     */
    @GetMapping("/rooms/details/{roomId}")
    public ResponseEntity<ChatRoomResponseDto> getChatRoomDetails(@PathVariable("roomId") Long roomId) {
        ChatRoomResponseDto chatRoomDetails = chatRoomService.getChatRoomDetails(roomId);
        return ResponseEntity.ok(chatRoomDetails);
    }

    /**
     * 특정 상담 채팅방 삭제 API
     *
     * @param roomId 채팅방 ID
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<String> deleteChatRoom(@PathVariable("roomId") Long roomId) {
        chatRoomService.deleteChatRoom(roomId);
        return ResponseEntity.ok("상담 채팅방이 성공적으로 삭제되었습니다.");
    }

    /**
     * 채팅방 나가기 API
     *
     * @param roomId 나가려는 채팅방 ID
     * @param principal 현재 로그인한 사용자 정보
     * @return 채팅방 나가기 결과 메시지
     */
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<String> leaveChatRoom(@PathVariable Long roomId, Principal principal) {
        Long memberId = Long.valueOf(principal.getName());
        chatRoomService.leaveChatRoom(memberId, roomId);
        return ResponseEntity.ok("채팅방을 나갔습니다.");
    }

}
