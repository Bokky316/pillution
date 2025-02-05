package com.javalab.student.repository;

import com.javalab.student.entity.ProductIngredient;
import com.javalab.student.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductIngredientRepository extends JpaRepository<ProductIngredient, Long> {
    List<ProductIngredient> findByProductsContaining(Product product);
}
