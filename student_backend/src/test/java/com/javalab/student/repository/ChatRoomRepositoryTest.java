//package com.javalab.student.repository;
//
//import com.javalab.student.constant.ConsultationRequestStatus;
//import com.javalab.student.constant.ConsultationTopic;
//import com.javalab.student.constant.Role;
//import com.javalab.student.dto.ChatMessageDto;
//import com.javalab.student.dto.ConsultationRequestDto;
//import com.javalab.student.dto.MemberFormDto;
//import com.javalab.student.entity.*;
//import com.javalab.student.service.ChatMessageService;
//import com.javalab.student.service.ConsultationRequestService;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.annotation.Commit;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@SpringBootTest
//@Transactional
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//@Slf4j
//class ChatRoomRepositoryTest {
//
//    @Autowired
//    private ChatRoomRepository chatRoomRepository;
//
//    @Autowired
//    private ChatMessageRepository chatMessageRepository;
//
//    @Autowired
//    private MemberRepository memberRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private ChatParticipantRepository chatParticipantRepository;
//
//    @Autowired
//    private ConsultationRequestRepository consultationRequestRepository;
//
//    @Autowired
//    private ChatMessageService chatMessageService;
//
//    @Autowired
//    private ConsultationRequestService consultationRequestService;
//
//    /**
//     * 테스트용 Member 생성 메서드 (Role 적용)
//     */
//    private Member createTestMember(String name, String email, Role role) {
//        MemberFormDto memberFormDto = MemberFormDto.builder()
//                .name(name)
//                .email(email)
//                .password("1234")
//                .address("서울시 강남구")
//                .phone("010-1234-5678")
//                .build();
//
//        Member member = Member.createMember(memberFormDto, passwordEncoder);
//        member.setRole(role);
//        return memberRepository.save(member);
//    }
//
//    /**
//     * 상담 채팅방 생성 및 저장 테스트 (상담 시나리오)
//     */
//    @Test
//    @DisplayName("상담 채팅방 생성 및 저장 테스트")
//    @Commit
//    void createAndSaveChatRoomTest() {
//        // Given
//        Member customer = createTestMember("고객1", "customer1@test.com", Role.USER);
//        Member csAgent = createTestMember("상담사1", "csagent1@test.com", Role.CS_AGENT);
//
//        // 상담 요청 생성
//        ConsultationRequestDto requestDto = ConsultationRequestDto.builder()
//                .customerId(customer.getId())
//                .csAgentId(csAgent.getId())
//                .topic(ConsultationTopic.ORDER_ISSUE) // 수정된 부분
//                .preMessage("주문 관련 문의입니다.")
//                .build();
//        ConsultationRequestDto savedRequest = consultationRequestService.createConsultationRequest(customer, requestDto);
//
//        // 채팅방 생성
//        ChatRoom chatRoom = new ChatRoom(customer.getName() + " - " + csAgent.getName() + " 상담방", customer);
//        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
//
//        // 참여자 등록
//        ChatParticipant customerParticipant = new ChatParticipant(savedChatRoom, customer);
//        ChatParticipant csAgentParticipant = new ChatParticipant(savedChatRoom, csAgent);
//        chatParticipantRepository.save(customerParticipant);
//        chatParticipantRepository.save(csAgentParticipant);
//
//        // 첫 메시지 전송
//        ChatMessageDto messageDto = ChatMessageDto.builder()
//                .chatRoomId(savedChatRoom.getId())
//                .senderId(customer.getId())
//                .content("안녕하세요! 상담 요청합니다.")
//                .isSystemMessage(false)
//                .build();
//        chatMessageService.saveAndSendMessage(messageDto);
//
//        // When
//        ChatRoom foundChatRoom = chatRoomRepository.findById(savedChatRoom.getId())
//                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
//
//        // Then
//        assertNotNull(foundChatRoom);
//        assertEquals(2, chatParticipantRepository.findByChatRoom(foundChatRoom).size());
//        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderBySentAtAsc(foundChatRoom.getId());
//        assertEquals(1, messages.size());
//        assertEquals("안녕하세요! 상담 요청합니다.", messages.get(0).getContent());
//        assertEquals(customer.getId(), messages.get(0).getSender().getId());
//    }
//
//    /**
//     * 사용자별 채팅방 조회 테스트
//     */
//    @Test
//    @DisplayName("사용자별 채팅방 조회 테스트")
//    @Commit
//    void findChatRoomsByMemberTest() {
//        // Given
//        Member customer = createTestMember("고객1", "customer1@test.com", Role.USER);
//        Member csAgent = createTestMember("상담사1", "csagent1@test.com", Role.CS_AGENT);
//
//        // 채팅방 생성
//        ChatRoom chatRoom = new ChatRoom(customer.getName() + " - " + csAgent.getName() + " 상담방", customer);
//        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
//
//        // 참여자 등록
//        ChatParticipant customerParticipant = new ChatParticipant(savedChatRoom, customer);
//        ChatParticipant csAgentParticipant = new ChatParticipant(savedChatRoom, csAgent);
//        chatParticipantRepository.save(customerParticipant);
//        chatParticipantRepository.save(csAgentParticipant);
//
//        // When
//        List<ChatRoom> customerChatRooms = chatRoomRepository.findByMemberId(customer.getId());
//        List<ChatRoom> csAgentChatRooms = chatRoomRepository.findByMemberId(csAgent.getId());
//
//        // Then
//        assertFalse(customerChatRooms.isEmpty());
//        assertFalse(csAgentChatRooms.isEmpty());
//        assertEquals(1, customerChatRooms.size());
//        assertEquals(1, csAgentChatRooms.size());
//    }
//
//    /**
//     * 채팅방 개설 후 상담 요청을 생성하는 테스트
//     */
//    @Test
//    @DisplayName("채팅방 개설 후 상담 요청 생성 테스트")
//    @Commit
//    void createChatRoomAndConsultationRequestTest() {
//        // Given
//        Member customer = createTestMember("고객1", "customer1@test.com", Role.USER);
//        Member csAgent = createTestMember("상담사1", "csagent1@test.com", Role.CS_AGENT);
//
//        // 상담 요청 DTO 생성
//        ConsultationRequestDto requestDto = ConsultationRequestDto.builder()
//                .customerId(customer.getId())
//                .csAgentId(csAgent.getId())
//                .topic(ConsultationTopic.ORDER_ISSUE) // 수정된 부분
//                .preMessage("주문 관련 상담 요청합니다.")
//                .build();
//
//        // 상담 요청 생성 및 저장
//        ConsultationRequestDto savedRequest = consultationRequestService.createConsultationRequest(customer, requestDto);
//
//        // When
//        ConsultationRequest foundRequest = consultationRequestRepository.findById(savedRequest.getId())
//                .orElseThrow(() -> new RuntimeException("상담 요청을 찾을 수 없습니다."));
//
//        // Then
//        assertNotNull(foundRequest);
//        assertEquals(customer.getId(), foundRequest.getCustomer().getId());
//        assertEquals(ConsultationRequestStatus.PENDING, foundRequest.getStatus());
//
//        System.out.println("상담 요청 생성 테스트 성공!");
//    }
//}
