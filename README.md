# 필루션 (Fillution) 프로젝트

## 프로젝트 개요

필루션은 사용자 맞춤형 영양제 추천 및 구독 서비스입니다. 개인의 건강 상태와 라이프스타일에 맞는 영양제를 추천하고, 편리하게 구독할 수 있도록 돕습니다.

## 주요 기능

*   **맞춤형 영양제 추천:** 설문 조사를 통해 사용자의 건강 상태를 분석하고, 최적의 영양제를 추천합니다.
*   **정기 구독 관리:** 구독 상품 목록 확인, 배송 정보 및 결제일 변경, 구독 취소 등 편리한 구독 관리 기능을 제공합니다.
*   **실시간 상담 채팅:** 상담사와 실시간으로 소통하며 궁금한 점을 해결할 수 있습니다.
*   **편리한 회원가입 및 로그인:** SMTP를 활용한 이메일 인증, 아코디언 폼, 소셜 로그인 등 사용자 편의성을 높였습니다.
*   **관리자 페이지:** 회원, 주문, 상품, 게시판 등을 효율적으로 관리할 수 있습니다.

## 기술 스택

### 프론트엔드

*   React
*   Redux Toolkit
*   Material UI
*   Axios
*   SockJS
*   STOMP

### 백엔드

*   Spring Boot
*   Spring Data JPA
*   MariaDB
*   Redis
*   JWT
*   Lombok
*   Gradle

## 시스템 아키텍처

