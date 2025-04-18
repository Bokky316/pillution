# 💊 필루션 맞춤형 영양제 추천 및 구독 서비스

## 📑 목차
<details>
  <summary>클릭하여 목차 보기</summary>

- [소개](#-소개)
- [특징](#-특징)
- [링크](#-링크)
- [개발기간](#-개발기간)
- [팀원 구성](#-팀원-구성)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 기능](#-주요-기능)
  <details>
    <summary>주요 기능 세부 항목</summary>

  - [맞춤형 영양제 추천 시스템](#1-맞춤형-영양제-추천-시스템)
  - [편리한 구독 서비스](#2-편리한-구독-서비스)
  - [로그인 및 회원가입](#3-로그인-및-회원가입)
  - [관리자 페이지](#4-관리자-페이지)
  - [상품 관련 페이지](#5-상품-관련-페이지)
  - [주문 / 결제 관련 기능](#6-주문--결제-관련-기능)
  - [결제 관련 기능](#7-결제-관련-기능)
  - [실시간 상담 채팅 / 회원 메시징](#8-실시간-상담-채팅--회원-메시징)
  - [게시판](#9-게시판)
  </details>
- [기술적 도전 및 해결 방법](#-기술적-도전-및-해결-방법)
- [향후 계획](#-향후-계획)
</details>


## 🍎 소개

![메인이미지](https://github.com/user-attachments/assets/e93d67b7-c075-4c5a-805c-c2496e1583b4)

필루션은 Spring Boot와 React 기반으로 구현한 사용자 맞춤형 영양제 추천 및 구독 서비스입니다. <br>
최근 건강에 대한 관심이 증가하면서 맞춤형 영양제에 대한 관심도 함께 높아졌지만, 영양제 정보가 너무 많아 나에게 맞는 제품을 찾기 어렵습니다.<br>
필루션은 사용자의 건강 상태와 라이프스타일을 분석하여 개인화된 영양제를 추천하고, 쇼핑몰과 결합하여 맞춤형 영양제를 편리하게 구독할 수 있도록 사용자에게 최적의 솔루션을 제공합니다.<br>


## 🧩 특징

* 사용자의 건강 상태와 생활 습관을 분석하는 맞춤형 설문 시스템
* 설문 결과를 바탕으로 개인에게 최적화된 영양제 추천
* 추천받은 영양제를 정기적으로 구독할 수 있는 서비스
* 직관적이고 사용하기 쉬운 사용자 인터페이스
* 실시간 고객 상담 채팅 지원

## 🔗 링크

* **배포 사이트** &nbsp;|&nbsp; [필루션 서비스 바로가기](http://43.202.198.161/)
* **시연 영상** &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; [서비스 시연 영상 보기](https://youtu.be/1-zn-aZSXnQ)

## 🗓 개발기간
 
* 2025.01.17 - 2025.02.21

![image](https://github.com/user-attachments/assets/26c57c1f-2020-4bff-bb76-73c10a7e1f2a)


## 👨‍👩‍👧‍👦 팀원 구성

### 👤 장보경
* 설문 시스템, 맞춤형 영양제 추천, 실시간 채팅 상담, 회원 메시지 및 알림, 장바구니, 주문/결제 시스템, 소셜 로그인, 발표
* [GitHub](https://github.com/Bokky316) 🔗

### 👤 김동건
* 회원가입/로그인, 정기 구독 관리, 영상 자료
* [GitHub](https://github.com/kimdongss) 🔗

### 👤 김혜미
* 메인페이지, 게시판(공지사항·FAQ), 산출물, PPT 제작
* [GitHub](https://github.com/kimhyemi0909) 🔗

### 👤 박슬기
* 헤더, 상품 목록 페이지, 상품 상세 페이지, 산출물, PPT
* [GitHub](https://github.com/ParkSeulKi23) 🔗

### 👤 정학추
* 관리자 회원/주문/상품 관리, 통합 UI
* [GitHub](https://github.com/JeongHakChu) 🔗

## 🔧 기술 스택

### OS/DB/TOOLS/ETC
* Windows
* MariaDB
* IntelliJ, Visual Studio Code
* Git

### Backend
* Spring Boot
* JPA
* Gradle
* Spring Security
* JWT
* Redis
* WebSocket

### Frontend
* React
* Redux Toolkit
* Material UI
* SockJS + STOMP

### External API
* Gmail SMTP
* Kakao OAuth
* PortOne 결제 API

## 📂 프로젝트 구조

<details>
<summary>주요 디렉토리 구조 보기</summary>

```
C:.
├─student_backend
│  └─src
│      ├─main
│      │  ├─java
│      │  │  └─com
│      │  │      └─javalab
│      │  │          └─student
│      │  │              ├─config
│      │  │              │  ├─DataInitializer
│      │  │              │  ├─jwt
│      │  │              │  ├─portone
│      │  │              │  ├─redis
│      │  │              │  └─websoket
│      │  │              ├─constant
│      │  │              ├─controller
│      │  │              │  ├─board
│      │  │              │  ├─cartOrder
│      │  │              │  ├─message
│      │  │              │  ├─product
│      │  │              │  └─subscription
│      │  │              ├─dto
│      │  │              │  ├─board
│      │  │              │  ├─cartOrder
│      │  │              │  ├─healthSurvey
│      │  │              │  ├─message
│      │  │              │  ├─product
│      │  │              │  └─Subscription
│      │  │              ├─entity
│      │  │              │  ├─board
│      │  │              │  ├─cartOrder
│      │  │              │  ├─healthSurvey
│      │  │              │  ├─message
│      │  │              │  ├─product
│      │  │              │  └─subscription
│      │  │              ├─exception
│      │  │              ├─repository
│      │  │              │  ├─board
│      │  │              │  ├─cartOrder
│      │  │              │  ├─healthSurvey
│      │  │              │  └─product
│      │  │              ├─security
│      │  │              │  ├─dto
│      │  │              │  ├─handler
│      │  │              │  └─oauth
│      │  │              ├─service
│      │  │              │  ├─board
│      │  │              │  ├─cartOrder
│      │  │              │  ├─healthSurvey
│      │  │              │  ├─product
│      │  │              │  ├─subscription
│      │  │              │  └─webSoket
│      │  │              └─util
│      │  └─resources
│      │      ├─static
│      │      │  └─images
│      │      │      └─products
│      │      └─templates
│      └─test
└─student_frontend
    ├─public
    └─src
        ├─assets
        │  ├─fonts
        │  └─images
        ├─components
        ├─features
        │  ├─admin
        │  │  ├─member
        │  │  ├─order
        │  │  └─product
        │  ├─auth
        │  ├─board
        │  ├─cart
        │  ├─chat
        │  ├─message
        │  ├─modal
        │  ├─payment
        │  ├─product
        │  ├─subscription
        │  └─survey
        ├─hooks
        ├─layouts
        ├─pages
        ├─store
        ├─styles
        └─utils
```
</details>

## 🖥 주요 기능

### 1. 맞춤형 영양제 추천 시스템

필루션의 핵심 기능으로, 사용자 개개인에게 최적화된 영양제를 추천하여 건강 관리를 돕습니다. 다음과 같은 5단계 핵심 로직을 거칩니다:

#### 1.1 설문 조사
- **담당**: SurveyController, SurveyService
- **기능**: 사용자가 건강 관련 질문에 답변
- **수집 정보**: 생활 습관, 건강 상태, 알레르기 여부 등
- **프론트엔드**: SurveyPage.jsx

#### 1.2 건강 분석
- **담당**: HealthAnalysisService
- **기능**: 설문 응답 데이터를 기반으로 사용자의 건강 상태와 위험 요소 분석
- **분석 결과**: 영양 불균형 상태, 부족한 영양소 등 파악

#### 1.3 영양 성분 추천
- **담당**: NutrientScoreService
- **기능**: 건강 상태, 나이, BMI 등을 고려하여 필요한 영양 성분 추천
- **목적**: 개인화된 영양 요구사항 충족

#### 1.4 제품 추천
- **담당**: ProductRecommendationService
- **기능**: 추천된 영양 성분에 맞는 제품 선별 및 추천
- **데이터**: 데이터베이스에 저장된 제품 정보 활용

#### 1.5 건강 기록 관리
- **담당**: HealthRecordService
- **기능**: 건강 분석 결과, 추천 정보 등의 데이터 저장 및 관리
- **사용자 경험**: 자신의 건강 정보 히스토리 확인 가능

### 2. 편리한 구독 서비스

사용자 맞춤 영양제를 간편하게 정기 구독하고, 필요에 따라 관리할 수 있는 서비스를 제공합니다:

#### 2.1 구독 정보 조회
- **담당**: SubscriptionController, SubscriptionService
- **기능**: 현재 구독 중인 제품 목록, 다음 결제 예정일, 결제 금액 등 정보 확인

#### 2.2 상품 편집
- **기능**: 다음 결제 주기에 포함될 상품 추가, 삭제, 수량 변경
- **편의성**: 검색 기능을 통해 원하는 제품 쉽게 찾기 가능

#### 2.3 결제 관리
- **담당**: PaymentController
- **기능**: 결제 수단 변경, 다음 결제일 변경
- **지원 결제수단**: 신용카드, 계좌이체, 간편 결제 등
- **기술**: 외부 결제 API 연동

#### 2.4 배송 관리
- **기능**: 배송 주소 변경, 배송 시 요청사항 추가
- **기술**: 카카오 주소 API 활용

#### 2.5 구독 취소
- **기능**: 구독 취소 및 즉시 해지 처리
- **사용자 경험**: 취소 시 확인 메시지 표시로 오해 방지

### 3. 로그인 및 회원가입
- **기능**: 일반 로그인, 카카오 소셜 로그인, 회원가입
- **보안**: 숨김 비밀번호 보기 기능, 비밀번호 입력 오타 방지
- **기술**: REST API, 카카오 로그인, SMTP 이메일 인증

### 4. 관리자 페이지
- **기능**: 회원 관리, 주문 관리, 상품 관리, 게시판 관리
- **회원 관리**: 회원 목록 조회, 정보 수정
- **주문 관리**: 주문 목록 조회, 상세 정보 확인, 상태 변경, 주문 취소
- **상품 관리**: 상품 목록 조회, 상품 상세 정보 확인, 등록, 수정, 활성화/비활성화
- **게시판 관리**: 공지사항, FAQ 등록, 수정, 삭제

### 5. 상품 관련 페이지
- **상품 목록**: 다양한 필터링 기능, 무한 스크롤 페이징
- **상품-성분-카테고리 관계**: 성분을 기준으로 상품과 카테고리 연결
- **자동 카테고리 설정**: 영양 성분 선택에 따라 관련 카테고리 자동 매핑

### 6. 주문 / 결제 관련 기능
- **기능** : 주문정보, 주문자 정보 자동연동, 카카오 api 주소 사용, 주문자 정보 저장 및 불러오기 가능
- **지원 결제 수단**: 신용카드, 계좌이체, 가상계좌, 페이코, 카카오페이, 토스페이
- **보안**: 각 결제 수단별 별도의 API 연동

### 7. 결제 관련 기능
- **지원 결제 수단**: 신용카드, 계좌이체, 가상계좌, 페이코, 카카오페이, 토스페이
- **보안**: 각 결제 수단별 별도의 API 연동

### 8. 실시간 상담 채팅 / 회원 메시징
- **기능**: 채팅방 생성 및 관리, 실시간 채팅 전송 / 관리자 메시지 전송, 수신 메시지 관리, 메시지 대상 지정, 읽음에 따른 알림 표시
- **기술**: WebSocket, STOMP, Redis의 Pub/Sub 모델
- **특징**: 실시간 알림, 읽음 상태 즉시 업데이트

### 9. 게시판
- **기능**: 공지사항, FAQ 조회
- **목적**: 서비스 관련 정보 제공

## 🔍 기술적 도전 및 해결 방법

프로젝트 진행 과정에서 몇 가지 어려움이 있었습니다:

1. **데이터베이스 설계**: 복잡한 상품-성분-카테고리 관계 설계와 구현
2. **사용자 인터페이스**: 직관적이고 사용하기 쉬운 UI/UX 개발
3. **서버 연동**: WebSocket을 활용한 실시간 채팅 기능 구현
4. **외부 API 연동**: 결제, 주소 검색 등 다양한 외부 API 통합

## 📝 향후 계획

1. **추천 알고리즘 개선**: 더 정확하고 개인화된 영양제 추천 시스템 개발 / 영양제 외 사용자 맞춤 서비스 확장
2. **코드 최적화**: 유지보수를 위한 코드 리팩토링
