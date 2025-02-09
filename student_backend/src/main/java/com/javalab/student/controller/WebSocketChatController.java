package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.TypingStatus;
import com.javalab.student.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto, SimpMessageHeaderAccessor headerAccessor) {
        // 메시지 저장 및 처리
        ChatMessageDto savedMessage = chatService.sendMessage(chatMessageDto);

        // 메시지를 해당 채팅방의 구독자들에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessageDto.getRoomId(), savedMessage);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingStatus typingStatus) {
        // 타이핑 상태를 해당 채팅방의 구독자들에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + typingStatus.getRoomId() + "/typing", typingStatus);
    }
}