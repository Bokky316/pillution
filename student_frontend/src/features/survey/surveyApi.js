import axios from 'axios';
import { API_URL } from '@/constant';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const handleError = (error, setError) => {
  console.error('API 호출 오류:', error);
  if (error.response) {
    console.error('응답 코드:', error.response.status);
    console.error('응답 데이터:', error.response.data);
  }
  setError('API 호출 중 오류가 발생했습니다.');
};

export const fetchCategories = async (setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions) => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await axiosInstance.get('survey/categories');
    setCategories(response.data);

    const currentCategory = response.data[currentCategoryIndex];
    if (currentCategory?.subCategories?.length > 0) {
      const nextSubCategoryId = currentCategory.subCategories[currentSubCategoryIndex + 1]?.id;
      if (nextSubCategoryId) {
        fetchQuestions(nextSubCategoryId, setQuestions, setError, setIsLoading);
      }
    }
  } catch (error) {
    handleError(error, setError);
  } finally {
    setIsLoading(false);
  }
};

export const fetchQuestions = async (subCategoryId, setQuestions, setError, setIsLoading) => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await axiosInstance.get(`survey/subcategories/${subCategoryId}/questions`);
    setQuestions(response.data);
  } catch (error) {
    handleError(error, setError);
  } finally {
    setIsLoading(false);
  }
};

export const submitSurvey = async (responses, navigate) => {
  try {
    const submissionData = Object.entries(responses).map(([questionId, response]) => ({
      questionId: parseInt(questionId),
      responseType: typeof response === 'string' ? 'TEXT' : 'MULTIPLE_CHOICE',
      responseText: typeof response === 'string' ? response : null,
      selectedOptions: Array.isArray(response) ? response : null,
    }));

    const token = localStorage.getItem('token');

    await axiosInstance.post(
      'survey/submit',
      { responses: submissionData },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    alert('설문이 성공적으로 제출되었습니다.');
    navigate('/');
  } catch (error) {
    console.error('설문 제출 오류:', error);
    alert('설문 제출에 실패했습니다.');
  }
};