![시스템 아키텍처](https://example.com/architecture-diagram.png)  (이미지 URL)

## 주요 기능 설명

### 1. 회원가입 및 로그인

#### 주요 기능

*   SMTP를 활용한 이메일 인증을 통해 안전한 회원가입을 지원합니다.
*   카카오 소셜 로그인을 통해 간편하게 로그인할 수 있습니다.

#### 설명

*   **이메일 인증 회원가입 기능**:
    *   사용자는 이메일을 아이디로 사용하여 가입 가능.
    *   SMTP를 활용한 이메일 인증 기능 포함: 가입 시 이메일로 6자리 인증번호 발송 → 인증 완료 후 회원가입 가능.
    *   인증번호의 만료 시간은 5분으로 설정되어 있어 무한 인증 시도를 방지.
    *   비밀번호 확인 기능 포함.
    *   **카카오 주소 API**를 이용한 주소 입력 기능.
    *   회원가입 후 회원 정보를 데이터베이스에 저장하며, 가입 완료 시 성공 메시지를 출력.

*   **로그인 기능**:
    *   사용자는 이메일과 비밀번호를 입력하여 로그인 가능.
    *   `Enter` 키 입력 시 로그인 처리.
    *   비밀번호 입력 후 눈 모양 아이콘을 클릭하면 비밀번호를 표시할 수 있어 입력 오류 방지 가능.
    *   잘못된 비밀번호 입력 시 오류 메시지 출력.
    *   **카카오 소셜 로그인** 지원:
    *   로그인 성공 시, 사용자 정보를 Redux 스토어에 저장하며, 사용자의 마지막 로그인 시간을 기록하여 추후 휴면 계정 관리에 활용 예정.

#### 코드 예시 (Java - 백엔드)

```
@PostMapping("/register")
public ResponseEntity registerMember(@RequestBody MemberDto memberDto) {
    Member member = memberService.register(memberDto);
    return ResponseEntity.ok("회원가입이 완료되었습니다.");
}
```

#### 코드 예시 (JavaScript - 프론트엔드)

```
const handleLogin = async () => {
    const response = await fetch(API_URL + "auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: credentials.email, password: credentials.password }),
    });
    const data = await response.json();
    dispatch(setUser({ id: data.id, name: data.name, email: credentials.email, roles: data.roles }));
};
```

### 2. 맞춤형 영양제 추천

#### 주요 기능

*   설문 조사를 통해 사용자의 건강 상태를 파악하고, 개인에게 맞는 영양제를 추천합니다.
*   설문 카테고리, 하위 카테고리, 질문 목록 표시
*   설문 응답 처리, 응답 데이터를 바탕으로 건강 상태를 분석
*   건강 분석 결과를 토대로 필요한 영양 성분을 추천

### 3. 정기 구독 관리

#### 주요 기능

*   정기 구독 상품 목록 확인, 배송 정보 및 결제일 변경, 구독 취소 등 편리한 구독 관리 기능을 제공합니다.

#### 설명

*   **정기 구독 조회 기능**:
    *   사용자는 현재 구독 중인 제품 목록을 확인할 수 있음.
    *   현재 회차, 상품명, 가격, 수량 등 기본적인 정보 제공.
    *   정기구독 할인 혜택 적용된 가격 표시.

*   **정기 구독 상품 편집 기능**:
    *   사용자는 다음 회차의 정기구독 상품을 추가, 삭제, 수량 변경 가능.
    *   상품 추가: 기존 상품 목록에서 선택하여 추가 가능.
    *   상품 삭제: 최소 1개 이상의 상품이 남아 있어야 하며, 마지막 상품 삭제 시 구독 해지.
    *   **상품 추가 시 모달을 사용하여 선택 가능**.
    *   **상품 추가, 삭제, 수량 변경 시 비동기 AJAX 요청을 통해 데이터베이스에 즉시 반영됨.**
    *   구독 가격 계산 기능 포함: 기본 가격, 할인 금액, 총 결제 금액 표시.

*   **결제 관련 기능**:
    *   다음 회차 결제일 변경: 현재 결제일 기준 -15일 ~ +15일 내에서 변경 가능.
    *   결제 수단 변경: 네이버페이, 카카오페이, 신용/체크카드 등 다양한 결제 수단 지원.(예정)
    *   자동 결제 처리: 매월 결제일이 되면 구독 갱신 및 자동 결제.

*   **구독 취소 기능**:
    *   사용자는 언제든지 구독을 취소할 수 있음.
    *   구독 취소 시 상태가 "CANCELLED"로 변경되며, 취소된 구독은 복구할 수 없음.
    *   구독 해지 후에도 현재 회차의 제품은 유지되며, 다음 회차부터 결제되지 않음.

#### 코드 예시 (Java - 백엔드)

```
@GetMapping
public ResponseEntity getSubscription(@RequestParam Long memberId) {
    SubscriptionResponseDto subscription = subscriptionService.getSubscription(memberId);
    return ResponseEntity.ok(subscription);
}

@PutMapping("/cancel")
public ResponseEntity cancelSubscription(@RequestBody Map request) {
    subscriptionService.cancelSubscription(Long.parseLong(request.get("subscriptionId")));
    return ResponseEntity.ok(Map.of("message", "구독이 성공적으로 취소되었습니다."));
}
```

#### 코드 예시 (JavaScript - 프론트엔드)

```
const handleQuantityChange = (productId, newQuantity) => {
    dispatch(updateNextSubscriptionItems({ subscriptionId, updatedItems: [{ productId, nextMonthQuantity: newQuantity }] }));
};
```

### 4. 실시간 상담 채팅

#### 주요 기능

*   상담사와 실시간으로 소통하며 궁금한 점을 해결할 수 있습니다.

#### 설명

*   **채팅방 접속**: URL 파라미터에서 채팅방 ID를 가져와 채팅방 접속
*   **WebSocket 연결**: SockJS를 사용하여 WebSocket 연결 및 STOMP 클라이언트 활성화
*   **메시지 전송 및 수신**: STOMP를 통해 메시지 전송 및 수신
*   **채팅 상태 관리**: 상담사 연결 여부, 채팅 종료 여부 등 상태 관리
*   **이전 메시지 로드**: 채팅방 접속 시 이전 메시지 로드

### 5. 관리자 페이지

#### 주요 기능

*   회원, 주문, 상품, 게시판 등을 효율적으로 관리할 수 있습니다.

## API 엔드포인트

### 회원 관련

*   `POST /api/members/register`: 회원가입
*   `POST /api/auth/login`: 로그인

### 상품 관련

*   `GET /api/products`: 상품 목록 조회

### 구독 관련

*   `GET /api/subscription?memberId={id}`: 구독 정보 조회
*   `PUT /api/subscription/cancel`: 구독 취소

## 데이터베이스 모델

*   Member
*   Product
*   Subscription
*   ChatRoom
*   ChatMessage

## 설치 및 실행 방법

1.  깃허브 저장소를 클론합니다.
2.  백엔드: Spring Boot 프로젝트를 IDE에서 열고 실행합니다.
3.  프론트엔드: React 프로젝트를 IDE에서 열고 실행합니다.

```
git clone [저장소 URL]
cd backend
./gradlew bootRun

cd ../frontend
npm install
npm start
```

## 팀원 소개

*   [팀원 1]: [역할]
*   [팀원 2]: [역할]
*   [팀원 3]: [역할]

## License

[MIT](LICENSE)

## 추가 정보

이 프로젝트는 사용자 맞춤형 영양제 추천 및 구독 서비스를 제공하기 위해 개발되었습니다. 코드 구조, API 설계, 데이터베이스 모델링 등 다양한 측면에서 실제 서비스에 적용할 수 있도록 설계되었습니다.

## 향후 개선 사항

*   추천 알고리즘 고도화
*   UI/UX 개선
*   AI 챗봇 연동

## 🚀 프로젝트 바로가기

[https://github.com/your-username/fillution-presentation](https://github.com/your-username/fillution-presentation)

## 🙏🏻 기여하기

이 프로젝트에 기여하고 싶으시다면, 언제든지 Pull Request를 보내주세요!

## Contact

궁금한 점이나 제안사항이 있다면 언제든지 연락주세요.

*   Email: your-email@example.com

## 🔍 핵심 코드 (백엔드)

### 1. 구독 갱신 스케줄러

```
@Service
@RequiredArgsConstructor
public class SubscriptionRenewService {
    /**
     *  매매일 자정(00:00)에 실행 → 구독상태가 active이면서 `nextBillingDate`가 오늘인 구독 자동 갱신
     * - @Scheduled(cron = "0 0 3 * * *") 매일 새벽 3시에 실행
     * - "0 0 0 * * ?" 매일 자정 (00:00:00) 실행
     * - "0 30 6 * * ?"   매일 오전 6시 30분 실행
     * - "0 0 12 * * ?"   매일 정오(12:00) 실행
     * - "0 * * * * ?"   매 분 0초에 실행 (1분마다 실행)
     * - "별/30 * * * * ?"   30초마다 실행
     * - "0 0/10 * * * ?"   10분마다 실행
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정 실행
    @Transactional
    public void processSubscriptionRenewals() {
        System.out.println("📅 자동 구독 갱신 실행됨 - 현재 시간: " + today);

        //  오늘이 nextBillingDate인 ACTIVE 구독 찾기 (자동 갱신 대상)
        List subscriptionsToRenew = subscriptionRepository.findByNextBillingDateAndStatus(today, "ACTIVE");
```

### 2. 개별 구독 갱신 처리

```
 /**
   * ✅ 개별 구독 갱신 처리
   */
  @Transactional
  public void renewSubscription(Subscription oldSubscription) {
                // ✅ 새 구독 생성
      Subscription newSubscription = Subscription.builder()
                  // 동일한 사용자, 기존 구독의 시작일 유지, 회차 증가, 도로명주소 가져오기
          ... 등등 기존에 등록된 정보 또는 이용자가 수정한 다음구독 정보 
               // ✅ 이전 구독의 상태를 EXPIRED로 변경
             // ✅ SubscriptionNextItem → SubscriptionItem으로 이동
      List nextItems = subscriptionNextItemRepository.findBySubscriptionId(oldSubscription.getId())
      for (SubscriptionNextItem nextItem : nextItems) {
          // ✅ 기존 NextItem을 SubscriptionItem으로 변환하여 저장
          SubscriptionItem newItem = new SubscriptionItem();
           // ✅ 기존 NextItem을 기반으로 새로 생성 
      for (SubscriptionNextItem nextItem : nextItems) {
          SubscriptionNextItem newNextItem = new SubscriptionNextItem()
}
```

### 3. 구독 아이템 편집

```
@DeleteMapping("/delete-next-item") // 🔹 DELETE 요청을 처리하는 엔드포인트
public ResponseEntity deleteNextSubscriptionItem(@RequestBody Map request) {
    // 🔹 요청 바디에서 subscriptionId와 productId 값을 가져옴
    Long subscriptionId = request.get("subscriptionId");
    Long productId = request.get("productId");
    // 🔹 필수 값이 없는 경우, 400 Bad Request 응답을 반환
    if (subscriptionId == null || productId == null) {
        return ResponseEntity.badRequest().body("❌ [ERROR] subscriptionId 또는 productId가 없음!");
    }
    // 🔹 서비스 계층을 호출하여 해당 구독 항목 삭제 시도
    boolean deleted = subscriptionService.deleteNextSubscriptionItem(subscriptionId, productId);
        // 🔹 삭제 성공 시 200 OK 응답과 함께 성공 메시지 반환
        return ResponseEntity.ok(Map.of("message", "삭제성공"));

```

### 4. 구독 조회

```
/**
 * 사용자의 최신 활성화된 구독 정보 조회 API
 * 
 * - 특정 사용자의 활성화된 정기구독 정보를 조회하는 엔드포인트
 * - 구독 정보가 없으면 안내 메시지를 반환
 * - 잘못된 요청(memberId 누락) 또는 서버 오류 발생 시 적절한 응답 처리
 */
@GetMapping
public ResponseEntity getSubscription(@RequestParam(value = "memberId", required = false) Long memberId) {    
    // 🔹 요청 시 memberId가 제공되지 않은 경우, 400 Bad Request 응답 반환
    if (memberId == null) {
        return ResponseEntity.badRequest().body(Map.of("message", "❌ memberId가 필요합니다."));
    }
    try {
        // 🔹 서비스 계층에서 사용자의 최신 정기구독 정보를 가져옴
        SubscriptionResponseDto subscriptionResponse = subscriptionService.getSubscription(memberId);
        // 🔹 구독 정보가 없는 경우, 200 OK 응답과 함께 안내 메시지 반환
        // 🔹 정상적으로 구독 정보를 가져온 경우, 200 OK 응답과 함께 구독 정보 반환
        return ResponseEntity.ok(subscriptionResponse)
}
```

## 🔑 핵심 코드 (프론트엔드)

#### 6.1. react 무한 스크롤

IntersectionObserver API를 사용하여 구현되었습니다.

```
  const lastProductRef = useCallback((node) => {
    if (!hasMore || isFetching) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries.isIntersecting && remainingProducts.length > 0) {
        setIsFetching(true);

        setTimeout(() => {
          const nextProducts = remainingProducts.slice(0, 2);
          setDisplayedProducts((prev) => [...prev, ...nextProducts]);
          setRemainingProducts((prev) => prev.slice(2));
          setHasMore(remainingProducts.length > 2);
          setIsFetching(false);
        }, 1000);
      }
    });

    if (node) observer.current.observe(node);
  }, [remainingProducts, hasMore, isFetching]);
```

#### 6.2. 필터 기능

```
//카테고리 목록을 가져오는 API
const fetchCategories = createAsyncThunk(
    'survey/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}survey/categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
//필터기능
const surveySlice = createSlice({
    name: 'survey',
    initialState: {
        categories: [],
        filteredCategories: null, *// Added filteredCategories*
        filteredSubCategories: null, *// Added filteredSubCategories*
    reducers: {
   
        setFilteredCategories: (state, action) => {
            state.filteredCategories = action.payload;
        },
        setFilteredSubCategories: (state, action) => {
            state.filteredSubCategories = action.payload;
        },
```

## 주요 API 엔드포인트

- `/api/members/register`: 회원가입
- `/api/auth/login`: 로그인
- `/api/products`: 상품 목록 조회
- `/api/subscription`: 구독 정보 조회
- `/api/chat/rooms`: 채팅방 관련 API

## 핵심 데이터 모델

- Member: 사용자 정보 (id, name, email, password, ...)
- Product: 상품 정보 (id, name, description, ingredients, ...)
- Subscription: 구독 정보 (id, member_id, product_id, ...)
- ChatRoom: 채팅방 정보 (id, name, ...)
- ChatMessage: 채팅 메시지 정보 (id, chat_room_id, sender_id, ...)
