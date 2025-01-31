package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "survey_category")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyCategory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SurveySubCategory> subCategories = new ArrayList<>();

    public void addSubCategory(SurveySubCategory subCategory) {
        subCategories.add(subCategory);
        subCategory.setCategory(this);
    }
}

