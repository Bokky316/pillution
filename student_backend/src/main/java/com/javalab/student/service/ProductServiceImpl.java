package com.javalab.student.service;

import com.javalab.student.dto.*;
import com.javalab.student.entity.Product;
import com.javalab.student.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * 새로운 상품을 생성하고 저장합니다.
     */
    @Override
    public ProductDto createProduct(ProductFormDto productFormDto) {
        Product product = modelMapper.map(productFormDto, Product.class);
        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDto.class);
    }

    /**
     * 기존 상품 정보를 업데이트합니다.
     */
    @Override
    public ProductDto updateProduct(Long id, ProductFormDto productFormDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        modelMapper.map(productFormDto, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return modelMapper.map(updatedProduct, ProductDto.class);
    }

    /**
     * 특정 상품 정보를 조회합니다.
     */
    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return modelMapper.map(product, ProductDto.class);
    }

    /**
     * 페이징 처리를 적용하여 모든 상품 목록을 조회합니다.
     */
    public PageResponseDTO<ProductDto> getAllProducts(PageRequestDTO pageRequestDTO) {
        Pageable pageable = pageRequestDTO.getPageable("id");
        Page<Product> result = productRepository.findAll(pageable);

        List<ProductDto> dtoList = result.getContent().stream()
                .map(product -> modelMapper.map(product, ProductDto.class))
                .collect(Collectors.toList());

        return PageResponseDTO.<ProductDto>builder()
                .dtoList(dtoList)
                .total((int) result.getTotalElements())
                .pageRequestDTO(pageRequestDTO)
                .build();
    }

    /**
     * 특정 상품을 활성/비활성화 합니다.
     */
    @Override
    public void toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive()); // 활성화/비활성화 토글
        productRepository.save(product);
    }

    public List<ProductResponseDTO> getProductList() {
        List<Product> products = productRepository.findAllWithCategories();
        return products.stream().map(ProductResponseDTO::fromEntity).collect(Collectors.toList());
    }
}
