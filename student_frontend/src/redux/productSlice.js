import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, fetchCategories, fetchProductsByCategory } from "@features/product/productApi";

const productSlice = createSlice({
    name: "products",
    initialState: {
        products: [], // 상품 목록
        categories: [], // 카테고리 목록
        totalRows: 0, // 전체 상품 개수
        loading: false, // 로딩 상태
        error: null, // 에러 상태
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // 상품 로딩 시작
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // 상품 로딩 성공
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload || []; // payload를 바로 products에 저장
                state.totalRows = action.payload.length || 0; // 총 상품 개수 저장
            })
            // 상품 로딩 실패
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "상품 데이터를 가져오지 못했습니다.";
            })
            // 카테고리 로딩 성공
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload || []; // 카테고리 목록 업데이트
            })
            // 카테고리별 상품 필터링 성공
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.products = action.payload || []; // 필터링된 상품 목록 업데이트
            });
    },
});

export default productSlice.reducer;
