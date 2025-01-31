/*
package com.javalab.student.config;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductCategory;
import com.javalab.student.repository.ProductCategoryRepository;
import com.javalab.student.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductDataInitializer implements CommandLineRunner {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0 && productRepository.count() == 0) {
            createProductCategories();
            createProducts();
        }
    }

    private void createProductCategories() {
        List<String> categories = Arrays.asList(
                "여성 건강/PMS", "관절/뼈", "구강 관리", "다이어트", "마음 건강", "피부",
                "노화/항산화", "피로/활력", "간 건강", "장 건강", "위/소화", "눈 건강",
                "면역력", "빈혈", "수면", "모발/두피", "만성질환"
        );

        categories.forEach(name -> {
            ProductCategory category = new ProductCategory();
            category.setName(name);
            categoryRepository.save(category);
        });
    }

    private void createProducts() {
        //1 오메가-3
        Product omega3 = new Product("오메가-3", "혈관 건강, 염증 감소에 도움을 줍니다.", new BigDecimal("25000"), 100);
        omega3.addCategory(categoryRepository.findByName("혈관·혈액순환").orElseThrow());
        omega3.addCategory(categoryRepository.findByName("노화/항산화").orElseThrow());
        omega3.addCategory(categoryRepository.findByName("만성질환").orElseThrow());
        omega3.addCategory(categoryRepository.findByName("눈 건강").orElseThrow());
        omega3.addCategory(categoryRepository.findByName("두뇌 건강").orElseThrow());
        productRepository.save(omega3);

        //2 비타민 C
        Product vitaminC = new Product("비타민C", "면역력 강화, 피부 건강에 도움을 줍니다.", new BigDecimal("15000"), 100);
        vitaminC.addCategory(categoryRepository.findByName("면역력").orElseThrow());
        vitaminC.addCategory(categoryRepository.findByName("피부").orElseThrow());
        vitaminC.addCategory(categoryRepository.findByName("노화/항산화").orElseThrow());
        vitaminC.addCategory(categoryRepository.findByName("구강 관리").orElseThrow());
        vitaminC.addCategory(categoryRepository.findByName("혈관·혈액순환").orElseThrow());
        productRepository.save(vitaminC);

        //3 코엔자임Q10
        Product coq10 = new Product("코엔자임Q10", "심혈관 건강, 에너지 생산에 도움을 줍니다.", new BigDecimal("30000"), 100);
        coq10.addCategory(categoryRepository.findByName("혈관·혈액순환").orElseThrow());
        coq10.addCategory(categoryRepository.findByName("노화/항산화").orElseThrow());
        coq10.addCategory(categoryRepository.findByName("피로/활력").orElseThrow());
        coq10.addCategory(categoryRepository.findByName("만성질환").orElseThrow());
        productRepository.save(coq10);

        //4 철분
        Product iron = new Product("철분", "빈혈 예방에 도움을 줍니다.", new BigDecimal("18000"), 100);
        iron.addCategory(categoryRepository.findByName("빈혈").orElseThrow());
        iron.addCategory(categoryRepository.findByName("피로/활력").orElseThrow());
        iron.addCategory(categoryRepository.findByName("혈관·혈액순환").orElseThrow());
        iron.addCategory(categoryRepository.findByName("여성 건강/PMS").orElseThrow());
        productRepository.save(iron);

        //5 비타민 D
        Product vitaminD = new Product("비타민D", "뼈 건강, 면역력 강화에 도움을 줍니다.", new BigDecimal("20000"), 100);
        vitaminD.addCategory(categoryRepository.findByName("관절/뼈").orElseThrow());
        vitaminD.addCategory(categoryRepository.findByName("면역력").orElseThrow());
        vitaminD.addCategory(categoryRepository.findByName("마음 건강").orElseThrow());
        vitaminD.addCategory(categoryRepository.findByName("만성질환").orElseThrow());
        productRepository.save(vitaminD);

        //6 마그네슘
        Product magnesium = new Product("마그네슘", "근육 건강, 신경 안정에 도움을 줍니다.", new BigDecimal("20000"), 100);
        magnesium.addCategory(categoryRepository.findByName("관절/뼈").orElseThrow());
        magnesium.addCategory(categoryRepository.findByName("마음 건강").orElseThrow());
        magnesium.addCategory(categoryRepository.findByName("피로/활력").orElseThrow());
        magnesium.addCategory(categoryRepository.findByName("수면").orElseThrow());
        productRepository.save(magnesium);

        //7 프로바이오틱스
        Product probiotics = new Product("프로바이오틱스", "장 건강 개선에 도움을 줍니다.", new BigDecimal("30000"), 100);
        probiotics.addCategory(categoryRepository.findByName("다이어트").orElseThrow());
        probiotics.addCategory(categoryRepository.findByName("장 건강").orElseThrow());
        probiotics.addCategory(categoryRepository.findByName("위/소화").orElseThrow());
        probiotics.addCategory(categoryRepository.findByName("면역력").orElseThrow());
        productRepository.save(probiotics);

        //8 비타민B군
        Product vitaminB = new Product("비타민B군", "에너지 대사에 도움을 줍니다.", new BigDecimal("20000"), 100);
        vitaminB.addCategory(categoryRepository.findByName("다이어트").orElseThrow());
        vitaminB.addCategory(categoryRepository.findByName("피로/활력").orElseThrow());
        vitaminB.addCategory(categoryRepository.findByName("간 건강").orElseThrow());
        productRepository.save(vitaminB);

        //9 콜라겐
        Product collagen = new Product("콜라겐", "피부 탄력에 도움을 줍니다.", new BigDecimal("32000"), 100);
        collagen.addCategory(categoryRepository.findByName("피부").orElseThrow());
        productRepository.save(collagen);

        //10 루테인
        Product lutein = new Product("루테인", "눈 건강 및 노화 방지에 도움을 줍니다.", new BigDecimal("28000"), 100);
        lutein.addCategory(categoryRepository.findByName("노화/항산화").orElseThrow());
        lutein.addCategory(categoryRepository.findByName("눈 건강").orElseThrow());
        productRepository.save(lutein);

        //11 아연
        Product zinc = new Product("아연", "면역 세포 활성화에 도움을 줍니다.", new BigDecimal("22000"), 100);
        zinc.addCategory(categoryRepository.findByName("면역력").orElseThrow());
        zinc.addCategory(categoryRepository.findByName("피부").orElseThrow());
        zinc.addCategory(categoryRepository.findByName("모발/두피").orElseThrow());
        productRepository.save(zinc);

        //12 비오틴
        Product biotin = new Product("비오틴", "피부, 손톱, 머리카락 건강에 도움을 줍니다.", new BigDecimal("25000"), 100);
        biotin.addCategory(categoryRepository.findByName("피부").orElseThrow());
        biotin.addCategory(categoryRepository.findByName("모발/두피").orElseThrow());
        productRepository.save(biotin);

        //13 글루타민
        Product glutamine = new Product("글루타민", "위 점막 보호에 도움을 줍니다.", new BigDecimal("28000"), 100);
        glutamine.addCategory(categoryRepository.findByName("위/소화").orElseThrow());
        productRepository.save(glutamine);

        //14 비타민A
        Product vitaminA = new Product("비타민A", "야맹증 예방에 도움을 줍니다.", new BigDecimal("20000"), 100);
        vitaminA.addCategory(categoryRepository.findByName("눈 건강").orElseThrow());
        productRepository.save(vitaminA);

        //15 아스타잔틴
        Product astaxanthin = new Product("아스타잔틴", "눈 피로 완화에 도움을 줍니다.", new BigDecimal("35000"), 100);
        astaxanthin.addCategory(categoryRepository.findByName("눈 건강").orElseThrow());
        productRepository.save(astaxanthin);

        //16 비타민B12
        Product vitaminB12 = new Product("비타민B12", "적혈구 생성에 도움을 줍니다.", new BigDecimal("22000"), 100);
        vitaminB12.addCategory(categoryRepository.findByName("빈혈").orElseThrow());
        productRepository.save(vitaminB12);

        //17 구리
        Product copper = new Product("구리", "멜라닌 생성, 새치 예방에 도움을 줍니다.", new BigDecimal("20000"), 100);
        copper.addCategory(categoryRepository.findByName("모발/두피").orElseThrow());
        productRepository.save(copper);

        //18 인지질(PS)
        Product ps = new Product("인지질(PS)", "뇌 기능 개선에 도움을 줍니다.", new BigDecimal("35000"), 100);
        ps.addCategory(categoryRepository.findByName("만성질환").orElseThrow());
        productRepository.save(ps);

        //19 비타민B6
        Product vitaminB6 = new Product("비타민B6", "PMS 증상 완화, 소화 효소 활성화에 도움을 줍니다.", new BigDecimal("18000"), 100);
        vitaminB6.addCategory(categoryRepository.findByName("여성 건강/PMS").orElseThrow());
        vitaminB6.addCategory(categoryRepository.findByName("위/소화").orElseThrow());
        productRepository.save(vitaminB6);

        //20 칼슘
        Product calcium = new Product("칼슘", "뼈 건강에 도움을 줍니다.", new BigDecimal("18000"), 100);
        calcium.addCategory(categoryRepository.findByName("관절/뼈").orElseThrow());
        productRepository.save(calcium);

        //21 비타민B2
        Product vitaminB2 = new Product("비타민B2", "입안 염증 예방에 도움을 줍니다.", new BigDecimal("18000"), 100);
        vitaminB2.addCategory(categoryRepository.findByName("구강 관리").orElseThrow());
        productRepository.save(vitaminB2);

        //22 판토텐산(비타민B5)
        Product vitaminB5 = new Product("판토텐산(비타민B5)", "지방 대사, 모발 윤기 유지에 도움을 줍니다.", new BigDecimal("22000"), 100);
        vitaminB5.addCategory(categoryRepository.findByName("다이어트").orElseThrow());
        vitaminB5.addCategory(categoryRepository.findByName("모발/두피").orElseThrow());
        productRepository.save(vitaminB5);

        //23 식이섬유
        Product fiber = new Product("식이섬유", "배변 활동 원활에 도움을 줍니다.", new BigDecimal("20000"), 100);
        fiber.addCategory(categoryRepository.findByName("장 건강").orElseThrow());
        productRepository.save(fiber);

        //24 쏘팔메토
        Product sawPalmetto = new Product("쏘팔메토", "전립선 건강에 도움을 줍니다.", new BigDecimal("25000"), 100);
        sawPalmetto.addCategory(categoryRepository.findByName("남성 건강").orElseThrow());
        productRepository.save(sawPalmetto);

        //25 아르기닌
        Product arginine = new Product("아르기닌", "혈액 순환 개선에 도움을 줍니다.", new BigDecimal("28000"), 100);
        arginine.addCategory(categoryRepository.findByName("남성 건강").orElseThrow());
        arginine.addCategory(categoryRepository.findByName("혈관·혈액순환").orElseThrow());
        productRepository.save(arginine);

        //26 GABA
        Product gaba = new Product("GABA", "긴장 완화, 스트레스 감소, 수면 유도, 생리 전후 감정 조절에 도움을 줍니다.", new BigDecimal("30000"), 100);
        gaba.addCategory(categoryRepository.findByName("마음 건강").orElseThrow());
        gaba.addCategory(categoryRepository.findByName("수면").orElseThrow());
        gaba.addCategory(categoryRepository.findByName("여성 건강/PMS").orElseThrow());
        productRepository.save(gaba);

        //27 크랜베리 추출물
        Product cranberry = new Product("크랜베리 추출물", "비뇨기 건강에 도움을 줍니다.", new BigDecimal("25000"), 100);
        cranberry.addCategory(categoryRepository.findByName("여성 건강/PMS").orElseThrow());
        productRepository.save(cranberry);

        //28 엽산
        Product folicAcid = new Product("엽산", "임신, 출산 준비에 도움을 줍니다.", new BigDecimal("20000"), 100);
        folicAcid.addCategory(categoryRepository.findByName("여성 건강/PMS").orElseThrow());
        folicAcid.addCategory(categoryRepository.findByName("빈혈").orElseThrow());
        productRepository.save(folicAcid);

        }
    }

*/
