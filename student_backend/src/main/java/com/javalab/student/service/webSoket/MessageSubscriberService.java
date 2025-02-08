package com.javalab.student.service.webSoket;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.MessageRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis 메시지 수신
 * - Redis에서 메시지를 수신하는 역할
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageSubscriberService implements org.springframework.data.redis.connection.MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     *  Redis 메시지 수신
     *  - Redis에서 메시지를 수신하는 역할.
     *  - 이 역할을 수행한 후, 구독 중인 WebSocket 클라이언트에게 메시지를 전송하면 된다.
     *    메시지를 수신하고 WebSocket을 통해 클라이언트에게 보냅니다.
     */
    @Override
    public void onMessage(Message redisMessage, byte[] pattern) { // ✅ RedisMessage는 변수로 사용
        try {
            // 1. Redis 메시지 수신
            String jsonMessage = new String(redisMessage.getBody()); // Redis 메시지를 JSON 문자열로 변환
            log.info("🔹 Redis Pub/Sub 수신 경로: {}, 메시지 내용: {}", new String(pattern), jsonMessage);

            // 2. JSON 문자열을 MessageRequestDto 객체로 변환
            MessageRequestDto messageDto = objectMapper.readValue(jsonMessage, MessageRequestDto.class);

            log.info("✅ WebSocket으로 메시지 전송: /topic/chat/{}", messageDto.getReceiverId());

            // 3. Redis에서 보낸 메시지를 전달받고 이를 WebSocket을 통해 클라이언트에게 전달
            // - "/topic/chat/{receiverId}"로 구독 중인 클라이언트에게 메시지 전송
            //    여기서 클라이언트는 ChatController의 @MessageMapping("/chat") 메서드를 통해 메시지를 받을 수 있다.
            messagingTemplate.convertAndSend("/topic/chat/" + messageDto.getReceiverId(), messageDto.getContent());

        } catch (Exception e) {
            log.error("❌ 메시지 처리 중 오류 발생", e);
        }
    }
}
