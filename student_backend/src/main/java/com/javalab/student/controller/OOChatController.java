/*
package com.javalab.student.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

*/
/**
 * WebSocket 기반 실시간 메시지 전송
 * - WebSocket 기반의 실시간 채팅을 처리하는 역할
 *//*

@Controller
public class OOChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    */
/**
     *
     * REST API → Redis Pub/Sub → WebSocket 전송 구조
     * - WebSocket을 통해 받은 메시지를 /topic/chat을 구독하는 모든 클라이언트에게 전송하는 역할
     *//*

    @MessageMapping("/chat")
    @SendTo("/topic/chat")  // 이 메시지를 "/topic/chat"으로 구독 중인 클라이언트들에게 보냄
    public String sendMessage(String message) {
        // 받은 메시지를 처리하고, "/topic/chat"으로 전송할 메시지 반환
        System.out.println("받은 메시지: " + message);
        return message;   // 반환된 메시지는 "/topic/chat" 구독자에게 전송됨
    }

    */
/**
     * 특정 사용자의 메시지를 전송할 때 사용하는 메서드
     * 예를 들어, 개인 메시지 전송을 위해 사용
     *//*

    @MessageMapping("/private")
    public void sendPrivateMessage(String message, String userId) {
        // 특정 사용자에게 개인 메시지를 전송
        messagingTemplate.convertAndSendToUser(userId, "/queue/private", message);
    }
}
*/
