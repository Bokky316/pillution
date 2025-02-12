package com.javalab.student.repository;

import com.javalab.student.entity.ProductImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImgRepository extends JpaRepository<ProductImg, Long> {
    List<ProductImg> findByProductId(Long productId);
    ProductImg findFirstByProductIdAndImageTypeOrderByOrderAsc(Long productId, String imageType); // 대표 이미지 조회
}