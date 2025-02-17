package com.javalab.student.service.webSoket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.constant.Role;
import com.javalab.student.dto.MessageRequestDto;
import com.javalab.student.dto.MessageResponseDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.message.Message;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private static final String CHANNEL_NAME = "chat_channel";
    private final MessageRepository messageRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;
    private RedisTemplate<String, Object> redisTemplate;


    /**
     * ✅ 사용자가 보낸 메시지 조회
     */
    public List<Message> getSentMessages(Long userId) {
        Member sender = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return messageRepository.findBySenderOrderByRegTimeDesc(sender);
    }

    /**
     * ✅ 사용자가 받은 메시지 조회
     */
    public List<Message> getReceivedMessages(Long userId) {
        Member receiver = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return messageRepository.findByReceiverOrderByRegTimeDesc(receiver);
    }

    /**
     * ✅ 사용자의 읽지 않은 메시지 개수 조회
     */
    public int getUnreadMessageCount(Long userId) {
        Member receiver = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return messageRepository.countUnreadMessages(receiver);
    }

    /**
     * ✅ 메시지를 읽음 처리
     */
    @Transactional
    public void markMessageAsRead(Long messageId) {
        messageRepository.markMessageAsRead(messageId);
    }

    /**
     * ✅ 메시지를 DB에 저장 (단순 저장 역할)
     */
    @Transactional
    public Message saveMessage(MessageRequestDto requestDto) {
        Member sender = memberRepository.findById(requestDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다."));
        Member receiver = memberRepository.findById(requestDto.getReceiverId())
                .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다."));
        return messageRepository.save(
                Message.builder()
                        .sender(sender)
                        .receiver(receiver)
                        .content(requestDto.getContent())
                        .read(false)
                        .build()
        );
    }

    /**
     * ✅ 사용자가 받은 모든 메시지 조회 (MessageResponseDto 반환)
     */
    public List<MessageResponseDto> getMessagesByUserId(Long userId) {
        Member recipient = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("수신자 정보를 찾을 수 없습니다."));
        List<Message> messages = messageRepository.findByReceiverOrderByRegTimeDesc(recipient);
        return messages.stream()
                .map(MessageResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 관리자 메시지를 DB에 저장 (단순 저장 역할)
     * @param requestDto 관리자 메시지 요청 DTO
     */
    public void publishAdminMessage(MessageRequestDto requestDto) {
        log.info("📨 관리자 Redis 메시지 발행 요청 - senderId={}, receiverType={}, content={}",
                requestDto.getSenderId(), requestDto.getReceiverType(), requestDto.getContent());

        try {
            String jsonMessage = objectMapper.writeValueAsString(requestDto);
            redisTemplate.convertAndSend(CHANNEL_NAME, jsonMessage);
            log.info("📩 관리자 Redis 메시지 발행 완료! senderId={}, receiverType={}, content={}",
                    requestDto.getSenderId(), requestDto.getReceiverType(), requestDto.getContent());
        } catch (Exception e) {
            log.error("❌ 관리자 메시지 발행 중 오류 발생", e);
            throw new RuntimeException("관리자 메시지 발행 실패", e);
        }
    }

    @Transactional
    public void saveAdminMessage(MessageRequestDto requestDto) {
        Member sender = memberRepository.findById(requestDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다."));

        List<Member> receiverList = new ArrayList<>();

        switch (requestDto.getReceiverType()) {
            case "ALL":
                receiverList = memberRepository.findAll();
                break;
            case "ROLE":
                receiverList = memberRepository.findByRole(Role.valueOf(requestDto.getReceiverId().toString()));
                break;
            case "USER":
                Member receiver = memberRepository.findById(requestDto.getReceiverId())
                        .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다."));
                receiverList.add(receiver);
                break;
            default:
                throw new IllegalArgumentException("잘못된 수신자 유형입니다.");
        }

        for (Member receiver : receiverList) {
            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .content(requestDto.getContent())
                    .read(false)
                    .build();
            messageRepository.save(message);
        }
    }


}
