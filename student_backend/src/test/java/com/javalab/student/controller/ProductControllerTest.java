package com.javalab.student.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.entity.Product;
import com.javalab.student.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    private Long savedProductId;

    @BeforeEach
    public void setUp() {
        Product product = new Product();
        product.setName("Test Product");
        product.setMainIngredient("Test Ingredient");
        product.setPrice(new BigDecimal("10.00"));
        product.setDescription("Test Description");
        Product savedProduct = productRepository.save(product);
        savedProductId = savedProduct.getId();
    }

    @Test
    @WithMockUser
    @DisplayName("존재하는 상품의 상세 정보를 조회한다.")
    public void testGetProductDetails() throws Exception {
        try {
            MvcResult result = mockMvc.perform(get("/api/products/" + savedProductId))
                    .andDo(print()) // 전체 요청/응답 내용 출력
                    .andReturn();

            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Error Message: " + result.getResolvedException());
        } catch (Exception e) {
            e.printStackTrace(); // 예외 스택 트레이스 출력
            throw e;
        }
    }




    @Test
    @WithMockUser
    @DisplayName("존재하지 않는 상품을 조회하면 404 응답을 받는다.")
    public void testGetNonExistentProduct() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("인증되지 않은 사용자가 상품을 조회하면 302 응답을 받는다.")
    public void testGetProductDetailsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/products/" + savedProductId))
                .andExpect(status().is3xxRedirection());
    }
}
