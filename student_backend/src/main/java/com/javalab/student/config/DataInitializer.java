/*


package com.javalab.student.config;

import com.javalab.student.entity.*;
import com.javalab.student.entity.healthSurvey.QuestionOption;
import com.javalab.student.entity.healthSurvey.SurveyCategory;
import com.javalab.student.entity.healthSurvey.SurveyQuestion;
import com.javalab.student.entity.healthSurvey.SurveySubCategory;
import com.javalab.student.repository.*;
import com.javalab.student.repository.healthSurvey.QuestionOptionRepository;
import com.javalab.student.repository.healthSurvey.SurveyCategoryRepository;
import com.javalab.student.repository.healthSurvey.SurveyQuestionRepository;
import com.javalab.student.repository.healthSurvey.SurveySubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.ProductCategory;
import com.javalab.student.entity.ProductIngredient;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.ProductCategoryRepository;
import com.javalab.student.repository.ProductIngredientRepository;
import org.springframework.transaction.annotation.Transactional;


@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductIngredientRepository productIngredientRepository;
    private final ProductCategoryRepository productCategoryRepository;

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
        initializeProductIngredients();
        initializeProducts();

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

    private void initializeProductIngredients() {
        List<String> ingredients = Arrays.asList(
                "오메가-3", "코엔자임Q10", "비타민B군", "비타민C", "철분",
                "아연", "마그네슘", "비오틴", "루테인", "인지질(PS)",
                "GABA", "칼슘", "비타민D", "크랜베리 추출물", "글루타민",
                "콜라겐", "엽산", "감마리놀렌산(GLA)", "쏘팔메토", "아르기닌"
        );

        ingredients.forEach(ingredient -> {
            ProductIngredient productIngredient = new ProductIngredient();
            productIngredient.setIngredientName(ingredient);
            productIngredientRepository.save(productIngredient);
        });
    }

    private void initializeProducts() {
        // 카테고리 조회
        ProductCategory 여성건강 = productCategoryRepository.findByName("여성 건강/PMS").orElseThrow();
        ProductCategory 관절뼈 = productCategoryRepository.findByName("관절/뼈").orElseThrow();
        ProductCategory 구강관리 = productCategoryRepository.findByName("구강 관리").orElseThrow();
        ProductCategory 면역력 = productCategoryRepository.findByName("면역력").orElseThrow();
        ProductCategory 수면 = productCategoryRepository.findByName("수면").orElseThrow();
        ProductCategory 피로활력 = productCategoryRepository.findByName("피로/활력").orElseThrow();
        ProductCategory 노화항산화 = productCategoryRepository.findByName("노화/항산화").orElseThrow();
        ProductCategory 간건강 = productCategoryRepository.findByName("간 건강").orElseThrow();
        ProductCategory 피부 = productCategoryRepository.findByName("피부").orElseThrow();
        ProductCategory 눈건강 = productCategoryRepository.findByName("눈 건강").orElseThrow();
        ProductCategory 만성질환 = productCategoryRepository.findByName("만성질환").orElseThrow();
        ProductCategory 빈혈 = productCategoryRepository.findByName("빈혈").orElseThrow();

        // 성분 조회
        ProductIngredient 감마리놀렌산 = productIngredientRepository.findByIngredientName("감마리놀렌산(GLA)").get(0);
        ProductIngredient 엽산 = productIngredientRepository.findByIngredientName("엽산").get(0);
        ProductIngredient 철분 = productIngredientRepository.findByIngredientName("철분").get(0);
        ProductIngredient 칼슘 = productIngredientRepository.findByIngredientName("칼슘").get(0);
        ProductIngredient 비타민D = productIngredientRepository.findByIngredientName("비타민D").get(0);
        ProductIngredient GABA = productIngredientRepository.findByIngredientName("GABA").get(0);
        ProductIngredient 비타민B6 = productIngredientRepository.findByIngredientName("비타민B군").get(0);
        ProductIngredient 마그네슘 = productIngredientRepository.findByIngredientName("마그네슘").get(0);
        ProductIngredient 비타민C = productIngredientRepository.findByIngredientName("비타민C").get(0);
        ProductIngredient 코엔자임Q10 = productIngredientRepository.findByIngredientName("코엔자임Q10").get(0);
        ProductIngredient 오메가3 = productIngredientRepository.findByIngredientName("오메가-3").get(0);
        ProductIngredient 루테인 = productIngredientRepository.findByIngredientName("루테인").get(0);
        ProductIngredient 콜라겐 = productIngredientRepository.findByIngredientName("콜라겐").get(0);
        ProductIngredient 인지질 = productIngredientRepository.findByIngredientName("인지질(PS)").get(0);

        List<Product> products = Arrays.asList(
                Product.builder()
                        .name("종근당 황후의봄")
                        .description("여성 건강을 위한 감마리놀렌산(GLA) 보충제")
                        .price(new BigDecimal("30000"))
                        .stock(50)
                        .active(true)
                        .categories(List.of(여성건강))
                        .ingredients(List.of(감마리놀렌산))
                        .build(),
                Product.builder()
                        .name("뉴트라라이프 보라지 오일")
                        .description("감마리놀렌산(GLA) 함유 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(40)
                        .active(true)
                        .categories(List.of(여성건강))
                        .ingredients(List.of(감마리놀렌산))
                        .build(),
                Product.builder()
                        .name("솔가 엽산 400mcg")
                        .description("여성 건강과 임신 준비를 위한 엽산 보충제")
                        .price(new BigDecimal("15000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(여성건강))
                        .ingredients(List.of(엽산))
                        .build(),
                Product.builder()
                        .name("페로글로빈 철분 시럽")
                        .description("빈혈 예방을 위한 철분 보충제")
                        .price(new BigDecimal("20000"))
                        .stock(60)
                        .active(true)
                        .categories(List.of(빈혈))
                        .ingredients(List.of(철분))
                        .build(),
                Product.builder()
                        .name("센트룸 칼슘+D3")
                        .description("뼈 건강을 위한 칼슘과 비타민D 보충제")
                        .price(new BigDecimal("22000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(관절뼈))
                        .ingredients(List.of(칼슘, 비타민D))
                        .build(),
                Product.builder()
                        .name("나우푸드 GABA 500mg")
                        .description("긴장 완화와 숙면을 위한 GABA 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(수면))
                        .ingredients(List.of(GABA))
                        .build(),
                Product.builder()
                        .name("솔가 비타민 B6 100mg")
                        .description("PMS 및 신경 건강을 위한 비타민 B6 보충제")
                        .price(new BigDecimal("16000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(여성건강, 피로활력))
                        .ingredients(List.of(비타민B6))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 고흡수 마그네슘")
                        .description("근육 이완과 신경 안정에 도움을 주는 마그네슘")
                        .price(new BigDecimal("24000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(수면, 관절뼈))
                        .ingredients(List.of(마그네슘))
                        .build(),
                Product.builder()
                        .name("얼라이브 비타민 C 1000mg")
                        .description("면역력 향상과 항산화 효과를 위한 비타민 C")
                        .price(new BigDecimal("18000"))
                        .stock(150)
                        .active(true)
                        .categories(List.of(구강관리, 면역력))
                        .ingredients(List.of(비타민C))
                        .build(),
                Product.builder()
                        .name("나우푸드 CoQ10 100mg")
                        .description("항산화 및 심혈관 건강을 위한 CoQ10 보충제")
                        .price(new BigDecimal("29000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(노화항산화, 만성질환))
                        .ingredients(List.of(코엔자임Q10))
                        .build(),
                Product.builder()
                        .name("네이처메이드 오메가-3")
                        .description("심혈관 건강을 위한 고순도 오메가-3")
                        .price(new BigDecimal("31000"))
                        .stock(85)
                        .active(true)
                        .categories(List.of(노화항산화, 간건강))
                        .ingredients(List.of(오메가3))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 루테인")
                        .description("눈 건강을 위한 루테인 보충제")
                        .price(new BigDecimal("22000"))
                        .stock(90)
                        .active(true)
                        .categories(List.of(눈건강))
                        .ingredients(List.of(루테인))
                        .build(),
                Product.builder()
                        .name("네오셀 슈퍼 콜라겐+C")
                        .description("피부 건강을 위한 콜라겐 보충제")
                        .price(new BigDecimal("33000"))
                        .stock(75)
                        .active(true)
                        .categories(List.of(피부))
                        .ingredients(List.of(콜라겐))
                        .build(),
                Product.builder()
                        .name("닥터스베스트 포스파티딜세린")
                        .description("인지력 개선을 위한 인지질 보충제")
                        .price(new BigDecimal("28000"))
                        .stock(60)
                        .active(true)
                        .categories(List.of(만성질환))
                        .ingredients(List.of(인지질))
                        .build(),
                Product.builder()   //추가됨
                        .name("닥터스베스트 칼슘 마그네슘 비타민D")
                        .description("뼈 건강을 위한 필수 미네랄과 비타민D 보충제")
                        .price(new BigDecimal("32000"))
                        .stock(100)
                        .active(true)
                        .categories(List.of(관절뼈,피로활력,수면))
                        .ingredients(List.of(칼슘, 마그네슘, 비타민D))
                        .build()
        );

        productRepository.saveAll(products);
    }
}


*/
