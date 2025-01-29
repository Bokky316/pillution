import "./ProductList.css"; // 변경된 CSS 파일명

const ProductList = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h2 className="product-name">{product.name}</h2>

        {/* 🔹 단일 카테고리만 표시 */}
        <p className="product-category">
          {product.category ? product.category.name : "카테고리 없음"}
        </p>

        <p className="product-price">{product.price.toLocaleString()}원</p>
        <button className="add-to-cart-button">장바구니 추가</button>
      </div>
    </div>
  );
};

export default ProductList;
