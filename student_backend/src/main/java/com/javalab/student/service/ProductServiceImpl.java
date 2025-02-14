package com.javalab.student.service;

import com.javalab.student.dto.*;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductCategory;
import com.javalab.student.entity.ProductIngredient;
import com.javalab.student.repository.ProductCategoryRepository;
import com.javalab.student.repository.ProductIngredientCategoryRepository;
import com.javalab.student.repository.ProductIngredientRepository;
import com.javalab.student.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 상품 관련 비즈니스 로직을 처리하는 서비스 구현체
 */
@Service
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductIngredientRepository ingredientRepository;
    private final ProductIngredientCategoryRepository ingredientCategoryRepository;
    private final ModelMapper modelMapper;

    public ProductServiceImpl(ProductRepository productRepository, ProductCategoryRepository categoryRepository,
                              ProductIngredientRepository ingredientRepository, ProductIngredientCategoryRepository ingredientCategoryRepository,
                              ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.ingredientRepository = ingredientRepository;
        this.ingredientCategoryRepository = ingredientCategoryRepository;
        this.modelMapper = modelMapper;
    }

    /** 상품 생성 */
    @Override
    @Transactional
    public ProductDto createProduct(ProductFormDto productFormDto) {
        log.info("Creating product with ingredients: {}", productFormDto.getIngredientIds());

        Product product = modelMapper.map(productFormDto, Product.class);
        List<ProductIngredient> ingredients = ingredientRepository.findAllById(productFormDto.getIngredientIds());
        log.info("Found ingredients: {}", ingredients);

        product.setIngredients(ingredients);

        List<ProductCategory> categories = new ArrayList<>();
        for (ProductIngredient ingredient : ingredients) {
            List<ProductCategory> mappedCategories = ingredientCategoryRepository.findCategoriesByIngredientId(ingredient.getId());
            log.info("Found categories for ingredient {}: {}", ingredient.getId(), mappedCategories);
            categories.addAll(mappedCategories);
        }

        List<ProductCategory> distinctCategories = categories.stream().distinct().collect(Collectors.toList());
        log.info("Final categories to be set: {}", distinctCategories);
        product.setCategories(distinctCategories);

        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDto.class);
    }

    /** 상품 수정 */
    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductFormDto productFormDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        modelMapper.map(productFormDto, existingProduct);

        // 변경된 영양 성분 반영
        List<ProductIngredient> newIngredients = ingredientRepository.findAllById(productFormDto.getIngredientIds());
        existingProduct.setIngredients(newIngredients);

        // **자동 카테고리 재설정**
        List<ProductCategory> updatedCategories = new ArrayList<>();
        for (ProductIngredient ingredient : newIngredients) {
            List<ProductCategory> mappedCategories = ingredientCategoryRepository.findCategoriesByIngredientId(ingredient.getId());
            updatedCategories.addAll(mappedCategories);
        }
        existingProduct.setCategories(updatedCategories.stream().distinct().collect(Collectors.toList())); // 중복 제거

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

    // 검색 기능 구현
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> searchProducts(String field, String query, Pageable pageable) {
        Page<Product> productPage;

        if ("상품명".equals(field)) {
            productPage = productRepository.findByNameContaining(query, pageable);
        } else if ("카테고리".equals(field)) {
            productPage = productRepository.findByCategories_NameContaining(query, pageable);
        } else if ("영양성분".equals(field)) {
            productPage = productRepository.findByIngredients_IngredientNameContaining(query, pageable);
        }  else {
            // 기본값: 전체 상품 조회
            productPage = productRepository.findAll(pageable);
        }
        //Product list 를 DtoList로
        List<ProductResponseDTO> dtoList = productPage.getContent().stream()
                .map(ProductResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, productPage.getTotalElements());
    }



}