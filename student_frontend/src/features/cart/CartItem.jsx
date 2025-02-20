import React from 'react';
import { Typography, Box, Checkbox, IconButton, Grid } from '@mui/material';
import { blue } from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';

const CartItem = ({ item, onSelect, onQuantityChange, onRemove }) => {
    // 이미지 URL을 가져오는 함수
    const getProductImageUrl = (imageUrl) => {
        if (imageUrl) {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || "http://localhost:8080";
            return `${baseUrl}${imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl}`;
        }
        return "https://dummyimage.com/100x100/cccccc/ffffff&text=No+Image"; // 기본 이미지
    };

    return (
        <Box position="relative" mb={2}>
            <Grid container alignItems="center">
                <Grid item xs={1}>
                    <Checkbox
                        checked={item.selected} // prop으로 전달받은 selected 값 사용
                        onChange={() => onSelect(item.cartItemId)}
                        sx={{
                            color: blue[700],
                            '&.Mui-checked': {
                                color: blue[700],
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <img
                        src={getProductImageUrl(item.imageUrl)}
                        alt={item.name}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Typography variant="body2">가격: {item.price.toLocaleString()}원</Typography>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => onQuantityChange(item.cartItemId, -1)} size="small">-</IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton onClick={() => onQuantityChange(item.cartItemId, 1)} size="small">+</IconButton>
                    </Box>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                    <IconButton
                        onClick={() => onRemove(item.cartItemId)}
                        sx={{ color: '#888' }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CartItem;
