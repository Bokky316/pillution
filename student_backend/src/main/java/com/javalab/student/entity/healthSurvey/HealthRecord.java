package com.javalab.student.entity.healthSurvey;

import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    private LocalDateTime recordDate;

    @Column(nullable = false)
    private double bmi;

    @Column(columnDefinition = "TEXT")
    private String riskLevels;

    @Column(columnDefinition = "TEXT")
    private String overallAssessment;

    @Column(columnDefinition = "TEXT")
    private String recommendedIngredients;

    @Column(columnDefinition = "TEXT")
    private String recommendedProducts;

    @Column(nullable = false, length = 100)
    private String name; // 사용자 이름

    @Column(nullable = false, length = 10)
    private String gender; // 사용자 성별

    @Column(nullable = false)
    private int age; // 사용자 나이

    @Column(nullable = false)
    private LocalDateTime createdAt; // 건강 기록 생성 시간
}
