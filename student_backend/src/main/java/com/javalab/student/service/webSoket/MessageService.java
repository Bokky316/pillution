package com.javalab.student.service.webSoket;

import com.javalab.student.constant.Role;
import com.javalab.student.dto.message.MessageRequestDto;
import com.javalab.student.dto.message.MessageResponseDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.message.Message;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * MessageService: 메시지 관련 비즈니스 로직 처리
 * - 메시지 조회, 저장, 읽음 처리 등
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MemberRepository memberRepository;

    /**
     * ✅ 사용자가 보낸 메시지 조회
     * @param userId 사용자 ID
     * @return 사용자가 보낸 메시지 목록
     */
    public List<MessageResponseDto> getSentMessages(Long userId) {
        Member sender = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        List<Message> messages = messageRepository.findBySenderOrderByRegTimeDesc(sender);
        return messages.stream()
                .map(MessageResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 사용자가 받은 메시지 조회
     * @param userId 사용자 ID
     * @return 사용자가 받은 메시지 목록
     */
    public List<Message> getReceivedMessages(Long userId) {
        Member receiver = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return messageRepository.findByReceiverOrderByRegTimeDesc(receiver);
    }

    /**
     * ✅ 사용자의 읽지 않은 메시지 개수 조회
     * @param userId 사용자 ID
     * @return 읽지 않은 메시지 개수
     */
    public int getUnreadMessageCount(Long userId) {
        Member receiver = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return messageRepository.countUnreadMessages(receiver);
    }

    /**
     * ✅ 메시지를 읽음 처리
     * @param messageId 메시지 ID
     */
    @Transactional
    public void markMessageAsRead(Long messageId) {
        messageRepository.markMessageAsRead(messageId);
    }

    /**
     * ✅ 메시지를 DB에 저장 (단순 저장 역할)
     * [수정]: ADMIN, CS_AGENT, USER Role만 메시지 전송 가능하도록 수정
     * @param requestDto 메시지 요청 DTO (발신자 ID, 수신자 ID, 내용)
     * @return 저장된 메시지 객체
     */
    @Transactional
    public Message saveMessage(MessageRequestDto requestDto) {
        Member sender = memberRepository.findById(requestDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다."));

        // [수정] 발신자가 ADMIN, CS_AGENT, USER Role이 아닌 경우 예외 발생
        if (sender.getRole() != Role.USER && sender.getRole() != Role.CS_AGENT && sender.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("ADMIN, CS_AGENT, USER Role만 메시지를 전송할 수 있습니다.");
        }

        Long receiverId;
        try {
            receiverId = Long.parseLong(requestDto.getReceiverId());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("잘못된 수신자 ID 형식입니다: " + requestDto.getReceiverId());
        }

        Member receiver = memberRepository.findById(receiverId)
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
     * @param userId 사용자 ID
     * @return MessageResponseDto 목록
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
     * [수정]: ADMIN Role만 메시지 전송 가능하도록 수정
     * @param requestDto 관리자 메시지 요청 DTO
     */
    @Transactional
    public void saveAdminMessage(MessageRequestDto requestDto) {
        Member sender = memberRepository.findById(requestDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다."));

        if (sender.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("ADMIN Role만 관리자 메시지를 전송할 수 있습니다.");
        }

        List<Member> receiverList = new ArrayList<>();

        switch (requestDto.getReceiverType()) {
            case "ALL":
                receiverList = memberRepository.findAll();
                break;
            case "ROLE":
                try {
                    Role role = Role.valueOf(requestDto.getReceiverId());
                    receiverList = memberRepository.findByRole(role);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("잘못된 역할입니다: " + requestDto.getReceiverId());
                }
                break;
            case "USER":
                try {
                    Long userId = Long.parseLong(requestDto.getReceiverId());
                    Member receiver = memberRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다."));
                    receiverList.add(receiver);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("잘못된 사용자 ID입니다: " + requestDto.getReceiverId());
                }
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

    public List<Member> searchUsers(String query) {
        return memberRepository.searchByNameEmailOrId(query);
    }
}
