import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from '@/constant';

const fetchRecommendations = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}recommendations`);
    if (!response.ok) {
      throw new Error('추천 데이터를 불러오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('추천 데이터 조회 실패:', error);
    throw error;
  }
};

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await fetchRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err.message || '추천 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      <h1>추천 결과</h1>
      {recommendations.map((recommendation, index) => (
        <div key={index}>
          <h2>{recommendation.title}</h2>
          <p>{recommendation.description}</p>
        </div>
      ))}
    </div>
  );
};

export default RecommendationPage;
