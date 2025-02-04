package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 상품과 카테고리 간의 매핑을 나타내는 엔티티
 */
@Entity
@Table(name = "product_category_mapping")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*@Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;*/

    // 상품(Product)와 연관 관계 설정
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 카테고리(ProductCategory)와 연관 관계 설정
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;
}
