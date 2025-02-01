package com.javalab.student.repository;

import com.javalab.student.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
}

