import React from 'react';
import { Box, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const OrderItems = ({ selectedItems }) => {
    return (
        <Box>
            {selectedItems.map((item, index) => (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: '1px solid #eee',
                        py: 2
                    }}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: 80, height: 80, marginRight: 16 }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                            {item.name}
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                            {item.quantity}개
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mt: 1 }}>
                            {item.price.toLocaleString()}원
                        </Typography>
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