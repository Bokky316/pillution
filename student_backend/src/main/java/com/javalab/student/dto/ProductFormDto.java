package com.javalab.student.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 상품 등록/수정 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFormDto {
    @NotBlank(message = "상품 이름은 필수입니다.")
    @Size(max = 255, message = "상품 이름은 최대 255자까지 가능합니다.")
    private String name;

    private String description;

    @NotNull(message = "가격은 필수입니다.")
    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;

    @Min(value = 0, message = "재고는 0 이상이어야 합니다.")
    private int stock;

    private boolean active;

    private String mainImageUrl;
}
