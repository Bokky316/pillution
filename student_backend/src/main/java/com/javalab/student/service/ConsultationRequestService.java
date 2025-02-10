package com.javalab.student.service;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.dto.ConsultationRequestDto;
import com.javalab.student.entity.ConsultationRequest;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.ConsultationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ✅ 상담 요청 관련 서비스 클래스
 * - 상담 요청 생성 및 관리 로직 처리
 */
@Service
@RequiredArgsConstructor
public class ConsultationRequestService {

    private final ConsultationRequestRepository consultationRequestRepository;

    /**
     * 🔹 새로운 상담 요청 생성
     *
     * @param customer 상담 요청자 (고객)
     * @param requestDto 상담 요청 정보 Dto (주제, 주문 ID 등 포함)
     * @return 생성된 상담 요청 Dto 객체
     */
    @Transactional
    public ConsultationRequestDto createConsultationRequest(Member customer, ConsultationRequestDto requestDto) {
        ConsultationRequest request = ConsultationRequest.builder()
                .customer(customer)
                .orderId(requestDto.getOrderId())
                .preMessage(requestDto.getPreMessage())
                .status(ConsultationRequestStatus.PENDING)
                .build();

        ConsultationRequest savedRequest = consultationRequestRepository.save(request);
        return new ConsultationRequestDto(savedRequest);
    }

    /**
     * 🔹 대기 중인 상담 요청 목록 조회 (PENDING 상태)
     *
     * @return 대기 중인 상담 요청 Dto 리스트 반환
     */
    @Transactional(readOnly = true)
    public List<ConsultationRequestDto> getPendingRequests() {
        return consultationRequestRepository.findByStatus(ConsultationRequestStatus.PENDING)
                .stream()
                .map(ConsultationRequestDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 🔹 특정 고객의 모든 상담 요청 조회 (고객 ID 기준)
     *
     * @param customerId 고객 ID
     * @return 해당 고객의 모든 상담 요청 Dto 리스트 반환
     */
    @Transactional(readOnly = true)
    public List<ConsultationRequestDto> getRequestsByCustomer(Long customerId) {
        return consultationRequestRepository.findByCustomerId(customerId)
                .stream()
                .map(ConsultationRequestDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 🔹 특정 상태의 상담 요청 개수 조회 (배지 표시용)
     *
     * @param status 상태 값 (예: PENDING)
     * @return 해당 상태의 상담 요청 개수 반환
     */
    @Transactional(readOnly = true)
    public long countRequestsByStatus(ConsultationRequestStatus status) {
        return consultationRequestRepository.findByStatus(status).size();
    }

}
