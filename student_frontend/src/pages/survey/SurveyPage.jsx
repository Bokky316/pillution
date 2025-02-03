import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import QuestionComponent from '@features/survey/QuestionComponent';
import { fetchCategories, fetchQuestions, submitSurvey } from '@features/survey/surveyApi';
import { validateResponses } from '@features/survey/surveyUtils';

const SurveyPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentSubCategoryIndex, setCurrentSubCategoryIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gender, setGender] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        console.log("Fetched categories:", data);
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          // 카테고리 로드 후 바로 첫 번째 서브카테고리의 질문들을 로드
          loadQuestions(data[0].subCategories[0].id);
        } else {
          setError("카테고리 데이터가 비어있습니다.");
        }
      } catch (err) {
        console.error("카테고리 조회 실패:", err);
        setError("카테고리를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const loadQuestions = async (subCategoryId) => {
    try {
      setLoading(true);
      const data = await fetchQuestions(subCategoryId);
      console.log("Fetched questions:", data);
      setQuestions(data || []);
    } catch (err) {
      console.error("질문 조회 실패:", err);
      setError("질문을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && categories[currentCategoryIndex]?.subCategories?.length > 0) {
      const subCategoryId = categories[currentCategoryIndex].subCategories[currentSubCategoryIndex].id;
      loadQuestions(subCategoryId);
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex]);

 const handleResponseChange = (questionId, value) => {
   console.log(`Response changed for question ${questionId}:`, value);
   setResponses(prev => {
     let newValue = value;
     const currentQuestion = questions.find(q => q.id === questionId);

     if (currentQuestion.questionType === 'MULTIPLE_CHOICE') {
       const lastOptionId = currentQuestion.options[currentQuestion.options.length - 1].id;
       if (Array.isArray(value)) {
         if (value.includes(lastOptionId)) {
           newValue = [lastOptionId];
         } else {
           newValue = value.filter(v => v !== lastOptionId);
         }
       }
     }

     const newResponses = { ...prev, [questionId]: newValue };
     console.log('Updated responses:', newResponses);
     return newResponses;
   });

    if (questionId === 2) {
      const newGender = value === '1' ? 'female' : 'male';
      setGender(newGender);
    }

    const symptomsQuestion = questions.find(q => q.questionText.includes('최대 3가지'));
    if (symptomsQuestion && questionId === symptomsQuestion.id) {
      setSelectedSymptoms(Array.isArray(value) ? value : []);
    }
  };



const handleNext = async () => {
  console.log("Current responses:", responses);
  if (!validateResponses(questions, responses)) {
    alert('모든 질문에 답해주세요.');
    return;
  }

    const currentCategory = categories[currentCategoryIndex];

 if (currentCategory?.name === "2. 증상·불편") {
   const mainSymptomSubCategory = currentCategory.subCategories.find(sub => sub.name === "주요 증상");
   if (mainSymptomSubCategory && currentSubCategoryIndex === currentCategory.subCategories.indexOf(mainSymptomSubCategory)) {
     const mainSymptomQuestion = questions.find(q => q.questionText.includes('불편하거나 걱정되는 것'));
     const selectedMainSymptomIds = responses[mainSymptomQuestion?.id] || [];

     if (selectedMainSymptomIds.length > 0) {
       const selectedMainSymptoms = mainSymptomQuestion.options
         .filter(opt => selectedMainSymptomIds.includes(opt.id.toString()))
         .map(opt => opt.optionText);

       const filteredSubCategories = currentCategory.subCategories.filter(sub =>
         sub.name === "주요 증상" ||
         sub.name === "추가 증상" ||
         selectedMainSymptoms.includes(sub.name)
       );

       setCategories(prevCategories => {
         const newCategories = [...prevCategories];
         newCategories[currentCategoryIndex] = {
           ...newCategories[currentCategoryIndex],
           subCategories: filteredSubCategories
         };
         return newCategories;
       });

       setCurrentSubCategoryIndex(0);
     }
   }
 }



    let nextSubCategoryIndex = currentSubCategoryIndex + 1;
    while (nextSubCategoryIndex < currentCategory.subCategories.length) {
      const nextSubCategory = currentCategory.subCategories[nextSubCategoryIndex];
      if (currentCategory.name === "3. 생활 습관") {
        if ((gender === 'female' && nextSubCategory.name === "남성건강") ||
            (gender === 'male' && nextSubCategory.name === "여성건강")) {
          nextSubCategoryIndex++;
          continue;
        }
      }
      break;
    }

    if (nextSubCategoryIndex < currentCategory.subCategories.length) {
      setCurrentSubCategoryIndex(nextSubCategoryIndex);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentSubCategoryIndex(0);
    } else {
      try {
        setLoading(true);
        await submitSurvey(responses);
        navigate('/recommendation');
      } catch (err) {
        console.error('서베이 제출 실패:', err);
        setError('서베이 제출에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];

  console.log("Render state:", {
    loading,
    error,
    categoriesLength: categories.length,
    currentCategory,
    currentSubCategory,
    questionsLength: questions.length,
    gender,
    selectedSymptoms
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  return (
    <Box sx={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {currentCategory && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory.name}</Typography>
          {currentSubCategory && (
            <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory.name}</Typography>
          )}
        </>
      )}
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={handleResponseChange}
        />
      ))}
      <Button
        variant="contained"
        onClick={handleNext}
        sx={{ mt: 2 }}
        disabled={loading || questions.length === 0}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === currentCategory?.subCategories?.length - 1
          ? '제출'
          : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
