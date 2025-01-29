package com.javalab.student.dto;

import com.javalab.student.entity.Product;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemDto {
    private Long memberId;
    private Product product;
    private Integer quantity;
}

