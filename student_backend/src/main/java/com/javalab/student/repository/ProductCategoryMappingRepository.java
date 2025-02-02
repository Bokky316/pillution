package com.javalab.student.repository;

import com.javalab.student.entity.ProductCategoryMapping;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryMappingRepository extends JpaRepository<ProductCategoryMapping, Long> {
}
