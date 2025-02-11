package com.javalab.student.controller;

import com.javalab.student.dto.ConsultationRequestDto;
import com.javalab.student.entity.Member;
import com.javalab.student.service.ConsultationRequestService;
import com.javalab.student.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 상담 요청 컨트롤러
 * - 고객의 상담 요청 생성 및 관리 API를 제공합니다.
 */
@RestController
@RequestMapping("/api/consultation")
@RequiredArgsConstructor
public class ConsultationRequestController {

    private final ConsultationRequestService consultationRequestService;
    private final MemberService memberService;

    /**
     * 새로운 상담 요청 생성 API
     *
     * @param requestDto 상담 요청 정보 DTO (주제, 주문 관련 여부 등 포함)
     * @param principal  현재 로그인한 사용자 정보 (Spring Security 사용)
     * @return 생성된 상담 요청 DTO
     */
    @PostMapping("/request")
    public ResponseEntity<ConsultationRequestDto> createConsultationRequest(
            @RequestBody ConsultationRequestDto requestDto,
            Principal principal) {
        Member customer = memberService.findByEmail(principal.getName());
        if (customer == null) {
            return ResponseEntity.badRequest().body(null);
        }
        ConsultationRequestDto createdRequest = consultationRequestService.createConsultationRequest(customer, requestDto);
        return ResponseEntity.ok(createdRequest);
    }

    /**
     * 대기 중인 상담 요청 목록 조회 API (상담사 전용)
     *
     * @return 대기 중인 상담 요청 목록 DTO 리스트
     */
    @GetMapping("/pending-requests")
    public ResponseEntity<List<ConsultationRequestDto>> getPendingRequests() {
        List<ConsultationRequestDto> pendingRequests = consultationRequestService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    /**
     * 특정 고객의 모든 상담 요청 조회 API (고객 전용)
     *
     * @param principal 현재 로그인한 사용자 정보 (Spring Security 사용)
     * @return 해당 고객의 모든 상담 요청 목록 DTO 리스트
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<ConsultationRequestDto>> getCustomerRequests(Principal principal) {
        Member customer = memberService.findByEmail(principal.getName());
        if (customer == null) {
            return ResponseEntity.badRequest().body(null);
        }
        List<ConsultationRequestDto> customerRequests = consultationRequestService.getRequestsByCustomer(customer.getId());
        return ResponseEntity.ok(customerRequests);
    }
}
