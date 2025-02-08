package com.javalab.student.repository;

import com.javalab.student.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByEmail(String email);

    /**
     * 이름이 포함된 사용자를 검색하는 JPA 메소드
     * - `ContainingIgnoreCase`를 사용하여 대소문자 구분 없이 검색 가능
     */
    List<Member> findByNameContainingIgnoreCase(String name);
}
