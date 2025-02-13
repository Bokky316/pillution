package com.javalab.student.entity.healthSurvey;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.healthSurvey.Recommendation;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;


@Entity
@Table(name = "recommended_product")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private Recommendation recommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(columnDefinition = "TEXT")
    private String reason;
}