package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByMemberIdOrderByRecordDateDesc(Long memberId);
}
