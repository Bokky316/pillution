/*
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Button from '../../component/common/Button';
import Card from '../../component/common/Card';
import { submitSurveyResponses, getRecommendations } from '../../services/api';

const SurveyResults = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const responses = location.state?.responses;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (responses) {
        try {
          await submitSurveyResponses(responses);
          const data = await getRecommendations( */
/* memberId *//*
); // memberId 필요
          setRecommendations(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setError('추천 정보를 가져오는데 실패했습니다.');
          setLoading(false);
        }
      }
    };

    fetchRecommendations();
  }, [responses]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="section">
      <h2 className="section-title">추천 영양제</h2>
      <div className="card-container">
        {recommendations.map((product) => (
          <Card key={product.id}>
            <h3>{product.name}</h3>
            <p>주요 성분: {product.mainIngredient}</p>
            <p>가격: {product.price}원</p>
            <Link to={`/products/${product.id}`}>
              <Button>상세 정보</Button>
            </Link>
          </Card>
        ))}
      </div>
      <Link to="/">
        <Button>홈으로 돌아가기</Button>
      </Link>
    </div>
  );
};

export default SurveyResults;
 */
