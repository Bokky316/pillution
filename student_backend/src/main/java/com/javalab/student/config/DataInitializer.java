/*


package com.javalab.student.config;

import com.javalab.student.entity.*;
import com.javalab.student.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductCategory;
import com.javalab.student.entity.ProductCategoryMapping;
import com.javalab.student.repository.ProductCategoryMappingRepository;
import com.javalab.student.repository.ProductCategoryRepository;
import com.javalab.student.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;


@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductRepository productRepository;
    private final ProductCategoryMappingRepository productCategoryMappingRepository;
    private final SurveyCategoryRepository categoryRepository;
    private final SurveySubCategoryRepository subCategoryRepository;
    private final SurveyQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. 카테고리 생성
        SurveyCategory category1 = createCategory("1. 기본 정보");
        SurveyCategory category2 = createCategory("2. 증상·불편");
        SurveyCategory category3 = createCategory("3. 생활 습관");

        // 카테고리별 서브카테고리 및 질문 생성
        createBasicInfoQuestions(category1);
        createSymptomsQuestions(category2);
        createLifestyleQuestions(category3);

        initializeProductCategories();
        initializeProducts();
        initializeProductCategoryMappings();
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
        // 개인정보
        SurveySubCategory personalInfo = createSubCategory("개인정보", basicInfo);

        createQuestion("이름을 알려주세요", "TEXT", 1, personalInfo);

        SurveyQuestion genderQ = createQuestion("성별을 알려주세요", "SINGLE_CHOICE", 2, personalInfo);
        createOptions(genderQ, Arrays.asList("여성", "남성"));

        createQuestion("나이를 알려주세요", "TEXT", 3, personalInfo);
        createQuestion("키를 알려주세요", "TEXT", 4, personalInfo);
        createQuestion("몸무게를 알려주세요", "TEXT", 5, personalInfo);
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
        SurveySubCategory exercise = createSubCategory("운동 및 야외활동", lifestyle);

        SurveyQuestion exerciseQ1 = createQuestion(
                "운동은 얼마나 자주 하시나요?",
                "SINGLE_CHOICE",
                1,
                exercise
        );
        createOptions(exerciseQ1, Arrays.asList(
                "주 4회 이상",
                "주 2~3회",
                "주 1회 이하"
        ));

        SurveyQuestion exerciseQ2 = createQuestion(
                "햇빛을 쬐는 야외활동을 하루에 얼마나 하나요?",
                "SINGLE_CHOICE",
                2,
                exercise
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


    private void initializeProductCategories() {
        List<String> categories = Arrays.asList(
                "여성 건강/PMS", "관절/뼈", "구강 관리", "다이어트", "마음 건강",
                "피부", "노화/항산화", "피로/활력", "간 건강", "장 건강",
                "위/소화", "눈 건강", "면역력", "빈혈", "수면",
                "모발/두피", "만성질환"
        );

        categories.forEach(category -> {
            ProductCategory productCategory = new ProductCategory();
            productCategory.setName(category);
            productCategoryRepository.save(productCategory);
        });
    }

    private void initializeProducts() {
        List<Product> products = Arrays.asList(
                Product.builder().name("종근당 황후의봄").description("여성 건강을 위한 감마리놀렌산(GLA) 보충제").price(new BigDecimal("30000")).stock(50).active(1).build(),
                Product.builder().name("뉴트라라이프 보라지 오일").description("감마리놀렌산(GLA) 함유 보충제").price(new BigDecimal("28000")).stock(40).active(1).build(),
                Product.builder().name("솔가 엽산 400mcg").description("여성 건강과 임신 준비를 위한 엽산 보충제").price(new BigDecimal("15000")).stock(100).active(1).build(),
                Product.builder().name("네이처메이드 엽산 800mcg").description("체내 엽산 보충을 위한 제품").price(new BigDecimal("17000")).stock(80).active(1).build(),
                Product.builder().name("페로글로빈 철분 시럽").description("빈혈 예방을 위한 철분 보충제").price(new BigDecimal("20000")).stock(60).active(1).build(),
                Product.builder().name("센트룸 철분 플러스").description("철분과 비타민이 포함된 영양제").price(new BigDecimal("22000")).stock(70).active(1).build(),
                Product.builder().name("네이처스웨이 크랜베리 프루트").description("비뇨기 건강을 위한 크랜베리 추출물 보충제").price(new BigDecimal("25000")).stock(50).active(1).build(),
                Product.builder().name("솔가 크랜베리 추출물").description("비뇨기 건강에 도움을 주는 크랜베리 추출물").price(new BigDecimal("26000")).stock(40).active(1).build(),
                Product.builder().name("나우푸드 GABA 500mg").description("긴장 완화와 숙면을 위한 GABA 보충제").price(new BigDecimal("28000")).stock(90).active(1).build(),
                Product.builder().name("솔가 GABA").description("스트레스 완화 및 신경 안정 보충제").price(new BigDecimal("30000")).stock(85).active(1).build(),
                Product.builder().name("솔가 비타민 B6 100mg").description("PMS 및 신경 건강을 위한 비타민 B6 보충제").price(new BigDecimal("16000")).stock(100).active(1).build(),
                Product.builder().name("네이처메이드 비타민 B6").description("건강한 신경 기능을 지원하는 보충제").price(new BigDecimal("18000")).stock(95).active(1).build(),
                Product.builder().name("센트룸 칼슘+D3").description("뼈 건강을 위한 칼슘과 비타민D 보충제").price(new BigDecimal("22000")).stock(100).active(1).build(),
                Product.builder().name("오스칼 칼슘").description("뼈와 치아 건강을 위한 칼슘 보충제").price(new BigDecimal("21000")).stock(90).active(1).build(),
                Product.builder().name("솔가 비타민 D3 1000IU").description("뼈 건강과 면역력 향상을 위한 비타민D 보충제").price(new BigDecimal("19000")).stock(110).active(1).build(),
                Product.builder().name("네이처메이드 비타민 D3 2000IU").description("체내 비타민D 보충을 위한 제품").price(new BigDecimal("20000")).stock(100).active(1).build(),
                Product.builder().name("닥터스베스트 고흡수 마그네슘").description("근육 이완과 신경 안정에 도움을 주는 마그네슘").price(new BigDecimal("24000")).stock(100).active(1).build(),
                Product.builder().name("나우푸드 마그네슘 캡슐").description("마그네슘 보충을 위한 제품").price(new BigDecimal("23000")).stock(100).active(1).build(),
                Product.builder().name("얼라이브 비타민 C 1000mg").description("면역력 향상과 항산화 효과를 위한 비타민 C").price(new BigDecimal("18000")).stock(150).active(1).build(),
                Product.builder().name("솔가 에스터-C 500mg").description("흡수가 잘되는 비타민 C 보충제").price(new BigDecimal("19000")).stock(130).active(1).build(),
                Product.builder().name("나우푸드 CoQ10 100mg").description("항산화 및 심혈관 건강을 위한 CoQ10 보충제").price(new BigDecimal("29000")).stock(90).active(1).build(),
                Product.builder().name("닥터스베스트 CoQ10").description("에너지 생산과 세포 건강을 위한 CoQ10 보충제").price(new BigDecimal("28000")).stock(80).active(1).build(),
                Product.builder().name("솔가 비타민 B2 100mg").description("구강 건강 및 에너지 대사 지원").price(new BigDecimal("16000")).stock(100).active(1).build(),
                Product.builder().name("네이처스웨이 리보플라빈").description("비타민 B2 보충을 위한 제품").price(new BigDecimal("17000")).stock(90).active(1).build(),
                Product.builder().name("솔가 비오틴 5000mcg").description("모발 건강과 피부 강화를 위한 비오틴").price(new BigDecimal("25000")).stock(70).active(1).build(),
                Product.builder().name("나우푸드 비오틴 5000mcg").description("손톱 및 모발 건강을 위한 비오틴 보충제").price(new BigDecimal("24000")).stock(75).active(1).build()
        );

        productRepository.saveAll(products);
    }


    private void initializeProductCategoryMappings() {
        List<ProductCategoryMapping> mappings = Arrays.asList(
                new ProductCategoryMapping(null, 1L, 1L),
                new ProductCategoryMapping(null, 2L, 1L),
                new ProductCategoryMapping(null, 3L, 1L),
                new ProductCategoryMapping(null, 4L, 1L),
                new ProductCategoryMapping(null, 5L, 14L),
                new ProductCategoryMapping(null, 6L, 14L),
                new ProductCategoryMapping(null, 7L, 1L),
                new ProductCategoryMapping(null, 8L, 1L),
                new ProductCategoryMapping(null, 9L, 16L),
                new ProductCategoryMapping(null, 10L, 16L),
                new ProductCategoryMapping(null, 11L, 1L),
                new ProductCategoryMapping(null, 12L, 1L),
                new ProductCategoryMapping(null, 13L, 2L),
                new ProductCategoryMapping(null, 14L, 2L),
                new ProductCategoryMapping(null, 15L, 2L),
                new ProductCategoryMapping(null, 16L, 2L),
                new ProductCategoryMapping(null, 17L, 2L),
                new ProductCategoryMapping(null, 18L, 2L),
                new ProductCategoryMapping(null, 19L, 13L),
                new ProductCategoryMapping(null, 20L, 13L),
                new ProductCategoryMapping(null, 21L, 7L),
                new ProductCategoryMapping(null, 22L, 7L),
                new ProductCategoryMapping(null, 23L, 3L),
                new ProductCategoryMapping(null, 24L, 3L),
                new ProductCategoryMapping(null, 25L, 17L),
                new ProductCategoryMapping(null, 26L, 17L)
        );

        productCategoryMappingRepository.saveAll(mappings);
    }

}



*/
