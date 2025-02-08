package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "survey_sub_category")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveySubCategory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonBackReference // 이 부분을 추가/수정했습니다.
    private SurveyCategory category;

    @OneToMany(mappedBy = "subCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<SurveyQuestion> questions = new ArrayList<>();

    public void addQuestion(SurveyQuestion question) {
        questions.add(question);
        question.setSubCategory(this);
    }
}
