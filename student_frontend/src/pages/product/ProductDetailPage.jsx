import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetails, addToCart } from "../../features/auth/api/api";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const data = await getProductDetails(productId);
        setProduct(data);
      } catch (error) {
        console.error('제품 상세 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId, quantity });
      alert('장바구니에 추가되었습니다!');
    } catch (error) {
      console.error('장바구니 추가 중 오류 발생:', error);
    }
  };

  if (!product) return <div>로딩 중...</div>;

  return (
    <div className="product-detail-page">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>가격: {product.price}원</p>
      <label>수량: </label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min="1"
      />
      <button onClick={handleAddToCart}>장바구니 추가</button>
    </div>
  );
};

export default ProductDetailPage;
