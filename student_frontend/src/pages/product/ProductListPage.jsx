import { useState, useEffect } from "react";
import "./ProductListPage.css"; // CSS 파일 추가

const ProductListPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 🔹 실제 API 대신 임의의 `mockData` 사용
        const mockData = [
          {
            id: 1,
            name: "GENMIX 젠믹스 산양유 단백질",
            price: 44900,
            image: "/images/vitamin-c.jpg",
            category: { id: 1, name: "단백질" },
          },
          {
            id: 2,
            name: "필리 메가 프로폴리스 면역젤리",
            price: 13500,
            image: "/images/omega3.jpg",
            category: { id: 3, name: "면역강화" },
          },
          {
            id: 3,
            name: "PHEW P 관절이약: 거침없이 이별 통보",
            price: 29500,
            image: "/images/probiotics.jpg",
            category: { id: 4, name: "관절영양제" },
          },
          {
            id: 4,
            name: "PHEW P 속&프리: 그날의 극적 화해",
            price: 32500,
            image: "/images/probiotics.jpg",
            category: { id: 5, name: "소화영양제" },
          }
        ];

        setProducts(mockData);
      } catch (error) {
        console.error("상품 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-list-page">
      <h1 className="page-title">전체 상품</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-details">
              <p className="product-name">{product.name}</p>
              <span className="product-price">{product.price.toLocaleString()}원</span>

              {/* 🔹 단일 카테고리만 표시 */}
              <div className="product-category">
                <span className="category-tag">
                  {product.category ? product.category.name : "카테고리 없음"}
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
