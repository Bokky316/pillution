package com.javalab.student.repository;

import com.javalab.student.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategories_Name(String categoryName);
    Optional<Product> findByName(String name);
}

