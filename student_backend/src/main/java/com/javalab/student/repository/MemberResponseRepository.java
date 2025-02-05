package com.javalab.student.repository;

import com.javalab.student.entity.MemberResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberResponseRepository extends JpaRepository<MemberResponse, Long> {
    List<MemberResponse> findByMember_IdAndQuestionQuestionTypeNot(Long memberId, String questionType);
    List<MemberResponse> findByMember_Id(Long memberId);
}
