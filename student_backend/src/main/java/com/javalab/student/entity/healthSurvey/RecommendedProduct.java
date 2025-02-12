package com.javalab.student.entity.healthSurvey;

import jakarta.persistence.*;
import lombok.*;

/**
 * 추천된 상품 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "recommended_product")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Recommendation과 N:1 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private Recommendation recommendation;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(columnDefinition = "TEXT")
    private String reason;
}
