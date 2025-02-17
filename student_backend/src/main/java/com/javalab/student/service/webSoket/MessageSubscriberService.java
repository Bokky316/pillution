package com.javalab.student.service.webSoket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.message.MessageRequestDto;
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
     * Redis 메시지 수신
     * - Redis에서 메시지를 수신하는 역할.
     * - 이 역할을 수행한 후, 구독 중인 WebSocket 클라이언트에게 메시지를 전송하면 된다.
     * @param redisMessage Redis 메시지
     * @param pattern 패턴
     */
    @Override
    public void onMessage(Message redisMessage, byte[] pattern) {
        try {
            String jsonMessage = new String(redisMessage.getBody());
            log.info("🔹 Redis Pub/Sub 수신 경로: {}, 메시지 내용: {}", new String(pattern), jsonMessage);

            MessageRequestDto messageDto = objectMapper.readValue(jsonMessage, MessageRequestDto.class);

            String content = messageDto.getContent();

            switch (messageDto.getReceiverType()) {
                case "ALL":
                    log.info("✅ 전체 사용자에게 메시지 전송");
                    messagingTemplate.convertAndSend("/topic/chat/all", content);
                    break;
                case "ROLE":
                    log.info("✅ 특정 역할의 사용자에게 메시지 전송");
                    messagingTemplate.convertAndSend("/topic/chat/role/" + messageDto.getReceiverId(), content);
                    break;
                case "USER":
                    log.info("✅ 특정 사용자 {}에게 메시지 전송", messageDto.getReceiverId());
                    messagingTemplate.convertAndSend("/topic/chat/" + messageDto.getReceiverId(), content);
                    break;
                default:
                    log.error("❌ 잘못된 수신자 유형: {}", messageDto.getReceiverType());
            }

        } catch (Exception e) {
            log.error("❌ 메시지 처리 중 오류 발생", e);
        }
    }
}
