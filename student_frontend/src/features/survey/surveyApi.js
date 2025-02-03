import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from '@/constant';

export const fetchCategories = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}survey/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw categories data:", data);
    return data;
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    throw error;
  }
};

export const fetchQuestions = async (subCategoryId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}survey/subcategories/${subCategoryId}/questions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw questions data:", data);
    return data;
  } catch (error) {
    console.error('질문 조회 실패:', error);
    throw error;
  }
};


export const submitSurvey = async (responses) => {
  try {
    const response = await fetchWithAuth(`${API_URL}survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '서베이 제출 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('서베이 제출 실패:', error);
    throw error;
  }
};
