package com.javalab.student.service;

import com.javalab.student.constant.Role;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.Recommendation;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.RecommendationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
// @Commit // 클래스 전체에 대해 트랜잭션 커밋을 수행합니다. 이로 인해 테스트 데이터가 DB에 유지됩니다.
public class RecommendationServiceTest {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Member testMember;

    @BeforeEach
    public void setUp() {
        // 테스트 멤버 생성
        MemberFormDto memberFormDto = new MemberFormDto();
        memberFormDto.setName("Test User");
        memberFormDto.setEmail("test@example.com");
        memberFormDto.setPassword("password");
        memberFormDto.setAddress("Test Address");
        memberFormDto.setPhone("010-1234-5678");
        memberFormDto.setRole(Role.USER);

        testMember = Member.createMember(memberFormDto, passwordEncoder);
        memberRepository.save(testMember);

        // 테스트 상품 생성
        Product product1 = new Product();
        product1.setName("Test Product 1");
        product1.setMainIngredient("오메가3");
        product1.setPrice(new BigDecimal("10000"));
        product1.setDescription("Description for product 1");
        productRepository.save(product1);

        // 테스트 추천 데이터 생성
        Recommendation recommendation1 = new Recommendation();
        recommendation1.setMember(testMember);
        recommendation1.setProduct(product1);
        recommendation1.setQuestion("피로감");
        recommendation1.setAnswer("예");
        recommendationRepository.save(recommendation1);
    }

    @Test
    @DisplayName("추천 상품 생성 테스트")
    // @Rollback(false) // 개별 테스트 메서드에 대해 롤백을 방지하고 싶다면 이 주석을 해제하세요.
    public void testGenerateRecommendations() {
        // Given
        assertNotNull(testMember, "Test member should not be null");

        // When
        List<Product> recommendedProducts = recommendationService.generateRecommendations(testMember.getId());

        // Then
        assertNotNull(recommendedProducts, "Recommended products should not be null");
        assertFalse(recommendedProducts.isEmpty(), "Recommended products should not be empty");

        // 추천된 상품 수 확인 (Expected: 1)
        assertEquals(1, recommendedProducts.size(),
                "Number of recommended products should match number of recommendations");

        // 추천된 상품의 세부 정보 확인
        Product recommendedProduct = recommendedProducts.get(0);
        assertEquals("Test Product 1", recommendedProduct.getName(), "Product name should match");
        assertEquals("오메가3", recommendedProduct.getMainIngredient(), "Main ingredient should match");
        assertEquals(new BigDecimal("10000"), recommendedProduct.getPrice(), "Product price should match");
        assertEquals("Description for product 1", recommendedProduct.getDescription(), "Product description should match");
    }
}
