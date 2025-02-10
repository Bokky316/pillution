package com.javalab.student.repository;

import com.javalab.student.constant.ConsultationTopic;
import com.javalab.student.constant.Role;
import com.javalab.student.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    /**
     * 🔹 이메일로 회원을 조회
     */
    Member findByEmail(String email);

    /**
     * 🔹 이름이 포함된 사용자를 검색 (대소문자 구분 없이)
     */
    List<Member> findByNameContainingIgnoreCase(String name);

    /**
     * 🔹 특정 역할(Role)을 가진 모든 회원 조회
     */
    List<Member> findByRole(Role role);

    /**
     * 🔹 활성화된 상담사 목록 조회
     * - Role이 'CS_AGENT'이고 활성화 상태인 사용자만 반환
     */
    @Query("SELECT m FROM Member m WHERE m.role = 'CS_AGENT' AND m.activate = true")
    List<Member> findActiveCSAgents();

    /**
     * 🔹 특정 주제를 처리할 수 있는 활성화된 상담사 조회
     */
    @Query("SELECT m FROM Member m WHERE m.role = 'CS_AGENT' AND m.activate = true AND :topic MEMBER OF m.topics")
    List<Member> findActiveCSAgentsByTopic(@Param("topic") ConsultationTopic topic);

    /**
     * 🔹 특정 ID의 활성화된 상담사 조회
     */
    @Query("SELECT m FROM Member m WHERE m.id = :id AND m.role = 'CS_AGENT' AND m.activate = true")
    Optional<Member> findActiveCSAgentById(@Param("id") Long id);

    /**
     * 🔹 가장 최근에 배정되지 않은 활성화된 상담사 조회
     */
    @Query("SELECT m FROM Member m WHERE m.role = 'CS_AGENT' AND m.activate = true ORDER BY m.lastAssignedAt ASC")
    List<Member> findLeastRecentlyAssignedCSAgents();

    /**
     * 🔹 특정 지역의 활성화된 상담사 목록 조회
     */
    @Query("SELECT m FROM Member m WHERE m.role = 'CS_AGENT' AND m.activate = true AND m.region = :region")
    List<Member> findActiveCSAgentsByRegion(@Param("region") String region);

    /**
     * 🔹 특정 언어를 사용하는 활성화된 상담사 목록 조회
     */
    @Query("SELECT m FROM Member m WHERE m.role = 'CS_AGENT' AND m.activate = true AND :language MEMBER OF m.languages")
    List<Member> findActiveCSAgentsByLanguage(@Param("language") String language);

    /**
     * 🔹 특정 기간 내에 가입한 회원 수 조회
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE m.createdAt BETWEEN :startDate AND :endDate")
    long countMembersJoinedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * 🔹 최근 로그인한 순서대로 회원 조회 (페이징 적용)
     */
    @Query("SELECT m FROM Member m ORDER BY m.lastLoginAt DESC")
    List<Member> findAllOrderByLastLoginAtDesc();

    /**
     * 🔹 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);

    /**
     * 이름으로 사용자를 검색하는 JPA 메소드
     */
    Member findByName(String memberName);

}
