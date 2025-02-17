package com.javalab.student.repository;

import com.javalab.student.constant.ConsultationTopic;
import com.javalab.student.constant.Role;
import com.javalab.student.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {

    // 이메일로 회원을 조회
    Member findByEmail(String email);

    // 이름이 포함된 사용자를 검색 (대소문자 구분 없이)
    List<Member> findByNameContainingIgnoreCase(String name);

    // 특정 역할(Role)을 가진 모든 회원 조회
    List<Member> findByRole(Role role);

    // 활성화된 상담사 목록 조회
    @Query("SELECT m FROM Member m WHERE m.role = com.javalab.student.constant.Role.CS_AGENT AND m.activate = true")
    List<Member> findActiveCSAgents();

    // 특정 ID의 활성화된 상담사 조회
    @Query("SELECT m FROM Member m WHERE m.id = :id AND m.role = com.javalab.student.constant.Role.CS_AGENT AND m.activate = true")
    Optional<Member> findActiveCSAgentById(@Param("id") Long id);

    // 가장 최근에 배정되지 않은 활성화된 상담사 조회 (수정됨)
    @Query("SELECT m FROM Member m WHERE m.role = com.javalab.student.constant.Role.CS_AGENT AND m.activate = true ORDER BY m.lastLoginAt ASC")
    List<Member> findLeastRecentlyAssignedCSAgents();

    // 최근 로그인한 순서대로 회원 조회 (페이징 적용)
    @Query("SELECT m FROM Member m ORDER BY m.lastLoginAt DESC")
    List<Member> findAllOrderByLastLoginAtDesc();

    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);

    // 회원 상태(activate)별 회원 조회
    Page<Member> findByActivate(boolean activate, Pageable pageable);

    // 이름, 이메일, 아이디로 검색
    default List<Member> searchByNameEmailOrId(String query) {
        Specification<Member> spec = (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 이름 검색 조건
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + query.toLowerCase() + "%"));

            // 이메일 검색 조건
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + query.toLowerCase() + "%"));

            // ID 검색 조건
            try {
                Long id = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), id));
            } catch (NumberFormatException e) {
                // ID가 숫자가 아닌 경우 무시
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
        return findAll(spec);
    }
}
