package com.javalab.student.repository;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.constant.Role;
import com.javalab.student.dto.ConsultationRequestDto;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.entity.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Slf4j
class ChatRoomRepositoryTest {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ChatParticipantRepository chatParticipantRepository;

    @Autowired
    private ConsultationRequestRepository consultationRequestRepository;

    /**
     * ✅ 테스트용 Member 생성 메서드 (권한 포함)
     */
    private Member createTestMember(String name, String email, Role role) {
        MemberFormDto memberFormDto = MemberFormDto.builder()
                .name(name)
                .email(email)
                .password("1234")
                .address("서울시 강남구")
                .phone("010-1234-5678")
                .role(role) // Role enum 값 전달
                .build();

        return memberRepository.save(Member.createMember(memberFormDto, passwordEncoder));
    }

    /**
     * ✅ 채팅방 생성 및 저장 테스트
     */
    @Test
    @DisplayName("채팅방 생성 및 저장 테스트")
    void createAndSaveChatRoomTest() {
        // Given: 회원 2명 생성 (USER & CS_AGENT)
        Member user = createTestMember("홍길동", "hong@test.com", Role.USER);
        Member csAgent = createTestMember("김길동", "kim@test.com", Role.CS_AGENT);

        // 채팅방 생성 및 저장
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(user.getName() + ", " + csAgent.getName() + "의 채팅방");
        chatRoom.setOwner(user);

        ChatParticipant userParticipant = new ChatParticipant(chatRoom, user);
        ChatParticipant agentParticipant = new ChatParticipant(chatRoom, csAgent);

        chatParticipantRepository.save(userParticipant);
        chatParticipantRepository.save(agentParticipant);

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        // Then: 저장된 채팅방 검증
        ChatRoom foundChatRoom = chatRoomRepository.findById(savedChatRoom.getId())
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        assertNotNull(foundChatRoom);
        assertEquals(2, foundChatRoom.getParticipants().size());
    }

    /**
     * ✅ 사용자별 채팅방 조회 테스트
     */
    @Test
    @DisplayName("사용자별 채팅방 조회 테스트")
    void findChatRoomsByMemberTest() {
        // Given: 회원 2명 생성 및 채팅방 저장
        Member user = createTestMember("홍길동", "hong@test.com", Role.USER);
        Member csAgent = createTestMember("김길동", "kim@test.com", Role.CS_AGENT);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(user.getName() + ", " + csAgent.getName() + "의 채팅방");
        chatRoom.setOwner(user);

        ChatParticipant userParticipant = new ChatParticipant(chatRoom, user);
        ChatParticipant agentParticipant = new ChatParticipant(chatRoom, csAgent);

        chatParticipantRepository.save(userParticipant);
        chatParticipantRepository.save(agentParticipant);

        chatRoomRepository.save(chatRoom);

        // When: 사용자별 채팅방 조회
        List<ChatRoom> userChatRooms = chatRoomRepository.findByMemberId(user.getId());
        List<ChatRoom> agentChatRooms = chatRoomRepository.findByMemberId(csAgent.getId());

        // Then: 검증
        assertFalse(userChatRooms.isEmpty());
        assertFalse(agentChatRooms.isEmpty());
    }

    /**
     * ✅ 상담 요청 생성 및 저장 테스트
     */
    @Test
    @DisplayName("상담 요청 생성 및 저장 테스트")
    void createConsultationRequestTest() {
        // Given: 고객과 상담사 생성 및 상담 요청 저장
        Member customer = createTestMember("홍길동", "hong@test.com", Role.USER);
        Member csAgent = createTestMember("김길동", "kim@test.com", Role.CS_AGENT);

        ConsultationRequest consultationRequest = ConsultationRequest.builder()
                .customer(customer)
                .csAgent(csAgent)
                .preMessage("상담 요청 메시지입니다.")
                .status(ConsultationRequestStatus.PENDING)
                .build();

        consultationRequestRepository.save(consultationRequest);

        // Then: 상담 요청 검증
        List<ConsultationRequest> requests = consultationRequestRepository.findByCustomerId(customer.getId());
        assertEquals(1, requests.size());
    }

    /**
     * ✅ 읽지 않은 메시지 개수 조회 테스트
     */
    @Test
    @DisplayName("읽지 않은 메시지 개수 조회 테스트")
    void countUnreadMessagesTest() {
        // Given: 회원 2명 생성 및 메시지 저장
        Member sender = createTestMember("홍길동", "hong@test.com", Role.USER);
        Member receiver = createTestMember("김길동", "kim@test.com", Role.CS_AGENT);

        ChatMessage message1 = new ChatMessage();
        message1.setContent("안녕하세요!");
        message1.setSender(sender);
        message1.setSentAt(LocalDateTime.now());

        // 메시지는 읽음 상태가 아닌 것으로 설정 (isRead=false)
        message1.setRead(false);
        chatMessageRepository.save(message1);
    }

}
