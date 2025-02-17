package com.javalab.student.service.webSoket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.MessageRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis Publisher 역할을 하는 서비스 클래스
 * - 사용자로부터 받은 메세지를 WebSocket으로 전송하기 위해 Redis Pub 클래스
 * - CHANNEL_NAME : Redis Pub/Sub 에서 발행하는 채널 이름
 */
@Slf4j
@Service
public class MessagePublisherService {

    private final RedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String CHANNEL_NAME = "chat_channel";

    /**
     * ✅ 생성자 주입 시 @Qualifier 적용 (redisStringTemplate 사용)
     * RedisTemplate이라는 클래스가 두개의 빈으로 만들어지기 때문에 특정 하나의 빈을 선택하기 위해 @Qualifier 사용
     */
    public MessagePublisherService(
            @Qualifier("redisStringTemplate") RedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * ✅ 메시지를 Redis Pub/Sub으로 발행하는 메서드 (DB 저장 X)
     */
    public void publishMessage(MessageRequestDto requestDto) {
        log.info("📨 Redis 메시지 발행 요청 - senderId={}, receiverId={}, content={}",
                requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());
        if (requestDto.getSenderId() == null || requestDto.getReceiverId() == null) {
            log.error("❌ 메시지 발행 실패: 발신자 또는 수신자 ID가 누락되었습니다.");
            throw new IllegalArgumentException("발신자 또는 수신자 ID가 누락되었습니다.");
        }

        try {
            // ✅ JSON 문자열로 변환 후 Redis Pub/Sub으로 발행
            String jsonMessage = objectMapper.writeValueAsString(requestDto);
            // - Redis Pub/Sub으로 메세지 발행 즉, 채널에 메시지 전송
            redisTemplate.convertAndSend(CHANNEL_NAME, jsonMessage);
            log.info("📩 Redis 메시지 발행 완료! senderId={}, receiverId={}, content={}",
                    requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());
        } catch (Exception e) {
            log.error("❌ 메시지 발행 중 오류 발생", e);
            throw new RuntimeException("메시지 발행 실패", e);
        }
    }

    /**
     * ✅ 관리자 메시지를 Redis Pub/Sub으로 발행하는 메서드
     * @param requestDto 관리자 메시지 요청 DTO
     */
    public void publishAdminMessage(MessageRequestDto requestDto) {
        log.info("📨 관리자 Redis 메시지 발행 요청 - senderId={}, receiverId={}, content={}",
                requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());

        try {
            // ✅ JSON 문자열로 변환 후 Redis Pub/Sub으로 발행
            String jsonMessage = objectMapper.writeValueAsString(requestDto);
            // - Redis Pub/Sub으로 메세지 발행 즉, 채널에 메시지 전송
            redisTemplate.convertAndSend(CHANNEL_NAME, jsonMessage);
            log.info("📩 관리자 Redis 메시지 발행 완료! senderId={}, receiverId={}, content={}",
                    requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());
        } catch (Exception e) {
            log.error("❌ 관리자 메시지 발행 중 오류 발생", e);
            throw new RuntimeException("관리자 메시지 발행 실패", e);
        }
    }
}
