package com.javalab.student.entity.healthSurvey;

import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 회원에 대한 추천 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "recommendation")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 추천된 영양 성분 리스트 (1:N 관계)
    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecommendedIngredient> recommendedIngredients;

    // 추천된 상품 리스트 (1:N 관계)
    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecommendedProduct> recommendedProducts;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void addRecommendedIngredient(RecommendedIngredient ingredient) {
        recommendedIngredients.add(ingredient);
        ingredient.setRecommendation(this);
    }

    public void addRecommendedProduct(RecommendedProduct product) {
        recommendedProducts.add(product);
        product.setRecommendation(this);
    }
}
