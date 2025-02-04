import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from '@/constant';


export const fetchProducts = createAsyncThunk("products/fetchProducts", async ({page, size}, { rejectWithValue }) => {
    try {
        const response = await fetchWithAuth(`${API_URL}products?page=${page}&size=${size}`, { method: "GET" });

        console.log("📢 요청 URL:", `${API_URL}products?page=${page}&size=${size}`);
        console.log("📢 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API 에러 응답:", errorData); // 에러 응답 데이터 출력
            return rejectWithValue(errorData.message || "알 수 없는 에러");
        }

        const data = await response.json();
        console.log("Fetched products:", data);  // ✅ API 응답 데이터 확인
        return data;
    } catch (error) {
        console.error("Fetch error:", error);  // ✅ 네트워크 오류 확인
        return rejectWithValue("상품 목록 가져오기 실패: 네트워크 또는 서버 오류");
    }
});

