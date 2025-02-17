package com.javalab.student.service.webSoket;

import com.javalab.student.dto.MessageRequestDto;
import com.javalab.student.dto.MessageResponseDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.message.Message;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MemberRepository memberRepository;

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

    public List<MessageResponseDto> getMessagesByUserId(Long userId) {
        Member recipient = memberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("수신자 정보를 찾을 수 없습니다."));
        List<Message> messages = messageRepository.findByReceiverOrderByRegTimeDesc(recipient);

        return messages.stream()
                .map(MessageResponseDto::new)  // ✅ MessageResponseDto 생성자 사용
                .collect(Collectors.toList());
    }




}
