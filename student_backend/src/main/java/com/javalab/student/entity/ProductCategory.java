package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
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
}