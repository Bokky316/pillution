package com.javalab.student.repository;

import com.javalab.student.entity.SurveySubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveySubCategoryRepository extends JpaRepository<SurveySubCategory, Long> {
    List<SurveySubCategory> findByCategoryId(Long categoryId);
}
