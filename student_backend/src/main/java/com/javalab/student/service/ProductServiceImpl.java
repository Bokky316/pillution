package com.javalab.student.service;

import com.javalab.student.dto.*;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductImg;
import com.javalab.student.repository.ProductImgRepository;
import com.javalab.student.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImgRepository productImgRepository; // ProductImgRepository 주입
    private final ModelMapper modelMapper;

    @Value("${itemImgLocation}")
    private String itemImgLocation;

    public ProductServiceImpl(ProductRepository productRepository, ProductImgRepository productImgRepository, ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.productImgRepository = productImgRepository;
        this.modelMapper = modelMapper;
    }

    /** 상품 생성 */
    @Override
    @Transactional
    public ProductDto createProduct(ProductFormDto productFormDto) {
        Product product = modelMapper.map(productFormDto, Product.class);
        Product savedProduct = productRepository.save(product);

        // ✅ 대표 이미지 저장
        if (productFormDto.getMainImageFile() != null) {
            MultipartFile mainImageFile = productFormDto.getMainImageFile();
            try {
                String imageUrl = saveImage(mainImageFile);
                ProductImg productImg = ProductImg.builder()
                        .product(savedProduct)
                        .imageUrl(imageUrl)
                        .imageType("대표") // ✅ imageType "대표" 로 설정
                        .order(0) // 대표 이미지는 order 0으로 설정 (필요하다면)
                        .build();
                productImgRepository.save(productImg);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save main image", e);
            }
        }

        // ✅ 상세 이미지들 저장
        if (productFormDto.getDetailImageFiles() != null && !productFormDto.getDetailImageFiles().isEmpty()) {
            List<MultipartFile> detailImageFiles = productFormDto.getDetailImageFiles();
            for (int order = 1; order <= detailImageFiles.size(); order++) { // order 1부터 시작 (대표 이미지 order 0)
                MultipartFile detailImageFile = detailImageFiles.get(order - 1);
                try {
                    String imageUrl = saveImage(detailImageFile);
                    ProductImg productImg = ProductImg.builder()
                            .product(savedProduct)
                            .imageUrl(imageUrl)
                            .imageType("상세") // ✅ imageType "상세" 로 설정
                            .order(order)
                            .build();
                    productImgRepository.save(productImg);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save detail image", e);
                }
            }
        }

        return getProductDtoWithMainImage(savedProduct);
    }

    /** 상품 정보 수정 */
    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductFormDto productFormDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 기존 이미지 삭제 (ProductImg 테이블에서) - 수정 시 기존 이미지 삭제 로직은 그대로 유지
        List<ProductImg> existingImages = productImgRepository.findByProductId(id);
        for (ProductImg img : existingImages) {
            deleteImageFile(img.getImageUrl()); // 파일 시스템에서 이미지 파일 삭제
        }
        productImgRepository.deleteAll(existingImages); // DB에서 이미지 정보 삭제

        modelMapper.map(productFormDto, existingProduct); // Product 정보 업데이트 (이미지 제외)
        Product updatedProduct = productRepository.save(existingProduct);

        // ✅ 대표 이미지 저장 (수정 시 대표 이미지 덮어쓰기)
        if (productFormDto.getMainImageFile() != null) {
            MultipartFile mainImageFile = productFormDto.getMainImageFile();
            try {
                String imageUrl = saveImage(mainImageFile);
                ProductImg productImg = ProductImg.builder()
                        .product(updatedProduct)
                        .imageUrl(imageUrl)
                        .imageType("대표") // ✅ imageType "대표" 로 설정
                        .order(0) // 대표 이미지는 order 0으로 설정 (필요하다면)
                        .build();
                productImgRepository.save(productImg);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save main image", e);
            }
        }

        // ✅ 상세 이미지들 저장 (수정 시 상세 이미지 새로 추가)
        if (productFormDto.getDetailImageFiles() != null && !productFormDto.getDetailImageFiles().isEmpty()) {
            List<MultipartFile> detailImageFiles = productFormDto.getDetailImageFiles();
            for (int order = 1; order <= detailImageFiles.size(); order++) { // order 1부터 시작 (대표 이미지 order 0)
                MultipartFile detailImageFile = detailImageFiles.get(order - 1);
                try {
                    String imageUrl = saveImage(detailImageFile);
                    ProductImg productImg = ProductImg.builder()
                            .product(updatedProduct)
                            .imageUrl(imageUrl)
                            .imageType("상세") // ✅ imageType "상세" 로 설정
                            .order(order)
                            .build();
                    productImgRepository.save(productImg);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save detail image", e);
                }
            }
        }

        return getProductDtoWithMainImage(updatedProduct);
    }


    /** 상품 단건 조회 */
    @Override
    public ProductResponseDTO getProductById(Long id) { // ✅ 반환 타입 ProductResponseDTO 로 변경
        Product product = productRepository.findProductByIdWithCategories(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ProductResponseDTO.fromEntity(product); // ✅ ProductResponseDTO.fromEntity() 사용
    }

// Product 엔티티를 ProductDto 로 변환하면서 대표 이미지 URL 설정 (삭제)
// private ProductDto getProductDtoWithMainImage(Product product) { ... }

    // Product 엔티티를 ProductDto 로 변환하면서 대표 이미지 URL 설정 (ProductResponseDTO 로 변경, 이름 변경)
    private ProductResponseDTO getProductResponseDTOWithImages(Product product) { // ✅ ProductResponseDTO 로 반환, 이름 변경
        ProductResponseDTO productResponseDTO = ProductResponseDTO.fromEntity(product); // ProductResponseDTO.fromEntity() 사용
        ProductImg mainImage = productImgRepository.findFirstByProductIdAndImageTypeOrderByOrderAsc(product.getId(), "대표");
        if (mainImage != null) {
            productResponseDTO.setMainImageUrl(mainImage.getImageUrl());
        }
        return productResponseDTO;
    }

    /** 상품 활성화/비활성화 */
    @Override
    public void toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    /** 전체 상품 목록 조회 */
    @Override
    public List<ProductResponseDTO> getProductList() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(product -> ProductResponseDTO.fromEntity(product)) // ProductResponseDTO.fromEntity 사용
                .collect(Collectors.toList());
    }

    /** 영양 성분과 카테고리 기준으로 정렬된 상품 조회 */
    @Override
    public List<ProductResponseDTO> getProductsSortedByIngredientAndCategory(Long ingredientId) {
        List<Product> products = productRepository.findProductsByIngredientAndCategory(ingredientId);
        return products.stream()
                .map(product -> ProductResponseDTO.fromEntity(product)) // ProductResponseDTO.fromEntity 사용
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategories_Id(categoryId);
        return products.stream()
                .map(product -> ProductResponseDTO.fromEntity(product)) // ProductResponseDTO.fromEntity 사용
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
        List<ProductResponseDTO> dtoList = productPage.getContent().stream()
                .map(product -> ProductResponseDTO.fromEntity(product)) // ProductResponseDTO.fromEntity 사용
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, productPage.getTotalElements());
    }

    // 이미지 저장 로직 (재사용 가능하도록 별도 메소드 추출)
    private String saveImage(MultipartFile imageFile) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
        Path filePath = Paths.get(itemImgLocation, fileName);
        File directory = new File(itemImgLocation);
        if (!directory.exists()) {
            directory.mkdirs(); // 디렉토리 없으면 생성
        }
        Files.write(filePath, imageFile.getBytes());
        return "/api/products/images/" + fileName; // 이미지 URL 반환
    }

    // 이미지 파일 삭제 로직
    private void deleteImageFile(String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1); // URL에서 파일명 추출
                Path filePath = Paths.get(itemImgLocation, filename);
                Files.deleteIfExists(filePath); // 파일 삭제
            } catch (IOException e) {
                log.error("Error deleting image file: " + imageUrl, e);
            }
        }
    }

    // Product 엔티티를 ProductDto 로 변환하면서 대표 이미지 URL 설정
    private ProductDto getProductDtoWithMainImage(Product product) {
        ProductDto productDto = modelMapper.map(product, ProductDto.class);
        ProductImg mainImage = productImgRepository.findFirstByProductIdAndImageTypeOrderByOrderAsc(product.getId(), "대표");
        if (mainImage != null) {
            productDto.setMainImageUrl(mainImage.getImageUrl());
        }
        return productDto;
    }
}