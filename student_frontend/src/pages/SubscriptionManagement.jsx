import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import SubscriptionInfo from "@features/subscription/SubscriptionInfo";
import SubscriptionItems from "@features/subscription/SubscriptionItems";
import NextSubscriptionItems from "@features/subscription/NextSubscriptionItems";
import PaymentMethod from "@features/subscription/PaymentMethod";
import BillingDate from "@features/subscription/BillingDate";
import DeliveryInfo from "@features/subscription/DeliveryInfo";
import DiscountDetails from "@features/subscription/DiscountDetails";
import SubscriptionActions from "@features/subscription/SubscriptionActions";

import { fetchSubscription, fetchProducts } from "@/store/subscriptionSlice";

function SubscriptionManagement() {
    const dispatch = useDispatch();
    const { data: subscription, loading, error, products } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(fetchSubscription());
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Box sx={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>
            <SubscriptionInfo subscription={subscription} />
            <SubscriptionItems subscription={subscription} products={products} />
            <NextSubscriptionItems subscription={subscription} products={products} />
            <DiscountDetails subscription={subscription} />
            <PaymentMethod subscription={subscription} />
            <BillingDate subscription={subscription} />
            <DeliveryInfo subscription={subscription} />
            <SubscriptionActions subscription={subscription} />
        </Box>
    );
}

export default SubscriptionManagement;
