package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 질문 옵션과 영양 성분 간의 매핑을 나타내는 엔티티
 */
@Entity
@Table(name = "question_option_ingredient")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;
}
