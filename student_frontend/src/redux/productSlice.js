import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, fetchCategories } from "@features/product/productApi";

const productSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        categories: [], // 카테고리 추가
        totalRows: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.dtoList || [];
                state.totalRows = action.payload.total || 0;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload; // 카테고리 추가
            });
    },
});

export default productSlice.reducer;
