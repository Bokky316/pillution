import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Button from '../../component/common/Button';
import Card from '../../component/common/Card';
import { getRecommendations } from '../../services/api';

const SurveyResults = () => {
  const [recommendations, setRecommendations] = useState([]);
  const location = useLocation();
  const answers = location.state?.answers;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (answers) {
        try {
          const data = await getRecommendations(answers);
          setRecommendations(data);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [answers]);

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
