/*
package com.javalab.student.config.DataInitializer;

import com.javalab.student.constant.Role;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.entity.board.Board;
import com.javalab.student.entity.board.Post;
import com.javalab.student.entity.healthSurvey.QuestionOption;
import com.javalab.student.entity.healthSurvey.SurveyCategory;
import com.javalab.student.entity.healthSurvey.SurveyQuestion;
import com.javalab.student.entity.healthSurvey.SurveySubCategory;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.product.Product;
import com.javalab.student.entity.product.ProductCategory;
import com.javalab.student.entity.product.ProductIngredient;
import com.javalab.student.entity.product.ProductIngredientCategoryMapping;
import com.javalab.student.entity.subscription.Subscription;
import com.javalab.student.entity.subscription.SubscriptionItem;
import com.javalab.student.entity.subscription.SubscriptionNextItem;
import com.javalab.student.repository.board.BoardRepository;
import com.javalab.student.repository.board.PostRepository;
import com.javalab.student.repository.healthSurvey.QuestionOptionRepository;
import com.javalab.student.repository.healthSurvey.SurveyCategoryRepository;
import com.javalab.student.repository.healthSurvey.SurveyQuestionRepository;
import com.javalab.student.repository.healthSurvey.SurveySubCategoryRepository;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.product.ProductCategoryRepository;
import com.javalab.student.repository.product.ProductIngredientCategoryRepository;
import com.javalab.student.repository.product.ProductIngredientRepository;
import com.javalab.student.repository.product.ProductRepository;
import com.javalab.student.repository.SubscriptionItemRepository;
import com.javalab.student.repository.SubscriptionNextItemRepository;
import com.javalab.student.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

//애플리케이션 시작 시 초기 데이터를 설정하는 클래스입니다.
//Product, Survey, Board, Subscription 데이터 이니셜라이저를 통합 관리합니다.

@Component
@RequiredArgsConstructor
public class TotalDataInitializer implements CommandLineRunner {

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductIngredientRepository productIngredientRepository;
    private final ProductRepository productRepository;
    private final ProductIngredientCategoryRepository productIngredientCategoryRepository;
    private final SurveyCategoryRepository categoryRepository;
    private final SurveySubCategoryRepository subCategoryRepository;
    private final SurveyQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final BoardRepository boardRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;
    private final SubscriptionNextItemRepository subscriptionNextItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
//        initializeProductData();
//        initializeProductIngredients();
//        initializeIngredientCategoryMappings();
        initializeMemberData();
        initializeSurveyData();
        initializeBoardData();
//        initializeProducts();
        initializePosts();
        initializeSubscriptionData();
    }


//    Member 데이터 초기화 메서드
private void initializeMemberData() {
    if (memberRepository.count() > 0) {
        System.out.println("✅ Member 데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
        return;
    }

    try {
        createMemberIfNotExist(memberRepository, passwordEncoder, "test2@example.com", "일반회원", Role.USER);
        createMemberIfNotExist(memberRepository, passwordEncoder, "test@example.com", "관리자", Role.ADMIN);
        createMemberIfNotExist(memberRepository, passwordEncoder, "test1@example.com", "상담사", Role.CS_AGENT);
        System.out.println("✅ Member 데이터 초기화 완료");
    } catch (Exception e) {
        System.out.println("❌ Member 데이터 초기화 중 오류 발생: " + e.getMessage());
    }
}

    @Transactional
    public void createMemberIfNotExist(MemberRepository memberRepository, PasswordEncoder passwordEncoder,
                                       String email, String name, Role role) {
        Member existingMember = memberRepository.findByEmail(email);
        if (existingMember != null) {
            System.out.println("Member already exists: " + email);
            return;
        }

        try {
            MemberFormDto memberFormDto = MemberFormDto.builder()
                    .email(email)
                    .name(name)
                    .postalCode("06234")
                    .roadAddress("서울특별시 강남구 테헤란로 123")
                    .detailAddress("삼성빌딩 5층")
                    .password("1234")
                    .phone("010-1234-5678")
                    .role(role)
                    .build();

            Member member = Member.createMember(memberFormDto, passwordEncoder);
            memberRepository.save(member);
            System.out.println("Test member created: " + member.getEmail() + " (Role: " + role + ")");
        } catch (Exception e) {
            System.out.println("Error creating member: " + email + " - " + e.getMessage());
        }
    }

//  Product 데이터 초기화 메서드

    private void initializeProductData() throws Exception {
        List<String> categories = Arrays.asList(
                "여성 건강/PMS", "관절/뼈", "구강 관리", "다이어트", "마음 건강",
                "피부", "노화/항산화", "피로/활력", "간 건강", "장 건강",
                "위/소화", "눈 건강", "면역력", "빈혈", "수면",
                "모발/두피", "만성질환"
        );

        categories.forEach(category -> {
            if (productCategoryRepository.findByName(category).isEmpty()) {
                ProductCategory productCategory = new ProductCategory();
                productCategory.setName(category);
                productCategoryRepository.save(productCategory);
            }
        });
    }

    private void initializeProductIngredients() {
        List<String> ingredients = Arrays.asList(
                "오메가-3", "코엔자임Q10", "비타민B군", "비타민C", "철분",
                "아연", "마그네슘", "비오틴", "루테인", "인지질(PS)",
                "GABA", "칼슘", "비타민D", "크랜베리 추출물", "글루타민",
                "콜라겐", "엽산", "감마리놀렌산(GLA)", "쏘팔메토", "아르기닌",
                "구리", "크롬", "비타민A", "비타민B12", "비타민B2",
                "비타민B5", "비타민B6", "비타민E", "밀크씨슬", "아미노산",
                "식이섬유", "전해질", "프로바이오틱스", "단백질", "종합비타민"
        );

        ingredients.forEach(ingredient -> {
            if (productIngredientRepository.findByIngredientName(ingredient).isEmpty()) {
                ProductIngredient productIngredient = new ProductIngredient();
                productIngredient.setIngredientName(ingredient);
                productIngredientRepository.save(productIngredient);
            }
        });
    }

    private void initializeIngredientCategoryMappings() {
        // 여성 건강/PMS
        addMapping("감마리놀렌산(GLA)", "여성 건강/PMS");
        addMapping("엽산", "여성 건강/PMS");
        addMapping("철분", "여성 건강/PMS");
        addMapping("크랜베리 추출물", "여성 건강/PMS");
        addMapping("GABA", "여성 건강/PMS");
        addMapping("비타민B군", "여성 건강/PMS");

        // 관절/뼈
        addMapping("칼슘", "관절/뼈");
        addMapping("비타민D", "관절/뼈");
        addMapping("마그네슘", "관절/뼈");

        // 구강 관리
        addMapping("비타민C", "구강 관리");
        addMapping("코엔자임Q10", "구강 관리");
        addMapping("비오틴", "구강 관리");

        // 다이어트
        addMapping("아르기닌", "다이어트");
        addMapping("비타민B군", "다이어트");
        addMapping("마그네슘", "다이어트");

        // 마음 건강
        addMapping("GABA", "마음 건강");
        addMapping("비타민D", "마음 건강");
        addMapping("마그네슘", "마음 건강");
        addMapping("오메가-3", "마음 건강");

        // 피부
        addMapping("콜라겐", "피부");
        addMapping("비타민C", "피부");
        addMapping("아연", "피부");
        addMapping("비오틴", "피부");
        addMapping("감마리놀렌산(GLA)", "피부");

        // 노화/항산화
        addMapping("오메가-3", "노화/항산화");
        addMapping("코엔자임Q10", "노화/항산화");
        addMapping("비타민C", "노화/항산화");
        addMapping("루테인", "노화/항산화");

        // 피로/활력
        addMapping("비타민B군", "피로/활력");
        addMapping("코엔자임Q10", "피로/활력");
        addMapping("철분", "피로/활력");
        addMapping("마그네슘", "피로/활력");

        // 간 건강
        addMapping("비타민B군", "간 건강");
        addMapping("오메가-3", "간 건강");

        // 장 건강
        addMapping("글루타민", "장 건강");
        addMapping("비타민B군", "장 건강");

        // 위/소화
        addMapping("글루타민", "위/소화");
        addMapping("비타민B군", "위/소화");
        addMapping("아연", "위/소화");

        // 눈 건강
        addMapping("루테인", "눈 건강");
        addMapping("쏘팔메토", "눈 건강");
        addMapping("오메가-3", "눈 건강");

        // 면역력
        addMapping("비타민C", "면역력");
        addMapping("아연", "면역력");
        addMapping("비타민D", "면역력");
        addMapping("글루타민", "면역력");

        // 빈혈
        addMapping("철분", "빈혈");
        addMapping("비타민B군", "빈혈");
        addMapping("엽산", "빈혈");

        // 수면
        addMapping("GABA", "수면");
        addMapping("마그네슘", "수면");

        // 모발/두피
        addMapping("비오틴", "모발/두피");
        addMapping("아연", "모발/두피");
        addMapping("아르기닌", "모발/두피");

        // 만성질환
        addMapping("오메가-3", "만성질환");
        addMapping("코엔자임Q10", "만성질환");
        addMapping("인지질(PS)", "만성질환");
        addMapping("비타민D", "만성질환");
    }

    private void addMapping(String ingredientName, String categoryName) {
        ProductIngredient ingredient = productIngredientRepository.findByIngredientName(ingredientName)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: " + ingredientName));

        ProductCategory category = productCategoryRepository.findByName(categoryName)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categoryName));

        if (!productIngredientCategoryRepository.findCategoriesByIngredientId(ingredient.getId()).contains(category)) {
            ProductIngredientCategoryMapping mapping = new ProductIngredientCategoryMapping();
            mapping.setIngredient(ingredient);
            mapping.setCategory(category);
            productIngredientCategoryRepository.save(mapping);
        }
    }

    private void initializeProducts() {
        // 카테고리 조회
        ProductCategory 여성건강 = productCategoryRepository.findByName("여성 건강/PMS").orElseThrow();
        ProductCategory 관절뼈 = productCategoryRepository.findByName("관절/뼈").orElseThrow();
        ProductCategory 구강관리 = productCategoryRepository.findByName("구강 관리").orElseThrow();
        ProductCategory 다이어트 = productCategoryRepository.findByName("다이어트").orElseThrow();
        ProductCategory 마음건강 = productCategoryRepository.findByName("마음 건강").orElseThrow();
        ProductCategory 피부 = productCategoryRepository.findByName("피부").orElseThrow();
        ProductCategory 노화항산화 = productCategoryRepository.findByName("노화/항산화").orElseThrow();
        ProductCategory 피로활력 = productCategoryRepository.findByName("피로/활력").orElseThrow();
        ProductCategory 간건강 = productCategoryRepository.findByName("간 건강").orElseThrow();
        ProductCategory 장건강 = productCategoryRepository.findByName("장 건강").orElseThrow();
        ProductCategory 위소화 = productCategoryRepository.findByName("위/소화").orElseThrow();
        ProductCategory 눈건강 = productCategoryRepository.findByName("눈 건강").orElseThrow();
        ProductCategory 면역력 = productCategoryRepository.findByName("면역력").orElseThrow();
        ProductCategory 빈혈 = productCategoryRepository.findByName("빈혈").orElseThrow();
        ProductCategory 수면 = productCategoryRepository.findByName("수면").orElseThrow();
        ProductCategory 모발두피 = productCategoryRepository.findByName("모발/두피").orElseThrow();
        ProductCategory 만성질환 = productCategoryRepository.findByName("만성질환").orElseThrow();

        // 성분 조회
        ProductIngredient 감마리놀렌산 = productIngredientRepository.findByIngredientName("감마리놀렌산(GLA)")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 감마리놀렌산(GLA)"));

        ProductIngredient 엽산 = productIngredientRepository.findByIngredientName("엽산")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 엽산"));

        ProductIngredient 철분 = productIngredientRepository.findByIngredientName("철분")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 철분"));

        ProductIngredient 칼슘 = productIngredientRepository.findByIngredientName("칼슘")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 칼슘"));

        ProductIngredient 비타민D = productIngredientRepository.findByIngredientName("비타민D")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민D"));

        ProductIngredient GABA = productIngredientRepository.findByIngredientName("GABA")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: GABA"));

        ProductIngredient 비타민B군 = productIngredientRepository.findByIngredientName("비타민B군")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민B군"));

        ProductIngredient 마그네슘 = productIngredientRepository.findByIngredientName("마그네슘")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 마그네슘"));

        ProductIngredient 비타민C = productIngredientRepository.findByIngredientName("비타민C")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민C"));

        ProductIngredient 코엔자임Q10 = productIngredientRepository.findByIngredientName("코엔자임Q10")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 코엔자임Q10"));

        ProductIngredient 오메가3 = productIngredientRepository.findByIngredientName("오메가-3")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 오메가-3"));

        ProductIngredient 루테인 = productIngredientRepository.findByIngredientName("루테인")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 루테인"));

        ProductIngredient 콜라겐 = productIngredientRepository.findByIngredientName("콜라겐")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 콜라겐"));

        ProductIngredient 인지질 = productIngredientRepository.findByIngredientName("인지질(PS)")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 인지질(PS)"));

        ProductIngredient 글루타민 = productIngredientRepository.findByIngredientName("글루타민")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 글루타민"));

        ProductIngredient 아연 = productIngredientRepository.findByIngredientName("아연")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 아연"));

        ProductIngredient 비오틴 = productIngredientRepository.findByIngredientName("비오틴")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비오틴"));

        ProductIngredient 쏘팔메토 = productIngredientRepository.findByIngredientName("쏘팔메토")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 쏘팔메토"));

        ProductIngredient 아르기닌 = productIngredientRepository.findByIngredientName("아르기닌")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 아르기닌"));

        ProductIngredient 구리 = productIngredientRepository.findByIngredientName("구리")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 구리"));

        ProductIngredient 크롬 = productIngredientRepository.findByIngredientName("크롬")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 크롬"));

        ProductIngredient 비타민A = productIngredientRepository.findByIngredientName("비타민A")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민A"));

        ProductIngredient 비타민B12 = productIngredientRepository.findByIngredientName("비타민B12")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민B12"));

        ProductIngredient 비타민B2 = productIngredientRepository.findByIngredientName("비타민B2")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민B2"));

        ProductIngredient 비타민B5 = productIngredientRepository.findByIngredientName("비타민B5")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민B5"));

        ProductIngredient 비타민B6 = productIngredientRepository.findByIngredientName("비타민B6")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민B6"));

        ProductIngredient 비타민E = productIngredientRepository.findByIngredientName("비타민E")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 비타민E"));

        ProductIngredient 밀크씨슬 = productIngredientRepository.findByIngredientName("밀크씨슬")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 밀크씨슬"));

        ProductIngredient 아미노산 = productIngredientRepository.findByIngredientName("아미노산")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 아미노산"));

        ProductIngredient 식이섬유 = productIngredientRepository.findByIngredientName("식이섬유")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 식이섬유"));

        ProductIngredient 전해질 = productIngredientRepository.findByIngredientName("전해질")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 전해질"));

        ProductIngredient 프로바이오틱스 = productIngredientRepository.findByIngredientName("프로바이오틱스")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 프로바이오틱스"));

        ProductIngredient 단백질 = productIngredientRepository.findByIngredientName("단백질")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 단백질"));

        ProductIngredient 종합비타민 = productIngredientRepository.findByIngredientName("종합비타민")
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found: 종합비타민"));

        List<Product> products = Arrays.asList(
                Product.builder()
                        .name("종근당 황후의봄")
                        .description("여성 건강을 위한 감마리놀렌산(GLA) 보충제")
                        .price(new BigDecimal("30000"))
                        .stock(50)
                        .active(true)
                        .categories(List.of(여성건강,피로활력,빈혈,피부))
                        .ingredients(List.of(감마리놀렌산, 비타민E, 엽산, 철분))
                        .build(),
                Product.builder()
                        .name("뉴트라라이프 보라지 오일")
                        .description("감마리놀렌산(GLA) 함유 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(40)
                        .active(true)
                        .categories(List.of(여성건강,다이어트,피로활력,간건강,장건강,위소화,빈혈,피부))
                        .ingredients(List.of(감마리놀렌산, 비타민B6, 비타민B군))
                        .build(),
                Product.builder()
                        .name("솔가 엽산 400mcg")
                        .description("여성 건강과 임신 준비를 위한 엽산 보충제")
                        .price(new BigDecimal("15000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(여성건강,피로활력,빈혈))
                        .ingredients(List.of(엽산, 비타민B12, 철분))
                        .build(),
                Product.builder()
                        .name("페로글로빈 철분 시럽")
                        .description("빈혈 예방을 위한 철분 보충제")
                        .price(new BigDecimal("20000"))
                        .stock(60)
                        .active(true)
                        .categories(List.of(빈혈,구강관리,피부,노화항산화,면역력,여성건강,피로활력))
                        .ingredients(List.of(철분, 비타민C, 엽산))
                        .build(),
                Product.builder()
                        .name("센트룸 칼슘+D3")
                        .description("뼈 건강을 위한 칼슘과 비타민D 보충제")
                        .price(new BigDecimal("22000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(관절뼈,다이어트,마음건강,피로활력,수면,면역력,만성질환))
                        .ingredients(List.of(칼슘, 비타민D, 마그네슘, 비타민A))
                        .build(),
                Product.builder()
                        .name("나우푸드 GABA 500mg")
                        .description("긴장 완화와 숙면을 위한 GABA 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(수면,관절뼈,다이어트,마음건강,피로활력,여성건강))
                        .ingredients(List.of(GABA, 마그네슘, 비타민B6))
                        .build(),
                Product.builder()
                        .name("솔가 비타민 B6 100mg")
                        .description("PMS 및 신경 건강을 위한 비타민 B6 보충제")
                        .price(new BigDecimal("16000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(여성건강, 피로활력,다이어트,간건강,장건강,위소화,빈혈,관절뼈,마음건강,수면))
                        .ingredients(List.of(비타민B군, 비타민B6, 마그네슘))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 고흡수 마그네슘")
                        .description("근육 이완과 신경 안정에 도움을 주는 마그네슘")
                        .price(new BigDecimal("24000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(수면, 관절뼈,다이어트,마음건강,피로활력,면역력,만성질환))
                        .ingredients(List.of(마그네슘, 칼슘, 비타민D))
                        .build(),
                Product.builder()
                        .name("얼라이브 비타민 C 1000mg")
                        .description("면역력 향상과 항산화 효과를 위한 비타민 C")
                        .price(new BigDecimal("18000"))
                        .stock(150)
                        .active(true)
                        .categories(List.of(구강관리, 면역력,피부,노화항산화,위소화,모발두피))
                        .ingredients(List.of(비타민C, 아연, 프로바이오틱스))
                        .build(),
                Product.builder()
                        .name("나우푸드 CoQ10 100mg")
                        .description("항산화 및 심혈관 건강을 위한 CoQ10 보충제")
                        .price(new BigDecimal("29000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(마음건강,노화항산화,간건강,눈건강,만성질환,구강관리,피로활력))
                        .ingredients(List.of(코엔자임Q10, 오메가3, 비타민E))
                        .build(),
                Product.builder()
                        .name("네이처메이드 오메가-3")
                        .description("심혈관 건강을 위한 고순도 오메가-3")
                        .price(new BigDecimal("31000"))
                        .stock(85)
                        .active(true)
                        .categories(List.of(마음건강,노화항산화,간건강,눈건강,만성질환,관절뼈,면역력))
                        .ingredients(List.of(오메가3, 비타민D, 밀크씨슬))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 루테인")
                        .description("눈 건강을 위한 루테인 보충제")
                        .price(new BigDecimal("22000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(눈건강,노화항산화))
                        .ingredients(List.of(루테인, 비타민A, 아미노산))
                        .build(),
                Product.builder()
                        .name("네오셀 슈퍼 콜라겐+C")
                        .description("피부 건강을 위한 콜라겐 보충제")
                        .price(new BigDecimal("33000"))
                        .stock(75)
                        .active(true)
                        .categories(List.of(피부,구강관리,노화항산화,면역력,모발두피))
                        .ingredients(List.of(콜라겐, 비타민C, 비오틴, 식이섬유))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 포스파티딜세린")
                        .description("인지력 개선을 위한 인지질 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(60)
                        .active(true)
                        .categories(List.of(만성질환,마음건강,노화항산화,간건강,눈건강))
                        .ingredients(List.of(인지질, 오메가3, 전해질))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 칼슘 마그네슘 비타민D")
                        .description("뼈 건강을 위한 필수 미네랄과 비타민D 보충제")
                        .price(new BigDecimal("32000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(관절뼈,다이어트,마음건강,피부,피로활력,위소화,면역력,수면,모발두피,만성질환))
                        .ingredients(List.of(칼슘, 마그네슘, 비타민D, 아연, 프로바이오틱스))
                        .build(),
                Product.builder()
                        .name("솔가 아연 50mg")
                        .description("면역력 강화와 피부 건강을 위한 아연 보충제")
                        .price(new BigDecimal("19000"))
                        .stock(120)
                        .active(true)
                        .categories(List.of(면역력, 피부,구강관리,노화항산화,위소화,모발두피))
                        .ingredients(List.of(아연, 비타민C, 단백질, 비타민B5))
                        .build(),
                Product.builder()
                        .name("나우푸드 글루타민 1000mg")
                        .description("장 건강과 면역력 증진을 위한 글루타민")
                        .price(new BigDecimal("25000"))
                        .stock(80)
                        .active(true)
                        .categories(List.of(장건강, 면역력,위소화))
                        .ingredients(List.of(글루타민, 프로바이오틱스, 크롬))
                        .build(),
                Product.builder()
                        .name("재로우 쏘팔메토")
                        .description("전립선과 탈모 예방을 위한 쏘팔메토 보충제")
                        .price(new BigDecimal("27000"))
                        .stock(70)
                        .active(true)
                        .categories(List.of(피부,위소화,면역력,모발두피,눈건강))
                        .ingredients(List.of(쏘팔메토, 아연, 비타민A))
                        .build(),
                Product.builder()
                        .name("NOW 아르기닌 1000mg")
                        .description("운동 능력 향상과 혈액순환 개선을 위한 아르기닌")
                        .price(new BigDecimal("26000"))
                        .stock(95)
                        .active(true)
                        .categories(List.of(피로활력,관절뼈,다이어트,마음건강,수면,모발두피))
                        .ingredients(List.of(아르기닌, 마그네슘, 비타민B2))
                        .build(),
                Product.builder()
                        .name("네이처스바운티 비오틴 5000mcg")
                        .description("모발과 손톱 건강을 위한 비오틴")
                        .price(new BigDecimal("21000"))
                        .stock(110)
                        .active(true)
                        .categories(List.of(피부,구강관리,모발두피))
                        .ingredients(List.of(비오틴, 콜라겐, 구리, 종합비타민))
                        .build()
        );

        productRepository.saveAll(products);

    }

    
//     Survey 데이터 초기화 메서드
    


    private void initializeSurveyData() throws Exception {
        // 1. 카테고리 생성
        SurveyCategory category1 = createCategory("기본 정보");
        SurveyCategory category2 = createCategory("증상·불편");
        SurveyCategory category3 = createCategory("생활 습관");

        // 카테고리별 서브카테고리 및 질문 생성
        createBasicInfoQuestions(category1);
        createSymptomsQuestions(category2);
        createLifestyleQuestions(category3);
    }

    private SurveyCategory createCategory(String name) {
        List<SurveyCategory> existingCategories = categoryRepository.findAll();
        for (SurveyCategory category : existingCategories) {
            if (category.getName().equals(name)) {
                return category;
            }
        }
        SurveyCategory category = new SurveyCategory();
        category.setName(name);
        return categoryRepository.save(category);
    }

    private SurveySubCategory createSubCategory(String name, SurveyCategory category) {
        List<SurveySubCategory> existingSubCategories = subCategoryRepository.findAll();
        for (SurveySubCategory subCategory : existingSubCategories) {
            if (subCategory.getName().equals(name) && subCategory.getCategory().equals(category)) {
                return subCategory;
            }
        }
        SurveySubCategory subCategory = new SurveySubCategory();
        subCategory.setName(name);
        subCategory.setCategory(category);
        return subCategoryRepository.save(subCategory);
    }

    private SurveyQuestion createQuestion(String text, String type, int order, SurveySubCategory subCategory) {
        List<SurveyQuestion> existingQuestions = questionRepository.findAll();
        for (SurveyQuestion question : existingQuestions) {
            if (question.getQuestionText().equals(text) && question.getSubCategory().equals(subCategory)) {
                return question;
            }
        }
        SurveyQuestion question = new SurveyQuestion();
        question.setQuestionText(text);
        question.setQuestionType(type);
        question.setQuestionOrder(order);
        question.setSubCategory(subCategory);
        question.setCategory(subCategory.getCategory());
        return questionRepository.save(question);
    }

    private void createOptions(SurveyQuestion question, List<String> optionTexts) {
        List<QuestionOption> existingOptions = optionRepository.findAll();
        for (String optionText : optionTexts) {
            boolean exists = false;
            for (QuestionOption existingOption : existingOptions) {
                if (existingOption.getOptionText().equals(optionText) && existingOption.getQuestion().equals(question)) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                QuestionOption option = new QuestionOption();
                option.setOptionText(optionText);
                option.setOptionOrder(existingOptions.size() + 1);
                option.setQuestion(question);
                optionRepository.save(option);
            }
        }
    }

    private void createBasicInfoQuestions(SurveyCategory basicInfo) {
        // 이름
        SurveySubCategory nameSubCategory = createSubCategory("이름", basicInfo);
        createQuestion("이름을 알려주세요", "TEXT", 1, nameSubCategory);

        // 성별
        SurveySubCategory genderSubCategory = createSubCategory("성별", basicInfo);
        SurveyQuestion genderQ = createQuestion("성별을 알려주세요", "SINGLE_CHOICE", 1, genderSubCategory);
        createOptions(genderQ, Arrays.asList("여성", "남성"));

        // 나이
        SurveySubCategory ageSubCategory = createSubCategory("나이", basicInfo);
        createQuestion("나이를 알려주세요", "TEXT", 1, ageSubCategory);

        // 키
        SurveySubCategory heightSubCategory = createSubCategory("키", basicInfo);
        createQuestion("키를 알려주세요", "TEXT", 1, heightSubCategory);

        // 몸무게
        SurveySubCategory weightSubCategory = createSubCategory("몸무게", basicInfo);
        createQuestion("몸무게를 알려주세요", "TEXT", 1, weightSubCategory);
    }

    private void createSymptomsQuestions(SurveyCategory symptoms) {
        // 주요 증상
        SurveySubCategory mainSymptoms = createSubCategory("주요 증상", symptoms);
        SurveyQuestion mainSymptomsQ = createQuestion(
                "불편하거나 걱정되는 것을 최대 3가지 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                mainSymptoms
        );
        createOptions(mainSymptomsQ, Arrays.asList(
                "혈관·혈액순환",
                "소화·장",
                "피부",
                "눈",
                "두뇌 활동",
                "피로감",
                "뼈·관절",
                "면역",
                "모발",
                "선택할 것이 없어요"
        ));

        createBloodCirculationQuestions(symptoms);
        createDigestionQuestions(symptoms);
        createSkinQuestions(symptoms);
        createEyeQuestions(symptoms);
        createBrainActivityQuestions(symptoms);
        createFatigueQuestions(symptoms);
        createBoneJointQuestions(symptoms);
        createImmuneQuestions(symptoms);
        createHairQuestions(symptoms);
        createAdditionalSymptomsQuestions(symptoms);
    }

    private void createBloodCirculationQuestions(SurveyCategory symptoms) {
        SurveySubCategory bloodCirculation = createSubCategory("혈관·혈액순환", symptoms);
        SurveyQuestion q = createQuestion(
                "혈관 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                bloodCirculation
        );
        createOptions(q, Arrays.asList(
                "상처가 잘 낫지 않아요",
                "손발 끝이 자주 저려요",
                "잇몸이 붓고 피가 나요",
                "얼굴이 자주 창백해져요",
                "선택할 것은 없지만 혈관·혈액순환이 걱정돼요"
        ));
    }

    private void createDigestionQuestions(SurveyCategory symptoms) {
        SurveySubCategory digestion = createSubCategory("소화·장", symptoms);
        SurveyQuestion q = createQuestion(
                "소화·장 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                digestion
        );
        createOptions(q, Arrays.asList(
                "복통이나 속 쓰림이 자주 발생해요",
                "변비가 있어요",
                "변이 묽은 편이에요",
                "술을 마시면 얼굴이나 몸이 붉어지고 소화가 안 돼요",
                "잔뇨감이 있어요",
                "선택할 것은 없지만 소화력 개선이 필요해요"
        ));
    }

    private void createSkinQuestions(SurveyCategory symptoms) {
        SurveySubCategory skin = createSubCategory("피부", symptoms);
        SurveyQuestion q = createQuestion(
                "피부 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                skin
        );
        createOptions(q, Arrays.asList(
                "피부가 건조하고 머리에 비듬이 많이 생겨요",
                "여드름이 많아서 걱정이에요",
                "피부에 염증이 자주 생겨요",
                "입안이 헐고 입술이 자주 갈라져요",
                "선택할 것은 없지만 피부건강이 걱정돼요"
        ));
    }

    private void createEyeQuestions(SurveyCategory symptoms) {
        SurveySubCategory eye = createSubCategory("눈", symptoms);
        SurveyQuestion q = createQuestion(
                "눈 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                eye
        );
        createOptions(q, Arrays.asList(
                "눈이 건조해 뻑뻑하고 가려워요",
                "눈 주변이 떨려요",
                "핸드폰, 모니터를 본 후 시야가 흐릿해요",
                "어두워지면 시력이 저하돼요",
                "선택할 것은 없지만 눈 건강이 걱정돼요"
        ));
    }

    private void createBrainActivityQuestions(SurveyCategory symptoms) {
        SurveySubCategory brain = createSubCategory("두뇌 활동", symptoms);
        SurveyQuestion q = createQuestion(
                "두뇌 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                brain
        );
        createOptions(q, Arrays.asList(
                "기억력이 떨어지는 것 같아요",
                "두통이 자주 생겨요",
                "불안이나 긴장을 자주 느껴요",
                "우울한 감정을 자주 느껴요",
                "귀에서 울리는 소리가 가끔 나요",
                "선택할 것은 없지만 두뇌 활동이 걱정돼요"
        ));
    }

    private void createFatigueQuestions(SurveyCategory symptoms) {
        SurveySubCategory fatigue = createSubCategory("피로감", symptoms);
        SurveyQuestion q = createQuestion(
                "피로감에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                fatigue
        );
        createOptions(q, Arrays.asList(
                "무기력하고 식욕이 없어요",
                "자고 일어나도 피곤해요",
                "신경이 예민하고 잠을 잘 이루지 못해요",
                "잠을 잘 자요",
                "소변을 보기 위해 잠을 깨요",
                "선택할 것은 없지만 피로감이 있어요"
        ));
    }

    private void createBoneJointQuestions(SurveyCategory symptoms) {
        SurveySubCategory boneJoint = createSubCategory("뼈·관절", symptoms);
        SurveyQuestion q = createQuestion(
                "뼈·관절 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                boneJoint
        );
        createOptions(q, Arrays.asList(
                "뼈가 부러진 경험이 있어요",
                "뼈가 약하다고 느껴요",
                "최근 1년 중 스테로이드를 섭취한 기간이 3개월 이상이에요",
                "선택할 것은 없지만 뼈·관절이 걱정돼요"
        ));
    }

    private void createImmuneQuestions(SurveyCategory symptoms) {
        SurveySubCategory immune = createSubCategory("면역", symptoms);
        SurveyQuestion q = createQuestion(
                "면역 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                immune
        );
        createOptions(q, Arrays.asList(
                "스트레스가 매우 많아요",
                "감염성 질환에 자주 걸려요",
                "선택할 것은 없지만 면역이 걱정돼요"
        ));
    }

    private void createHairQuestions(SurveyCategory symptoms) {
        SurveySubCategory hair = createSubCategory("모발", symptoms);
        SurveyQuestion q = createQuestion(
                "모발 건강에 해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                hair
        );
        createOptions(q, Arrays.asList(
                "머리카락에 힘이 없고 잘 빠져요",
                "머리카락이 윤기 없고 갈라지고 끊어져요",
                "새치가 많이 나요",
                "선택할 것은 없지만 모발 건강이 걱정돼요"
        ));
    }

    private void createAdditionalSymptomsQuestions(SurveyCategory symptoms) {
        SurveySubCategory additionalSymptoms = createSubCategory("추가 증상", symptoms);
        SurveyQuestion q = createQuestion(
                "해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                additionalSymptoms
        );
        createOptions(q, Arrays.asList(
                "혈압이 높아요",
                "혈압이 낮아요",
                "더위를 타고 땀을 많이 흘려요",
                "항응고제를 복용 중이에요",
                "알레르기가 있어요",
                "해당사항 없음"
        ));
    }

    private void createLifestyleQuestions(SurveyCategory lifestyle) {
        createExerciseQuestions(lifestyle);
        createDietQuestions(lifestyle);
        createPreferencesQuestions(lifestyle);
        createPatternsQuestions(lifestyle);
        createFamilyHistoryQuestions(lifestyle);
        createFemaleHealthQuestions(lifestyle);
        createMaleHealthQuestions(lifestyle);
    }

    private void createExerciseQuestions(SurveyCategory lifestyle) {
        // 운동 빈도
        SurveySubCategory exerciseFrequency = createSubCategory("운동 빈도", lifestyle);
        SurveyQuestion exerciseQ1 = createQuestion(
                "운동은 얼마나 자주 하시나요?",
                "SINGLE_CHOICE",
                1,
                exerciseFrequency
        );
        createOptions(exerciseQ1, Arrays.asList(
                "주 4회 이상",
                "주 2~3회",
                "주 1회 이하"
        ));

        // 야외활동 시간
        SurveySubCategory outdoorActivity = createSubCategory("야외활동 시간", lifestyle);
        SurveyQuestion exerciseQ2 = createQuestion(
                "햇빛을 쬐는 야외활동을 하루에 얼마나 하나요?",
                "SINGLE_CHOICE",
                1,
                outdoorActivity
        );
        createOptions(exerciseQ2, Arrays.asList(
                "4시간 이상",
                "1~4시간",
                "1시간 이하"
        ));
    }

    private void createDietQuestions(SurveyCategory lifestyle) {
        SurveySubCategory diet = createSubCategory("식습관", lifestyle);
        SurveyQuestion q = createQuestion(
                "해당하는 식습관을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                diet
        );
        createOptions(q, Arrays.asList(
                "생선을 자주 먹어요",
                "채소를 자주 먹어요",
                "과일을 자주 먹어요",
                "고기를 자주 먹어요",
                "단 음식을 자주 먹어요",
                "식사를 자주 걸러요",
                "선택할 것이 없어요"
        ));
    }

    private void createPreferencesQuestions(SurveyCategory lifestyle) {
        SurveySubCategory preferences = createSubCategory("기호식품", lifestyle);
        SurveyQuestion q = createQuestion(
                "해당하는 기호식품 섭취 습관을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                preferences
        );
        createOptions(q, Arrays.asList(
                "담배를 피워요",
                "커피를 마셔요",
                "물을 잘 안 마셔요",
                "인스턴트 음식을 자주 먹어요",
                "선택할 것이 없어요"
        ));
    }

    private void createPatternsQuestions(SurveyCategory lifestyle) {
        SurveySubCategory patterns = createSubCategory("생활 패턴", lifestyle);
        SurveyQuestion q = createQuestion(
                "해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                patterns
        );
        createOptions(q, Arrays.asList(
                "업무, 학업 강도가 높아요",
                "핸드폰, 모니터를 오래 봐요",
                "목이 자주 건조하거나 칼칼해요",
                "집중력이 필요한 시기예요",
                "식사량을 줄이는 다이어트 중이에요",
                "구내염이 자주 생겨요",
                "선택할 것이 없어요"
        ));
    }

    private void createFamilyHistoryQuestions(SurveyCategory lifestyle) {
        SurveySubCategory family = createSubCategory("가족력", lifestyle);
        SurveyQuestion q = createQuestion(
                "가족력을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                family
        );
        createOptions(q, Arrays.asList(
                "간 질환이 있어요",
                "혈관 질환이 있어요",
                "뼈·관절 질환이 있어요",
                "당뇨가 있어요",
                "가족력이 없어요"
        ));
    }

    private void createFemaleHealthQuestions(SurveyCategory lifestyle) {
        SurveySubCategory femaleHealth = createSubCategory("여성건강", lifestyle);
        SurveyQuestion q = createQuestion(
                "해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                femaleHealth
        );
        createOptions(q, Arrays.asList(
                "임신, 수유 중이에요",
                "생리전 증후군, 유방 통증이 있어요",
                "요로감염, 잔뇨감과 같은 비뇨기계 질환이 있거나 걱정돼요",
                "생리 전후로 우울하거나 예민해요",
                "부정 출혈이 월 1회 이상 나타나요",
                "선택할 것이 없어요"
        ));
    }

    private void createMaleHealthQuestions(SurveyCategory lifestyle) {
        SurveySubCategory maleHealth = createSubCategory("남성건강", lifestyle);
        SurveyQuestion q = createQuestion(
                "해당하는 것을 모두 선택하세요",
                "MULTIPLE_CHOICE",
                1,
                maleHealth
        );
        createOptions(q, Arrays.asList(
                "남성 가족 중 비뇨기계 질환이 있어요",
                "이유 불문 머리가 빠지고 머리숱이 적어졌어요",
                "남성 불임에 대한 불안감이 있거나 2세 계획이 지연되고 있어요",
                "선택할 것이 없어요"
        ));
    }


//      Board 데이터 초기화 메서드
     


    private void initializeBoardData() {
        if (boardRepository.count() > 0) {
            System.out.println("✅ Board 데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        Board noticeBoard = Board.builder().name("공지사항").description("필루션 공지사항 게시판입니다.").build();
        Board faqBoard = Board.builder().name("자주 묻는 질문").description("자주 묻는 질문을 정리한 게시판입니다.").build();

        boardRepository.saveAll(List.of(noticeBoard, faqBoard));
        System.out.println("✅ Board 데이터 초기화 완료");
    }

    private void initializePosts() {
        if (postRepository.count() > 0) {
            System.out.println("✅ Post 데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        Optional<Member> adminMember = memberRepository.findById(1L);
        if (adminMember.isEmpty()) {
            System.out.println("❌ 관리자 회원이 존재하지 않습니다. 초기화를 중단합니다.");
            return;
        }

        List<Board> boards = boardRepository.findAll();
        Board noticeBoard = boards.stream().filter(b -> b.getName().equals("공지사항")).findFirst().orElseThrow();
        Board faqBoard = boards.stream().filter(b -> b.getName().equals("자주 묻는 질문")).findFirst().orElseThrow();

        List<Post> posts = List.of(
                // ✅ 공지사항 4개 하드코딩 함 ㅠㅠ
                createPost(adminMember.get().getId(), noticeBoard, "필루션 이용약관 및 개인정보처리방침 변경 안내",
                        "안녕하세요.\n필루션 고객님에게 깊은 감사를 드립니다.\n\n보다 나은 서비스를 제공하고 명확한 이용을 위해 필루션 이용약관과 개인정보처리방침이 개정 되었습니다.﻿\n\n"
                                + "서비스 이용에 참고하여 주시기 바랍니다.\n\n"
                                + "1. 주요 내용\n\n"
                                + "- 서비스이용약관\n"
                                + "  : 적립금 제도 운영 조항 추가\n"
                                + "  : 개인정보처리방침의 개정법 적용에 따른 수정\n"
                                + "- 개인정보처리방침\n"
                                + "  : 개인정보보호법 개정에 따른 법령명 수정\n\n"
                                + "2. 시행일자\n"
                                + "- 개정 약관 공지일: 2025년 1월 20일 (월)\n"
                                + "- 개정 약관 적용일: 2025년 1월 27일 (월)\n\n"
                                + "필루션은 고객님의 건강을 위해 항상 최선을 다하겠습니다.\n감사합니다.", "공지사항"),

                createPost(adminMember.get().getId(), noticeBoard, "사이트 점검 안내",
                        "필루션 웹사이트 정기 점검이 있을 예정입니다. (2025년 1월 31일 00:00 ~ 06:00)\n"
                                + "점검 시간 내에 웹사이트 서비스가 중단되오니\n고객 여러분의 양해를 부탁드립니다.\n감사합니다.", "공지사항"),

                createPost(adminMember.get().getId(), noticeBoard, "2025년 설 연휴 배송 및 휴무 일정 안내",
                        "안녕하세요.\n필루션입니다.\n\n"
                                + "긴 연휴로 영양제 배송이 늦어질 수 있어 안내드립니다."
                                + "■[배송 일정 공지]\n"
                                + "1월23일(목) 12시 결제 건까지 당일 출고되며, 이후 결제 건은 1월 31일(금)부터 순차 배송됩니다.\n\n"
                                + "[고객센터 휴무]\n"
                                + "필루션 고객센터는 1월 27일(월) ~ 1월 30일(목) 휴무입니다.\n"
                                + "문의 남겨 주시면 1월 31일(금) 오전 10시 부터 순차적으로 안내 도와 드리겠습니다.\n"
                                + "평온한 설 연휴 보내시길 기원합니다.\n\n"
                                + "건강하고 즐거운 설 연휴 보내세요 :)", "공지사항"),

                createPost(adminMember.get().getId(), noticeBoard, "필루션 회원 가입 시 추가 혜택 안내",
                        "안녕하세요, 필루션입니다.\n\n"
                                + "회원 가입을 통해 더 많은 혜택을 누려보세요! 필루션에서 제공하는 다양한 혜택을 회원 전용으로 누리실 수 있습니다.\n\n"
                                + "■ 회원 가입 시 제공되는 혜택:\n\n"
                                + "월간 적립금 1,000원 자동 적립\n"
                                + "신제품 출시 정보 및 이벤트 우선 안내\n"
                                + "회원 가입 기간: 2025년 2월 1일(토) ~ 2025년 2월 28일(금)\n\n"
                                + "회원 가입 후, 필루션의 다양한 서비스를 편리하게 이용하시기 바랍니다.\n"
                                + "감사합니다.\n\n"
                                + "필루션 드림\n", "공지사항"),

                // ✅ 자주 묻는 질문 11개
                createPost(adminMember.get().getId(), faqBoard, "건강설문 받은 제품만 구매할 수 있나요?",
                        "건강 설문 추천 제품 외에 제품 추가나 제거를 통해 변경하실 수 있어요.", "기타"),

                createPost(adminMember.get().getId(), faqBoard, "필루션 영양제와 다른 영양제를 함께 먹어도 될까요?",
                        "정확한 상담을 위해서는 드시고 계신 타사 영양제의 성분을 알기 위해 품명을 알아야 해요.\n"
                                + "품명과 함께 필루션 상담원에게 문의하시면 빠르고 정확하게 답변을 드릴게요.", "제품"),

                createPost(adminMember.get().getId(), faqBoard, "결제 취소는 어떻게 하나요?",
                        "주문 상태가 배송 전으로 표시되는 경우\n"
                                + "-> 결제일 당일 12시(정오) 이전\n"
                                + "홈페이지 -> 마이페이지 -> 결제관리에서 언제든 주문 취소가 가능해요.\n\n"
                                + "주문 상태가 배송 중 또는 배송 완료인 경우\n"
                                + "-> 결제일 당일 12시(정오) 이후\n"
                                + "필루션 상담원 채팅 상담을 통해 교환 및 반품 접수를 해주셔야 돼요.\n"
                                + "(위의 경우 및 배송 완료 후 취소의 경우에는 취소 수수료가 발생할 수 있어요)\n\n"
                                + "주문 취소가 된 건은 결제 수단에 따라 영업일 기준으로 3일~7일 이내에 승인 취소 또는 환불 처리를 해드려요.\n"
                                + "(결제 취소 시에는 해당 결제를 통해 제공된 혜택이 공제된 후에 제공돼요)", "교환/반품"),

                createPost(adminMember.get().getId(), faqBoard, "배송 조회는 어떻게 하나요?",
                        "정기구독으로 구매하신 경우\n"
                                + "홈페이지 -> 마이페이지 -> 결제관리 -> 해당 결제건 클릭 -> 운송장 번호 클릭\n\n"
                                + "비회원으로 한 번만 구매하기를 하신 경우\n"
                                + "홈페이지 -> 고객센터 -> 비회원 주문 -> 주문번호 또는 연락처 입력, 주문 확인 비밀번호 입력 -> 운송장 번호 클릭", "배송"),

                createPost(adminMember.get().getId(), faqBoard, "정기구독을 잠시 중단할 수 있나요?",
                        "정기구독 중단 기능은 없어요. 다만 최대 3개월까지 정기구독 결제일을 연기하실 수 있어요.\n"
                                + "홈페이지 -> 마이페이지 -> 정기구독에서 결제일 변경 또는 상담원 채팅을 통해 변경하실 수 있어요.\n"
                                + "※ 결제 2일 전에 결제 예정 알림을 드리니 안심하셔도 돼요.", "주문/결제"),

                createPost(adminMember.get().getId(), faqBoard, "정기구독 제품을 변경할 수 있나요?",
                        "정기구독 제품을 추가 또는 제거하실 수 있어요.\n\n"
                                + "제품 추가\n"
                                + "홈페이지 -> 마이페이지 -> 정기구독 -> 상품정보 -> 수정하기 -> 제품 추가하기 -> 상품정보 저장하기\n\n"
                                + "제품 제거\n"
                                + "홈페이지 -> 마이페이지 -> 정기구독 -> 상품정보 -> 수정하기 -> 제품 우측 x 표시 클릭 -> 상품정보 저장하기", "주문/결제"),

                createPost(adminMember.get().getId(), faqBoard, "비회원으로 정기구독을 할 수 없나요?",
                        "비회원으로는 정기구독을 하실 수 없으며 한 번만 구매하기를 통해 일회성으로 구매하실 수 있어요.", "주문/결제"),

                createPost(adminMember.get().getId(), faqBoard, "비밀번호가 생각나지 않아요.",
                        "필루션 홈페이지에서 회원가입하신 경우\n"
                                + "홈페이지 -> 로그인 -> 비밀번호 찾기\n\n"
                                + "SNS 계정으로 가입하신 경우(네이버, 카카오 등)\n"
                                + "가입하신 SNS를 통해 찾으셔야 돼요.\n"
                                + "상담원을 통해 가입 아이디만 알려드릴 수 있어요.", "회원정보"),

                createPost(adminMember.get().getId(), faqBoard, "회원정보 변경은 어떻게 하나요?",
                        "가입하신 회원정보 변경을 원하시는 경우\n"
                                + "홈페이지 -> 마이페이지 -> 회원관리에서 수정하실 수 있어요.\n\n"
                                + "계정에 등록된 연락처 변경 혹은 아이디 변경은\n"
                                + "상담원을 통해 요청하실 수 있어요.", "회원정보"),

                createPost(adminMember.get().getId(), faqBoard, "제품을 교환/반품하고 싶어요.",
                        "교환 및 반품의 경우 필루션 상담원을 통해 접수가 가능하며 아래의 교환 및 반품 규정에 따라 진행돼요.\n"
                                + "(필요 시 제품의 상태 이미지 첨부 필요)\n\n"
                                + "수령한 제품에 문제가 있는 경우\n"
                                + "제품이 표시 및 광고된 내용과 다르거나 제품 자체에 하자가 있는 경우에는 재배송 또는 환불 처리를 해드려요.\n"
                                + "제품을 받으시고 제품의 문제를 확인 가능한 사진을 첨부해서 필루션 상담원에게 전송 부탁드려요.\n"
                                + "제품에 문제가 있는 것으로 확인될 경우 모든 배송비는 필루션이 부담해요.\n\n"
                                + "고객님의 변심 또는 주문 오류가 있는 경우\n"
                                + "제품의 상태에 문제가 없는 경우에는 제품을 받으신 날부터 7일 이내에 교환 및 반품 신청이 가능해요.\n"
                                + "단순 변심에 의한 교환 및 반품을 요청하신 경우 제품 발송을 위한 배송비와 반품을 위한 배송비가 부담돼요.\n"
                                + "(필루션 정기구독의 경우 배송비 무료로 제공이 되나 본 경우에는 발송 배송비와 반품 배송비를 포함하여 5,000원을 부담하셔야 해요)\n"
                                + "제품에 따라 도서/산간지역의 경우 배송비가 추가될 수 있어요.\n\n"
                                + "교환 및 반품 불가 안내\n"
                                + "아래와 같은 사항에는 교환 및 반품이 어려울 수 있으니 양해 부탁드려요.\n"
                                + "- 고객님의 책임으로 제품이 훼손된 경우 (제품 박스의 스티커를 제거한 경우 포함)\n"
                                + "- 고객님의 사용으로 제품의 가치가 현저하게 감소한 경우", "교환/반품"),

                createPost(adminMember.get().getId(), faqBoard, "정기구독과 한 번만 구매하기의 차이가 무엇인가요?",
                        "정기구독이란?\n"
                                + "매월(30일 기준) 영양제가 소진되기 전에 정기적으로 배송되는 서비스에요.\n"
                                + "필루션은 고객님들의 건강을 지켜드리기 위해 꾸준히 영양성분을 섭취하는 것이 매우 중요하다고 생각하고 있어요.\n"
                                + "그래서 따로 신경 쓰지 않아도 정기적으로 배송이 되는 배송 서비스를 제공해 드려요.\n\n"
                                + "한 번만 구매하기란?\n"
                                + "일회성으로 제품을 낱개로 구매하실 수 있어요.\n"
                                + "(다만, 배송비가 추가돼요)", "주문/결제")

        );

        postRepository.saveAll(posts);
        System.out.println("✅ Post 데이터 초기화 완료");
    }

    private Post createPost(Long authorId, Board board, String title, String content, String category) {
        return Post.builder()
                .authorId(authorId)
                .board(board)
                .title(title)
                .content(content)
                .category(category)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }



//      구독 DataInitializer
     


    private void initializeSubscriptionData() {
        // ✅ 2명의 회원 조회 (자동으로 가져오기)
        List<Member> members = memberRepository.findAll();
        if (members.size() < 2) {
            System.out.println("❌ 최소 2명의 회원이 필요합니다. 초기화를 중단합니다.");
            return;
        }

        Member member1 = members.get(0);
        Member member2 = members.get(1);

        // ✅ 기존 상품 4개 조회
        List<Product> products = productRepository.findAll();
        if (products.size() < 4) {
            System.out.println("❌ 최소 4개의 제품이 필요합니다. 초기화를 중단합니다.");
            return;
        }

        Product productA = products.get(0);
        Product productB = products.get(1);
        Product productC = products.get(2);
        Product productD = products.get(3);


        // ✅ 날짜 설정
        LocalDate twoMonthsAgo = LocalDate.now().minusMonths(2); // 2달 전
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);  // 1달 전
        LocalDate today = LocalDate.now();  // 오늘

        // ✅ 1회차(지난 구독) 생성 (paymentMethod = 카드, nextPaymentMethod = 네이버페이)
        Subscription pastSubscription1 = createSubscription(member1, 1, "EXPIRED", LocalDate.now().minusMonths(2), LocalDate.now().minusMonths(2), "naverpay");
        Subscription pastSubscription2 = createSubscription(member2, 1, "EXPIRED", LocalDate.now().minusMonths(2), LocalDate.now().minusMonths(2), "naverpay");

        // ✅ 2회차(현재 구독) 생성 (paymentMethod = 1회차 nextPaymentMethod(네이버페이), nextPaymentMethod = 카카오페이)
        Subscription currentSubscription1 = createSubscription(member1, 2, "ACTIVE", pastSubscription1.getStartDate(), LocalDate.now().minusMonths(1), pastSubscription1.getNextPaymentMethod());
        Subscription currentSubscription2 = createSubscription(member2, 2, "ACTIVE", pastSubscription2.getStartDate(), LocalDate.now().minusMonths(1), pastSubscription2.getNextPaymentMethod());

        // ✅ 구독 데이터 저장
        subscriptionRepository.saveAll(List.of(pastSubscription1, pastSubscription2, currentSubscription1, currentSubscription2));

        // ✅ 구독 아이템 추가 (과거 구독)
        createSubscriptionItem(pastSubscription1, productA, 2, 30000);
        createSubscriptionItem(pastSubscription1, productB, 1, 20000);
        createSubscriptionItem(pastSubscription2, productC, 2, 35000);
        createSubscriptionItem(pastSubscription2, productD, 1, 22000);

        // ✅ 구독 아이템 추가 (현재 구독)
        createSubscriptionItem(currentSubscription1, productA, 3, 45000);
        createSubscriptionItem(currentSubscription1, productB, 2, 40000);
        createSubscriptionItem(currentSubscription2, productC, 3, 52000);
        createSubscriptionItem(currentSubscription2, productD, 2, 46000);

        // ✅ 다음 회차 구독 아이템 추가 (현재 구독)
        createSubscriptionNextItem(currentSubscription1, productC, 2, 35000);
        createSubscriptionNextItem(currentSubscription1, productD, 1, 25000);
        createSubscriptionNextItem(currentSubscription2, productA, 2, 32000);
        createSubscriptionNextItem(currentSubscription2, productB, 3, 48000);

        // ✅ 지난 구독(`EXPIRED`)도 `SubscriptionNextItem`에 추가
        createSubscriptionNextItem(pastSubscription1, productA, 2, 28000);
        createSubscriptionNextItem(pastSubscription1, productB, 1, 19000);
        createSubscriptionNextItem(pastSubscription2, productC, 2, 34000);
        createSubscriptionNextItem(pastSubscription2, productD, 1, 21000);
    }
//
//
//      ✅ 구독 생성 메서드
//      @param member       구독 사용자
//      @param cycle        현재 회차
//      @param status       구독 상태 (ACTIVE / EXPIRED)
//      @param startDate    최초 구독 시작일
//      @param lastBillingDate 최근 결제일 (lastBillingDate)
//      @return 생성된 Subscription 객체
//

    private Subscription createSubscription(Member member, int cycle, String status, LocalDate startDate, LocalDate lastBillingDate, String prevNextPaymentMethod) {
        return Subscription.builder()
                .member(member)
                .startDate(startDate) // 1회차 구독 시작일 유지
                .lastBillingDate(lastBillingDate) // 라스트 빌링 날짜 설정
                .nextBillingDate(lastBillingDate.plusMonths(1)) // ✅ lastBillingDate 기준 +1달
                .currentCycle(cycle) // 현재 회차 설정
                .paymentMethod(cycle == 1 ? "card" : prevNextPaymentMethod) // ✅ 1회차는 카드, 이후는 이전 구독의 nextPaymentMethod 사용
                .nextPaymentMethod(cycle == 1 ? "naverpay" : "kakaopay") // ✅ 1회차는 네이버페이, 이후는 카카오페이
                .roadAddress(member.getId() % 2 == 0 ? "서울 강남구 테헤란로 123" : "부산 해운대구 해변로 456") // ✅ 회원별 주소 구분
                .detailAddress(member.getId() % 2 == 0 ? "10층 1001호" : "20층 2002호")
                .status(status) // 상태 설정 (ACTIVE, EXPIRED)
                .build();
    }

    private void createSubscriptionItem(Subscription subscription, Product product, int quantity, double price) {
        SubscriptionItem item = SubscriptionItem.builder()
                .subscription(subscription)
                .product(product)
                .quantity(quantity)
                .price(price)
                .build();
        subscriptionItemRepository.save(item);
    }

    private void createSubscriptionNextItem(Subscription subscription, Product product, int quantity, double price) {
        SubscriptionNextItem nextItem = SubscriptionNextItem.builder()
                .subscription(subscription)
                .product(product)
                .nextMonthQuantity(quantity)
                .nextMonthPrice(price)
                .build();
        subscriptionNextItemRepository.save(nextItem);
    }
}
*/
