import React from "react";
import { Box, Typography, TextField, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateBillingDate, fetchSubscription } from "@/store/subscriptionSlice";

function BillingDate({ subscription }) {
    const dispatch = useDispatch();

    const handleBillingDateChange = (event) => {
        const newBillingDate = event.target.value;
        dispatch(updateBillingDate({ subscriptionId: subscription.id, newBillingDate }))
            .then(() => dispatch(fetchSubscription()));
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                결제일 관리
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <TextField
                    type="date"
                    defaultValue={subscription?.nextBillingDate}
                    onChange={handleBillingDateChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#4CAF50',
                            },
                            '&:hover fieldset': {
                                borderColor: '#45a049',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#45a049',
                            },
                        },
                    }}
                />
            </Paper>
        </Box>
    );
}

export default BillingDate;
