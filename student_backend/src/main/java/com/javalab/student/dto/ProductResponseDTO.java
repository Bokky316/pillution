package com.javalab.student.dto;

import com.javalab.student.entity.Product;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라이언트 응답용 상품 DTO
 */
@Getter
@Setter
public class ProductResponseDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private Boolean active;
    private List<String> categories; // 카테고리 이름 리스트

    public static ProductResponseDTO fromEntity(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setActive(product.getActive());
        dto.setCategories(product.getCategoryMappings().stream()
                .map(mapping -> mapping.getCategory().getName()) // 카테고리 이름 추출
                .collect(Collectors.toList()));
        return dto;
    }
}
