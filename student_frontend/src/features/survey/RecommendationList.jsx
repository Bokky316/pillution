import React from 'react';
import { Link } from 'react-router-dom';

const RecommendationList = ({ recommendations }) => {
  return (
    <div className="recommendation-list">
      {recommendations.map((product) => (
        <div key={product.id} className="recommendation-item">
          <Link to={`/products/${product.id}`}>
            <h3>{product.name}</h3>
            <p>주요 성분: {product.mainIngredient}</p>
            <p>가격: {product.price}원</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RecommendationList;
