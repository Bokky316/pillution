package com.javalab.student.dto;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductCategory;
import com.javalab.student.entity.ProductIngredient;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라이언트 응답용 상품 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private Boolean active;
    private String mainImageUrl;
    private List<String> categories;  // 카테고리 이름 리스트
    private List<String> ingredients; // 영양 성분 리스트
    private String description;

    /** Product 엔티티를 DTO로 변환 */
    public static ProductResponseDTO fromEntity(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .active(product.isActive())
                .mainImageUrl(product.getMainImageUrl())
                .categories(product.getCategories() != null
                        ? product.getCategories().stream()
                        .map(ProductCategory::getName)
                        .collect(Collectors.toList())
                        : List.of())  // Null 처리
                .ingredients(product.getIngredients() != null
                        ? product.getIngredients().stream()
                        .map(ProductIngredient::getIngredientName)
                        .collect(Collectors.toList())
                        : List.of())  // Null 처리
                .description(product.getDescription())
                .build();
    }
}
