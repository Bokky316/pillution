package com.javalab.student.entity.healthSurvey;

import com.javalab.student.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_option")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SurveyQuestion question;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "option_order", nullable = false)
    private Integer optionOrder;
}
