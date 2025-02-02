import { fetchWithAuth } from '../common/fetchWithAuth';
import { API_URL } from '../constant';

export const fetchCategories = async () => {
  const response = await fetchWithAuth(`${API_URL}survey/categories`);
  if (!response.ok) {
    throw new Error('카테고리 조회 실패');
  }
  return await response.json();
};

export const fetchQuestions = async (subCategoryId) => {
  const response = await fetchWithAuth(`${API_URL}survey/subcategories/${subCategoryId}/questions`);
  if (!response.ok) {
    throw new Error('질문 조회 실패');
  }
  return await response.json();
};

export const submitSurvey = async (surveyResponses) => {
  const response = await fetchWithAuth(`${API_URL}survey/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(surveyResponses),
  });
  if (!response.ok) {
    throw new Error('서베이 제출 실패');
  }
  return await response.json();
};
