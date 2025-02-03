// SurveyPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchQuestions, updateResponse, submitSurvey } from '@/redux/surveySlice';
import QuestionComponent from '@features/survey/QuestionComponent';

const SurveyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, questions, responses, loading, error } = useSelector(state => state.survey);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategorySelect = (subCategoryId) => {
    dispatch(fetchQuestions(subCategoryId));
  };

  const handleResponseChange = (questionId, answer) => {
    dispatch(updateResponse({ questionId, answer }));
  };

  const handleSubmit = () => {
    dispatch(submitSurvey({ responses }))
      .unwrap()
      .then(() => {
        // 제출 성공 시 처리
        navigate('/survey-complete');
      })
      .catch((error) => {
        // 에러 처리
        console.error('Survey submission failed:', error);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Survey</h1>
      {categories.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          {category.subCategories.map(subCategory => (
            <button key={subCategory.id} onClick={() => handleCategorySelect(subCategory.id)}>
              {subCategory.name}
            </button>
          ))}
        </div>
      ))}
      {questions.map(question => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={(answer) => handleResponseChange(question.id, answer)}
        />
      ))}
      <button onClick={handleSubmit}>Submit Survey</button>
    </div>
  );
};

export default SurveyPage;
