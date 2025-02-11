package com.javalab.student.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 DB 사용
@Transactional
public class MessageServiceIntegrationTest {
//
//    @Autowired
//    private MessagePublisherService messagePublisherService;
//
//    @Autowired
//    private MessageRepository messageRepository;
//
//    @Autowired
//    private MemberRepository memberRepository;
//
//    @Autowired
//    private EntityManager entityManager;
//
//    // 테스트용 사용자
//    private Member sender;
//    private Member receiver;
//
//    // WebSocket URI, 포트는 application.properties에 설정한 포트와 일치해야 함
//    // WebSocket 프로토콜은 ws 또는 wss(보안)로 시작
//    // /ws → WebSocket 핸드셰이크 엔드포인트 (Spring WebSocket 설정에 따라 다름)
//    private static final String WEBSOCKET_URI = "ws://localhost:8090/ws";
//
//
////    @BeforeEach
////    void setUp() {
////        entityManager.flush();
////        entityManager.clear();
////
////        // ✅ 테스트용 사용자 저장
////        sender = new Member();
////        sender.setName("Alice");
////        sender.setEmail("alice1111@example.com");
////        sender.setPassword("1234");
////        sender = memberRepository.save(sender);
////
////        receiver = new Member();
////        receiver.setName("Bob");
////        receiver.setEmail("bob1111@example.com");
////        receiver.setPassword("1234");
////        receiver = memberRepository.save(receiver);
////
////        // ✅ DB에 즉시 반영
////        entityManager.flush();
////        entityManager.clear();
////    }
//
//    /**
//     * testRealTimeMessageReception() 메서드 전용 테스트 사용자 설정
//     */
//    @BeforeEach
//    void setUp() {
//        // ✅ 기존 데이터베이스에서 회원 조회
//        sender = memberRepository.findById(1L)
//                .orElseThrow(() -> new IllegalArgumentException("발신자(1번 회원)를 찾을 수 없습니다."));
//        receiver = memberRepository.findById(2L)
//                .orElseThrow(() -> new IllegalArgumentException("수신자(2번 회원)를 찾을 수 없습니다."));
//    }
//
//
//    /**
//     *  메시지를 전송하고 데이터베이스에 저장하는 테스트
//     *  - 처음에는 @Commit 없이 테스트해서 성공하면 @Commit을 추가해서 데이터베이스 확인
//     */
//    @Test
//    @DisplayName("✅ 메시지를 전송(데이터베이스 저장")
//    //@Commit
//    void testMessageSendingAndStorage() {
//        // Arrange
//        String content = "안녕하세요. Bob!";
//        MessageRequestDto requestDto = new MessageRequestDto(sender.getId(), receiver.getId(), content);
//
//        // Act (메시지 전송)
//        messagePublisherService.sendMessage(requestDto);
//
//        // Assert (DB 저장 여부 확인)
//        List<Message> messages = messageRepository.findByReceiverOrderByRegTimeDesc(receiver);
//        assertThat(messages).isNotEmpty();
//        assertThat(messages.get(0).getContent()).isEqualTo(content);
//        assertThat(messages.get(0).getSender().getId()).isEqualTo(sender.getId());
//
//        log.info("✅ 메시지 저장 확인: {}", messages.get(0));
//    }
//
//    /**
//     *  로그인한 사용자의 읽지 않은 메시지 개수를 조회하는 테스트
//     *  - 처음에는 @Commit 없이 테스트해서 성공하면 @Commit을 추가해서 데이터베이스 확인
//     *  - 테스트 할 때 위의 샘플 사용자의 이메일을 반드시 변경해야 한다. (커밋 안해도 중복 오류 발생 가능)
//     */
//    @Test
//    @DisplayName("✅ 읽지 않은 메시지 개수를 조회")
//    //@Commit
//    void testUnreadMessageCountOnLogin() {
//        // Arrange (메시지 전송)
//        String content1 = "첫번째 메시지 전송";
//        String content2 = "두번째 메시지 전송";
//        messagePublisherService.sendMessage(new MessageRequestDto(sender.getId(), receiver.getId(), content1));
//        messagePublisherService.sendMessage(new MessageRequestDto(sender.getId(), receiver.getId(), content2));
//
//        // Act (로그인 후 읽지 않은 메시지 개수 조회)
//        int unreadCount = messageRepository.countUnreadMessages(receiver);
//
//        // Assert
//        assertThat(unreadCount).isEqualTo(2);
//        log.info("✅ 로그인한 사용자 [{}]의 읽지 않은 메시지 개수: {}", receiver.getEmail(), unreadCount);
//    }
//
//    /**
//     *  읽지 않은 메시지를 읽으면 읽음 상태로 변경 테스트
//     *  - 처음에는 @Commit 없이 테스트해서 성공하면 @Commit을 추가해서 데이터베이스 확인
//     *  - 테스트 할 때 위의 샘플 사용자의 이메일을 반드시 변경해야 한다. (커밋 안해도 중복 오류 발생 가능)
//     */
//    @Test
//    @DisplayName("✅ 읽지 않은 메시지를 읽음 상태 변경")
//    @Commit
//    void testMarkMessageAsRead() {
//        // Arrange (읽지 않은 메시지 저장)
//        Message unreadMessage = messageRepository.save(Message.builder()
//                .sender(sender)
//                .receiver(receiver)
//                .content("읽음 상태로 변경할 메시지")
//                .read(false)  // 읽지 않은 상태로 저장
//                .build());
//
//        // Act (메시지를 읽음 상태로 변경)
//        messageRepository.markMessageAsRead(unreadMessage.getId());
//        messageRepository.flush();  // ✅ 변경 사항 즉시 반영
//        entityManager.clear(); // ✅ 영속성 컨텍스트 초기화
//
//        // Assert (읽음 상태 확인)
//        Message updatedMessage = messageRepository.findById(unreadMessage.getId()).orElseThrow();
//        assertThat(updatedMessage.isRead()).isTrue();
//
//        log.info("✅ 메시지 [{}] 읽음 상태 변경 완료: {}", updatedMessage.getId(), updatedMessage.isRead());
//    }
//
//    /**
//     *  WebSocket을 통해 메시지가 실시간으로 수신되는지 테스트
//     * ※ 테스트 하기 전에 백엔드 8080 포트에서 서버를 실행해야 함 ※
//     * - 테스트 하기 전에 TokenAuthenticationFilter에 메시지 url skip 추가
//     *   SecurityConfig에 permitAll 추가
//     * - private static final String WEBSOCKET_URI = "ws://localhost:8080/ws";
//     */
//    @Test
//    @DisplayName("✅ WebSocket을 통해 메시지가 실시간으로 수신되어야 한다")
//    //@Transactional
//    @Commit
//    void testRealTimeMessageReception() throws Exception {
//        // Arrange, WebSocket 연결하여 구독을 하게 되면 실시간으로 메시지를 받을 수 있는 준비 상태가 됨.
//        // WebSocketStompClient를 생성하고, SockJsClient와 WebSocketTransport를 설정하고 MappingJackson2MessageConverter를 설정하여 WebSocketStompClient에 설정하게 되면 WebSocket을 통해 전송된 메시지를 String으로 받을 수 있음.
//        WebSocketStompClient stompClient = new WebSocketStompClient(new SockJsClient(List.of(new WebSocketTransport(new StandardWebSocketClient()))));
//
//        // WebSocket 메시지의 페이로드 타입(데이터 유형)을 지정. WebSocket을 통해 전송된 메시지를 String으로 받도록 설정.
//        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
//
//        // ✅ WebSocket 연결 및 구독 로그 추가
//        log.info("🔹 WebSocket 연결 시도: {}", WEBSOCKET_URI);
//
//        // WebSocket 연결, 최대 5초 대기한 후에 연결이 성공하면 StompSession을 반환
//        // StompSessionHandlerAdapter를 사용하여 WebSocket 연결을 처리 즉, 연결이 성공하면 StompSession을 반환
//        // 반환된 StompSession 객체를 사용하여 WebSocket을 통해 메시지를 구독하고, 메시지를 전송할 수 있음.
//        StompSession stompSession = stompClient.connectAsync(WEBSOCKET_URI, new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
//
//        // CompletableFuture를 사용하여 WebSocket을 통해 메시지가 도착할 때까지 대기
//        // CompletableFuture는 비동기 작업을 수행하고 작업이 완료되면 결과를 반환하는 데 사용
//        CompletableFuture<String> messageReceived = new CompletableFuture<>();
//
//        // ✅ WebSocket 구독 (receiverId에 해당하는 메시지만 받도록 설정)
//        // WebSocket 메시지의 페이로드 타입(데이터 유형)을 지정. WebSocket을 통해 전송된 메시지를 String으로 받도록 설정.
//        // 사용자는 /topic/chat/{receiverId} 경로로 WebSocket을 구독하고 메시지를 수신합니다.
//        // /topic/chat/{receiverId}로 구독하게 되면 receiverId에 해당하는 메시지만 받을 수 있음.
//        // stompSession.subscribe()를 사용하여 WebSocket을 통해 메시지를 구독하게 되면 WebSocket을 통해 메시지를 받을 수 있음.
//        // getPayloadType : WebSocket을 통해 전송된 메시지의 데이터 유형을 지정
//        // handleFrame : WebSocket을 통해 전송된 메시지를 처리 즉, WebSocket을 통해 전송된 메시지를 받을 수 있음.
//        // ✅ WebSocket 구독 경로 로그 추가
//        String subscriptionPath = "/topic/chat/" + receiver.getId();
//        log.info("🔹 WebSocket 구독 경로: {}", subscriptionPath);
//
//        // ✅ WebSocket 구독 (receiverId에 해당하는 메시지만 받도록 설정)
//        // 클라이언트가 WebSocket을 통해 메시지를 구독하는 경로를 지정하고, WebSocket을 통해 전송된 메시지를 처리할 수 있음.
//        stompSession.subscribe(subscriptionPath, new StompFrameHandler() {
//            @NonNull
//            @Override
//            public Type getPayloadType(StompHeaders headers) {
//                return String.class;
//            }
//
//            /**
//             * WebSocket을 통해 전송된 메시지를 처리
//             * - WebSocket을 통해 전송된 메시지를 받을 수 있음.
//             */
//            @Override
//            public void handleFrame(StompHeaders headers, Object payload) {
//                messageReceived.complete((String) payload); // CompletableFuture에 메시지 저장, WebSocket을 통해 전송된 메시지를 받을 수 있음.
//            }
//        });
//
//        // ✅ 메시지 전송
//        String content = "실시간 메시지 테스트";
//        MessageRequestDto requestDto = new MessageRequestDto(sender.getId(), receiver.getId(), content);
//
//        log.info("🔹 메시지 전송 시작 - 발신자 ID: {}, 수신자 ID: {}, 내용: {}",
//                requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());
//
//        // ✅ 구독 완료 대기 (100ms 정도 기다렸다가 메시지 전송)
//        Thread.sleep(100); // 웹소켓 구독이 완료되도록 잠깐 대기
//
//        messagePublisherService.sendMessage(requestDto);
//
//        // ✅ WebSocket을 통해 메시지가 도착할 때까지 대기 (최대 5초)
//        String receivedMessage = messageReceived.get(5, TimeUnit.SECONDS);
//
//        log.info("✅ MessageServiceTest WebSocket을 통해 받은 메시지: {}", receivedMessage);
//
//        // ✅ 메시지가 정상적으로 수신되었는지 검증
//        assertThat(receivedMessage).isEqualTo(content);
//    }





}
