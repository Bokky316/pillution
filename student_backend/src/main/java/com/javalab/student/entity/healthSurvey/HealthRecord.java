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
@Getter @Setter
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
}
