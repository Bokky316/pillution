import React from 'react';
import { Box, Typography } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * @param {Object[]} selectedItems - 선택된 주문 아이템 목록
 * @returns {JSX.Element} 주문 상품 목록 컴포넌트
 * @description 주문 상품 목록을 표시하는 컴포넌트입니다.
 */
const OrderItems = ({ selectedItems }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                주문 정보
            </Typography>
            {selectedItems.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: 100, height: 100, marginRight: 20 }}
                    />
                    <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body1">가격: {item.price}원</Typography>
                        <Typography variant="body1">수량: {item.quantity}</Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

OrderItems.propTypes = {
    selectedItems: PropTypes.arrayOf(
        PropTypes.shape({
            imageUrl: PropTypes.string,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            quantity: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default OrderItems;
