import React from "react";
import "@/styles/CartSummary.css";

/**
 * 장바구니 요약 컴포넌트
 * 장바구니 아이템들의 총 금액, 배송비, 할인, 최종 결제 금액을 계산하고 표시합니다.
 * 일반 구매와 정기 구독 중 하나를 선택할 수 있는 옵션을 제공합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.cartItems - 장바구니 아이템 배열
 * @param {string} props.purchaseType - 구매 유형 ('oneTime' 또는 'subscription')
 * @param {function} props.onSelect - 구매 유형 선택 핸들러
 * @returns {JSX.Element} 장바구니 요약 컴포넌트
 */
const CartSummary = ({ cartItems, purchaseType, onSelect }) => {
  /**
   * 총액, 할인, 배송비를 계산하는 함수
   * @param {string} type - 계산할 구매 유형
   * @returns {Object} 계산된 총액, 할인, 배송비, 최종 가격
   */
  const calculateTotals = (type) => {
    let totalPrice = 0;
    let discount = 0;
    let shippingFee = 3000; // 기본 배송비

    cartItems.forEach(item => {
      if (item.selected) {
        totalPrice += item.price * item.quantity;
      }
    });

    if (type === 'subscription') {
      if (totalPrice >= 30000) {
        discount += 3000;
      }
      if (totalPrice >= 10000) {
        shippingFee = 0;
      }
    } else {
      if (totalPrice >= 30000) {
        shippingFee = 0;
      }
    }

    const finalPrice = totalPrice - discount + shippingFee;

    return { totalPrice, shippingFee, discount, finalPrice };
  };

  const oneTimeTotals = calculateTotals('oneTime');
  const subscriptionTotals = calculateTotals('subscription');

  /**
   * 구매 유형 옵션을 렌더링하는 함수
   * @param {string} type - 렌더링할 구매 유형
   * @returns {JSX.Element} 구매 유형 옵션 컴포넌트
   */
  const renderPurchaseOption = (type) => {
    const isOneTime = type === 'oneTime';
    const totals = isOneTime ? oneTimeTotals : subscriptionTotals;

    return (
      <div
        className={`purchase-type-option ${purchaseType === type ? 'selected' : ''}`}
        onClick={() => onSelect(type)}
      >
        <div className="option-header">
          <span className="option-title">{isOneTime ? '일반 구매' : '정기 구독'}</span>
          <span className="option-price">{totals.finalPrice.toLocaleString()}원</span>
        </div>
        <div className="option-benefits">
          {isOneTime ? (
            <>
              <div className="benefit-item">3만원 이상 무료배송</div>
              <div className="benefit-item">5% 할인 쿠폰 사용 가능</div>
            </>
          ) : (
            <>
              <div className="benefit-item highlight">3만원 이상 구매시 3,000원 할인</div>
              <div className="benefit-item">1만원 이상 무료배송</div>
              <div className="benefit-item">구독 회차 할인 적용</div>
            </>
          )}
        </div>
      </div>
    );
  };

  const selectedTotals = purchaseType === 'oneTime' ? oneTimeTotals : subscriptionTotals;

  return (
    <>
      <div className="purchase-type-selection">
        {renderPurchaseOption('oneTime')}
        {renderPurchaseOption('subscription')}
      </div>

      <div className="total-amount-section">
        <div className="total-amount-header">
          <h3>전체 금액</h3>
          <span>{selectedTotals.finalPrice.toLocaleString()}원</span>
        </div>
        <div className="total-amount-content">
          <div className="amount-row">
            <span>총 제품금액</span>
            <span>{selectedTotals.totalPrice.toLocaleString()}원</span>
          </div>
          {selectedTotals.discount > 0 && (
            <div className="amount-row highlight">
              <span>제품 할인금액</span>
              <span>-{selectedTotals.discount.toLocaleString()}원</span>
            </div>
          )}
          <div className="amount-row">
            <span>기본 배송비</span>
            <span>
              {selectedTotals.shippingFee > 0
                ? `+${selectedTotals.shippingFee.toLocaleString()}원`
                : '무료'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSummary;
