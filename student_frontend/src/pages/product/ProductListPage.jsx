import { useState, useEffect } from "react";
import "./ProductListPage.css"; // CSS 파일 추가

const ProductListPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const mockData = [
        {
          id: 1,
          name: "GENMIX 젠믹스 산양유 단백질",
          price: 44900,
          image: "/images/vitamin-c.jpg",
          tags: ["산양유단백질", "스테비아", "커피믹스"],
        },
        {
          id: 2,
          name: "필리 메가 프로폴리스 면역젤리",
          price: 13500,
          image: "/images/omega3.jpg",
          tags: ["프로폴리스", "젤리", "면역강화"],
        },
        {
          id: 3,
          name: "PHEW P 관절이약: 거침없이 이별 통보",
          price: 29500,
          image: "/images/probiotics.jpg",
          tags: ["관절영양제"],
        },
        {
          id: 4,
          name: "PHEW P 속&프리: 그날의 극적 화해",
          price: 32500,
          image: "/images/probiotics.jpg",
          tags: ["속편함", "소화영양제"],
        },
      ];
      setProducts(mockData);
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
              <div className="product-tags">
                {product.tags.map((tag, index) => (
                  <span className="tag" key={index}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
