import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from '@/constant';

// 상품 목록 가져오기
export const fetchProducts = createAsyncThunk("products/fetchProducts", async ({ page, size }, { rejectWithValue }) => {
    try {
        const response = await fetchWithAuth(`${API_URL}products?page=${page}&size=${size}`, { method: "GET" });

        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.message || "알 수 없는 에러");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return rejectWithValue("상품 목록 가져오기 실패: 네트워크 또는 서버 오류");
    }
});

// 카테고리 목록 가져오기
export const fetchCategories = createAsyncThunk("products/fetchCategories", async (_, { rejectWithValue }) => {
    try {
        const response = await fetchWithAuth(`${API_URL}categories`, { method: "GET" });

        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.message || "알 수 없는 에러");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return rejectWithValue("카테고리 목록 가져오기 실패: 네트워크 또는 서버 오류");
    }
});

export const fetchFilteredProducts = createAsyncThunk(
    "products/fetchFilteredProducts",
    async ({ categoryId, ingredientId }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}products/filter?`;
            if (categoryId) url += `categoryId=${categoryId}&`;
            if (ingredientId) url += `ingredientId=${ingredientId}`;

            const response = await fetchWithAuth(url, { method: "GET" });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || "알 수 없는 에러");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue("상품 필터링 실패: 네트워크 또는 서버 오류");
        }
    }
);

// 특정 카테고리에 해당하는 상품 목록 가져오기
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchProductsByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`/api/products/by-category/${categoryId}`);
      if (!response.ok) {
        throw new Error("상품 데이터를 가져오지 못했습니다.");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSortedProducts = createAsyncThunk(
    "products/fetchSortedProducts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}products/sorted-by-category`, { method: "GET" });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || "알 수 없는 에러");
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue("상품 정렬 실패: 네트워크 또는 서버 오류");
        }
    }
);

