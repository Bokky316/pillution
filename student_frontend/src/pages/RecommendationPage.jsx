import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constant";
import { fetchWithAuth } from "../common/fetchWithAuth";

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const memberId = 1; // 임시로 설정된 멤버 ID

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations(memberId);
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchRecommendations();
  }, [memberId]);

  return (
    <div>
      <h1>맞춤형 추천</h1>
      {recommendations.map((product) => (
        <Link key={product.id} to={`/products/${product.id}`}>
          <div>{product.name}</div>
          <div>{product.mainIngredient}</div>
          <div>{product.price}원</div>
        </Link>
      ))}
    </div>
  );
};

export default RecommendationPage;