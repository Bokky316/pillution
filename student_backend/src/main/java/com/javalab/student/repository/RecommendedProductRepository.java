package com.javalab.student.repository;

import com.javalab.student.entity.RecommendedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendedProductRepository extends JpaRepository<RecommendedProduct, Long> {
}