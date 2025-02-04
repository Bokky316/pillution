import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts } from "../features/product/productApi";

const productSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        totalRows: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                console.log("⏳ fetchProducts 요청 시작!");
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                console.log("✅ fetchProducts 성공!", action.payload);
                state.loading = false;
                state.products = action.payload.dtoList || [];
                state.totalRows = action.payload.total || 0;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                console.error("❌ fetchProducts 실패!", action.payload);
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;
