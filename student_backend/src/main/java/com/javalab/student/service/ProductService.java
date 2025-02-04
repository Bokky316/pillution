package com.javalab.student.service;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.ProductDto;
import com.javalab.student.dto.ProductFormDto;

public interface ProductService {

    ProductDto createProduct(ProductFormDto productFormDto);

    ProductDto updateProduct(Long id, ProductFormDto productFormDto);

    ProductDto getProductById(Long id);

    PageResponseDTO<ProductDto> getAllProducts(PageRequestDTO pageRequestDTO);

    void deleteProduct(Long id);
}
