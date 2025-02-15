import React from 'react';
import { Typography, Button, Box } from '@mui/material';

const CartItem = ({ item, onSelect, onQuantityChange, onRemove }) => {
    return (
        <Box display="flex" alignItems="center" mb={2}>
            <input
                type="checkbox"
                checked={item.selected}
                onChange={() => onSelect(item.cartItemId)}
            />
            <img
                src={item.imageUrl} // 백엔드에서 제공하는 이미지 URL 사용
                alt={item.name}
                style={{ width: 100, height: 100, marginRight: 20 }}
            />
            <Box flexGrow={1}>
                <Typography variant="h6">{item.name}</Typography>
                <Typography>가격: {item.price}원</Typography>
                <Box display="flex" alignItems="center">
                    <Button onClick={() => onQuantityChange(item.cartItemId, -1)}>-</Button>
                    <Typography>{item.quantity}</Typography>
                    <Button onClick={() => onQuantityChange(item.cartItemId, 1)}>+</Button>
                </Box>
            </Box>
            <Button onClick={() => onRemove(item.cartItemId)}>삭제</Button>
        </Box>
    );
};

export default CartItem;
