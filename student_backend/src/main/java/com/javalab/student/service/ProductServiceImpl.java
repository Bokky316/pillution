package com.javalab.student.service;

import com.javalab.student.dto.*;
import com.javalab.student.entity.Product;
import com.javalab.student.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 상품 관련 비즈니스 로직을 처리하는 서비스 구현체
 */
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public ProductServiceImpl(ProductRepository productRepository, ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    /** 상품 생성 */
    @Override
    public ProductDto createProduct(ProductFormDto productFormDto) {
        Product product = modelMapper.map(productFormDto, Product.class);
        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDto.class);
    }

    /** 상품 정보 수정 */
    @Override
    public ProductDto updateProduct(Long id, ProductFormDto productFormDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        modelMapper.map(productFormDto, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return modelMapper.map(updatedProduct, ProductDto.class);
    }

    /** 상품 단건 조회 */
    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return modelMapper.map(product, ProductDto.class);
    }

    /** 상품 활성화/비활성화 */
    @Override
    public void toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive()); // 활성화/비활성화 토글
        productRepository.save(product);
    }

    /** 전체 상품 목록 조회 */
    @Override
    public List<ProductResponseDTO> getProductList() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** 영양 성분과 카테고리 기준으로 정렬된 상품 조회 */
    @Override
    public List<ProductResponseDTO> getProductsSortedByIngredientAndCategory(Long ingredientId) {
        List<Product> products = productRepository.findProductsByIngredientAndCategory(ingredientId);
        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategories_Id(categoryId);

        return products.stream()
                .map(ProductResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

}
