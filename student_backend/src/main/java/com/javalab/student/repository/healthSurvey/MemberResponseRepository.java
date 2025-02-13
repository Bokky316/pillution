package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.MemberResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberResponseRepository extends JpaRepository<MemberResponse, Long> {
    List<MemberResponse> findByMember_IdAndQuestionQuestionTypeNot(Long memberId, String questionType);
    List<MemberResponse> findByMember_Id(Long memberId);
    Optional<MemberResponse> findByMember_IdAndQuestion_Id(Long memberId, Long questionId);

    @Query("SELECT mr FROM MemberResponse mr WHERE mr.member.id = :memberId AND mr.regTime = (SELECT MAX(m.regTime) FROM MemberResponse m WHERE m.member.id = :memberId)")
    List<MemberResponse> findLatestResponsesByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT mr FROM MemberResponse mr WHERE mr.member.id = :memberId AND mr.question.id IN (3, 4, 5)")
    List<MemberResponse> findAgeHeightAndWeightResponses(@Param("memberId") Long memberId);

    @Query("SELECT mr FROM MemberResponse mr WHERE mr.member.id = :memberId AND mr.question.id = 1 ORDER BY mr.regTime DESC LIMIT 1")
    Optional<MemberResponse> findLatestNameResponseByMemberId(@Param("memberId") Long memberId);
}
