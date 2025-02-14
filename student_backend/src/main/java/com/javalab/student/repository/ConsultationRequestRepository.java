package com.javalab.student.repository;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.entity.ConsultationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ✅ 상담 요청 레포지토리
 * - 상담 요청 데이터를 데이터베이스에서 조회, 저장, 삭제하는 기능을 제공
 */
@Repository
public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Long> {

    /**
     * 🔹 특정 상태의 상담 요청 목록 조회
     * - 상담 요청 상태(PENDING, ACCEPTED 등)를 기준으로 요청 목록을 반환
     */
    List<ConsultationRequest> findByStatus(ConsultationRequestStatus status);

    /**
     * 🔹 특정 고객의 상담 요청 목록 조회
     * - 고객 ID를 기준으로 해당 고객이 생성한 상담 요청을 반환
     */
    List<ConsultationRequest> findByCustomerId(Long customerId);

    /**
     * 🔹 특정 상담사의 상담 요청 목록 조회
     * - 상담사 ID를 기준으로 해당 상담사가 수락한 요청을 반환
     */
    List<ConsultationRequest> findByCsAgentId(Long csAgentId);
}
