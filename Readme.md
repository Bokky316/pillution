# 필루션 (Fillusion) 💊🍃

> **사용자 맞춤형 영양제 추천 및 구독 서비스**  
> 건강 설문을 기반으로 개인에게 최적화된 영양제를 추천하고 편리한 구독 서비스를 제공하는 통합 건강 관리 플랫폼

![필루션 메인화면](https://github.com/user-attachments/assets/e93d67b7-c075-4c5a-805c-c2496e1583b4)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [데모 및 링크](#-데모-및-링크)
- [주요 기능](#-주요-기능)
- [주요 화면](#-주요-화면)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [설치 및 실행](#-설치-및-실행)
- [개발 프로세스](#-개발-프로세스)
- [팀원 소개](#-팀원-소개)
- [프로젝트 일정](#-프로젝트-일정)

## 🎯 프로젝트 소개

**필루션(Fillusion)**은 개인의 건강 상태와 라이프스타일을 분석하여 맞춤형 영양제를 추천하고, 편리한 정기 구독 서비스를 제공하는 통합 건강 관리 플랫폼입니다.

### 핵심 가치
- **개인 맞춤화**: 건강 설문을 통한 개인별 최적 영양제 추천
- **편리한 구독**: 정기 구독을 통한 지속적인 건강 관리
- **실시간 상담**: WebSocket 기반 즉시 고객 지원
- **통합 관리**: 구매부터 배송까지 원스톱 서비스

### 문제 정의
- 건강과 웰빙에 대한 관심 증가로 개인 맞춤형 영양제 수요 급증
- 시중 영양제 종류가 다양하여 자신에게 맞는 제품 선택이 복잡하고 어려움
- 영양제 정보가 너무 많아 개인에게 최적화된 제품을 찾기 힘든 상황

### 솔루션
건강 설문을 기반으로 개인의 건강 상태를 분석하고, 맞춤형 영양제를 추천하는 서비스와 쇼핑몰을 결합하여 사용자에게 최적의 솔루션을 제공

## 🔗 데모 및 링크

- **배포 사이트**: [필루션 서비스 바로가기](http://43.202.198.161/)
- **시연 영상**: [서비스 시연 영상 보기](https://youtu.be/1-zn-aZSXnQ)
- **GitHub Repository**: [프로젝트 저장소](https://github.com/your-repository)

## ✨ 주요 기능

### 💊 맞춤형 영양제 추천 시스템
- **개인화된 건강 설문**: 생활 습관, 건강 상태, 알레르기 등 종합 분석
- **지능형 추천 알고리즘**: 나이, BMI, 건강 위험도를 고려한 영양 성분 추천
- **건강 위험도 분석**: 8개 건강 영역별 상세 위험도 계산
- **영양 성분 점수화**: 개인별 필요 영양소 우선순위 결정
- **건강 기록 관리**: 추천 이력 및 건강 데이터 히스토리 관리

### 📦 편리한 구독 서비스
- **정기 구독 관리**: 맞춤형 영양제 자동 배송 시스템
- **유연한 상품 편집**: 구독 상품 추가/삭제/수량 변경
- **다양한 결제 수단**: 신용카드, 계좌이체, 간편결제 등 6가지 지원
- **배송 관리**: 카카오 주소 API 연동 배송지 관리
- **구독 취소**: 언제든지 구독 해지 가능

### 💬 실시간 상담 서비스
- **WebSocket 기반 실시간 채팅**: 즉시 고객 상담 지원
- **Redis Pub/Sub 모델**: 대량 메시지 처리 및 실시간성 보장
- **읽음 상태 관리**: 메시지 전송 및 읽음 처리 실시간 업데이트
- **관리자 메시징**: 회원별 개별 메시지 발송 기능

### 🛒 종합 쇼핑몰 기능
- **무한 스크롤**: 부드러운 상품 탐색 경험
- **스마트 필터링**: 카테고리, 성분 기반 상품 분류
- **장바구니 시스템**: 구독/일반 구매 통합 관리
- **다중 결제 연동**: PortOne API를 통한 안전한 결제 처리

### 🔧 관리자 시스템
- **회원 관리**: 회원 정보 조회 및 수정
- **주문 관리**: 주문 상태 추적 및 처리
- **상품 관리**: 상품 등록/수정/활성화 관리
- **게시판 관리**: 공지사항, FAQ 등록 및 관리

## 🖥 주요 화면

### 건강 설문 진행
- 단계별 설문 인터페이스
- 실시간 진행 상황 표시
- 개인 건강 상태 종합 분석

### 맞춤형 추천 결과
- 개인별 건강 위험도 시각화
- 추천 영양제 상세 정보
- 영양 성분별 필요도 점수

### 정기 구독 관리
- 구독 상품 관리 대시보드
- 결제 및 배송 정보 설정
- 구독 이력 및 상태 추적

### 실시간 채팅 상담
- 직관적인 채팅 인터페이스
- 실시간 메시지 알림
- 상담 이력 관리

## 🛠 기술 스택

### Backend
```
Java OpenJDK 17
Spring Boot 3.4.1
Spring Data JPA 3.4.1
Spring Security 3.3.6
JWT 0.9.1 (jjwt)
Redis 6.0
WebSocket & STOMP
Gradle 8.x
```

### Frontend
```
React 19
Redux Toolkit
Material-UI (MUI)
SockJS + STOMP
Axios 1.8.1
```

### Database & Infrastructure
```
MariaDB 10.0
AWS EC2
AWS RDS
```

### External APIs
```
Gmail SMTP (이메일 인증)
Kakao OAuth (소셜 로그인)
Kakao Address API (주소 검색)
PortOne API (결제 처리)
```

### Development Tools
```
IntelliJ IDEA
Visual Studio Code
Git/GitHub
DBeaver
Notion
```

## 🏗 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   프론트엔드     │    │    백엔드       │    │   데이터베이스   │
│   React 19      │◄──►│  Spring Boot    │◄──►│   MariaDB      │
│   Redux Toolkit │    │  Spring JPA     │    │   AWS RDS      │
│   Material-UI   │    │  Spring Security│    │                │
└─────────────────┘    │  WebSocket      │    └─────────────────┘
                       │  Redis          │
                       └─────────────────┘
                              ▲
                              │
                       ┌─────────────────┐
                       │   External APIs │
                       │ Kakao, PortOne  │
                       └─────────────────┘
```

### 주요 구성 요소
- **Frontend**: 사용자 인터페이스 및 상호작용 담당
- **Backend**: 비즈니스 로직 처리 및 API 제공
- **Database**: 사용자, 상품, 주문 데이터 영구 저장
- **Redis**: 실시간 메시징 및 세션 관리
- **External APIs**: 소셜 로그인, 결제, 주소 검색 등

## 🚀 설치 및 실행

### 사전 요구사항
- Java 17+
- Node.js 16+
- MariaDB 10.0+
- Redis 6.0+

### Backend 실행
```bash
# 저장소 클론
git clone https://github.com/your-repository/fillusion.git
cd fillusion/backend

# 의존성 설치 및 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

### Frontend 실행
```bash
cd fillusion/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 환경 설정
```yaml
# application.yml 예시
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/fillusion
    username: your_username
    password: your_password
  
  redis:
    host: localhost
    port: 6379
    
  security:
    jwt:
      secret: your_jwt_secret
      
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_email@gmail.com
    password: your_app_password
```

## 📋 개발 프로세스

### Git Workflow
```bash
# 기능별 브랜치 생성
git checkout -b feat/기능명

# 작은 단위로 커밋
git commit -m "feat: 건강 설문 기능 구현"

# Pull Request로 코드 리뷰
```

### 커밋 메시지 규칙
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정

### 명명 규칙
- **클래스**: CamelCase (예: `SurveyController`)
- **메서드/변수**: camelCase (예: `getUserName`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_COUNT`)
- **패키지**: lowercase (예: `com.javalab.student`)

## 👥 팀원 소개

### 👤 장보경
* **담당 업무**: 설문 시스템, 맞춤형 영양제 추천, 실시간 채팅 상담, 회원 메시지 및 알림, 장바구니, 주문/결제 시스템, 소셜 로그인, 발표, 배포 (CI/CD)
* **GitHub**: [Bokky316](https://github.com/Bokky316) 🔗

### 👤 김동건
* **담당 업무**: 회원가입/로그인, 정기 구독 관리, 영상 자료
* **GitHub**: [kimdongss](https://github.com/kimdongss) 🔗

### 👤 김혜미
* **담당 업무**: 메인페이지, 게시판(공지사항·FAQ), 산출물, PPT 제작
* **GitHub**: [kimhyemi0909](https://github.com/kimhyemi0909) 🔗

### 👤 박슬기
* **담당 업무**: 헤더, 상품 목록 페이지, 상품 상세 페이지, 산출물, PPT
* **GitHub**: [ParkSeulKi23](https://github.com/ParkSeulKi23) 🔗

### 👤 정학추
* **담당 업무**: 관리자 회원/주문/상품 관리, 통합 UI
* **GitHub**: [JeongHakChu](https://github.com/JeongHakChu) 🔗

## 📅 프로젝트 일정

**개발 기간**: 2025.01.17 ~ 2025.02.21 (5주)

```
주차별 진행 상황:
1주차 (01.17-01.23): 프로젝트 기획 및 설계
2주차 (01.24-01.30): 기본 기능 구현 (회원관리, 상품관리)
3주차 (01.31-02.06): 핵심 기능 구현 (설문, 추천 시스템)
4주차 (02.07-02.13): 고급 기능 구현 (채팅, 구독 서비스)
5주차 (02.14-02.21): 테스트, 배포, 발표 준비
```

![개발 일정표](https://github.com/user-attachments/assets/26c57c1f-2020-4bff-bb76-73c10a7e1f2a)

## 🔍 기술적 도전 및 해결 방법

### 주요 도전 과제
1. **복잡한 추천 알고리즘**: 개인별 건강 상태를 분석하여 최적의 영양제를 추천하는 로직 구현
2. **실시간 채팅 시스템**: WebSocket과 Redis를 활용한 대규모 실시간 메시징 처리
3. **다중 결제 API 연동**: 6가지 결제 수단의 안정적인 통합 처리
4. **상품-성분-카테고리 관계**: 복잡한 데이터 구조 설계 및 최적화

### 해결 방법
- **점수 기반 추천 시스템**: 나이, BMI, 건강 위험도를 종합한 영양 성분 점수화
- **Redis Pub/Sub 모델**: 메시지 브로커를 통한 효율적인 실시간 통신
- **통합 결제 서비스**: PortOne API를 활용한 결제 수단 통합 관리
- **정규화된 DB 설계**: 성분을 중심으로 한 효율적인 데이터 구조 설계

## 🚧 향후 개발 계획

- **추천 알고리즘 고도화**: 머신러닝 기반 개인화 추천 시스템 개선
- **모바일 앱 개발**: React Native 기반 모바일 애플리케이션 출시
- **AI 챗봇 도입**: 자동 상담 및 건강 정보 제공 서비스
- **건강 데이터 연동**: 웨어러블 기기 및 건강 앱 연동
- **커뮤니티 기능**: 사용자 간 건강 정보 공유 플랫폼
- **코드 최적화**: 유지보수성 향상을 위한 리팩토링

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/기능명`)
3. Commit your Changes (`git commit -m 'feat: 새로운 기능 추가'`)
4. Push to the Branch (`git push origin feat/기능명`)
5. Open a Pull Request

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의사항

프로젝트에 대한 문의사항이나 제안사항이 있으시면 언제든 연락해 주세요.

---

**Made with 💊 by Team 필루션**

*"개인 맞춤형 건강 관리의 새로운 시작, 필루션과 함께하세요"*
