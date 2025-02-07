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

    @Query("SELECT p.id, p.name FROM Product p JOIN p.ingredients i WHERE i.ingredientName = :ingredientName")
    List<Object[]> findByMainIngredientName(@Param("ingredientName") String ingredientName);

    @Query("SELECT DISTINCT p FROM Product p JOIN p.ingredients i WHERE i.ingredientName IN :ingredientNames")
    List<Product> findByIngredientsIngredientNameIn(@Param("ingredientNames") List<String> ingredientNames);

    @Query("SELECT p FROM Product p JOIN p.ingredients i WHERE i.ingredientName = :ingredientName")
    List<Product> findByIngredientName(@Param("ingredientName") String ingredientName);
}
