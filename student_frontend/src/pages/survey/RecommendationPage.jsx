import React, { useState, useEffect } from 'react';
import { getRecommendations } from "../../features/auth/api/api";
import RecommendationList from '../../features/survey/RecommendationList';

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommendation-page">
      <h1>맞춤형 추천</h1>
      <RecommendationList recommendations={recommendations} />
    </div>
  );
};

export default RecommendationPage;
