import axios from 'axios';

const API_URL = "http://localhost:8080/api/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const fetchCategories = async (setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions, setQuestions) => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await axiosInstance.get('survey/categories');
    setCategories(response.data);
    const currentCategory = response.data[currentCategoryIndex];
    if (currentCategory?.subCategories?.length > 0) {
      const nextSubCategoryId = currentCategory.subCategories[currentSubCategoryIndex]?.id;
      if (nextSubCategoryId) {
        fetchQuestions(nextSubCategoryId, setQuestions, setError, setIsLoading);
      }
    }
  } catch (error) {
    console.error('카테고리 로딩 오류:', error);
    setError('설문 데이터를 불러오는데 실패했습니다.');
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
    console.error('질문 로딩 오류:', error);
    setError('질문을 불러오는데 실패했습니다.');
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
