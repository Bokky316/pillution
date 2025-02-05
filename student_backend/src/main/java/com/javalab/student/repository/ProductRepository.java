package com.javalab.student.repository;

import com.javalab.student.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.id = :categoryId")
    List<Product> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT pi.ingredientName FROM Product p JOIN p.ingredients pi WHERE p.id = :productId")
    String findMainIngredientByProductId(@Param("productId") Long productId);

    /**
     * 카테고리 및 영양 성분을 함께 로드하는 쿼리
     */
    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.categories c " +
            "LEFT JOIN FETCH p.ingredients i")
    List<Product> findAllWithCategoriesAndIngredients();
}
