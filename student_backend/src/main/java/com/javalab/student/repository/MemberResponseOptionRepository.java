package com.javalab.student.repository;

import com.javalab.student.entity.MemberResponseOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberResponseOptionRepository extends JpaRepository<MemberResponseOption, Long> {
    List<MemberResponseOption> findByMember_Id(Long memberId);
}