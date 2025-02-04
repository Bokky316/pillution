package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 상품 카테고리 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "product_category")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // 카테고리 매핑 정보와 연관 관계 설정
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductCategoryMapping> categoryMappings;
}