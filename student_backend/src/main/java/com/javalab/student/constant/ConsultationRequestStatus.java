package com.javalab.student.constant;

/**
 * 채팅 초대 상태를 나타내는 열거형 상수
 * - 이 enum이 사용되는 곳은 ChatInvitation 엔티티이다.
 */
public enum ConsultationRequestStatus {
    PENDING,  // 상담 대기
    IN_PROGRESS, // 상담 진행중 (수락 및 채팅중)
    CLOSED     // 상담 종료
}
