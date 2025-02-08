import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

//export const fetchSubscription = createAsyncThunk(
//    "subscription/fetchSubscription",
//    async (_, { getState, rejectWithValue }) => {
//        try {
//            console.log("🔍 fetchSubscription 호출됨");
//            const { auth } = getState(); // Redux에서 로그인된 유저 정보 가져오기
//            if (!auth.user) throw new Error("로그인이 필요합니다.");
//
//            const response = await fetchWithAuth(`${API_URL}subscription?memberId=${auth.user.id}`);
//            const data = await response.json();
//
//            if (!response.ok) throw new Error(data.message || "구독 정보를 불러오지 못했습니다.");
//            console.log("✅ fetchSubscription 성공: ", data);
//            return data;
//        } catch (error) {
//                console.error("❌ fetchSubscription 실패:", error);
//                return rejectWithValue(error.message);
//        }
//    }
//);

//export const fetchSubscription = createAsyncThunk(
//  "subscription/fetchSubscription",
//  async () => {
//    const response = await fetchWithAuth(`${API_URL}subscription`);
//    return response.json();
//  }
//);
/**
 * 사용자의 구독 정보 가져오기
 */
export const fetchSubscription = createAsyncThunk(
  "subscription/fetchSubscription",
  async (_, { getState }) => {
    const state = getState();
    const memberId = state.auth.user?.id;  // ✅ 현재 로그인된 유저 ID 가져오기
            console.log("🔍 fetchSubscription 호출됨");


    if (!memberId) {
      throw new Error("로그인 정보 없음: memberId가 없습니다.");
    }

    const response = await fetchWithAuth(`${API_URL}subscription?memberId=${memberId}`);

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    return response.json();
  }
);

/**
 * ✅ 상품 리스트 가져오기
 */
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}products`);
      console.log("API_URL:", API_URL);
      if (!response.ok) {
        throw new Error("상품 정보를 불러올 수 없습니다. API 확인 필요.");
      }
      return response.json();
    } catch (error) {
      console.error("❌ fetchProducts 실패:", error);
      throw error;
    }
  }
);


/**
 * 구독 정보 업데이트 (상품 추가/삭제, 결제일 변경, 결제수단 변경, 배송정보 변경)
 */
export const updateSubscription = createAsyncThunk(
  "subscription/updateSubscription",
  async (updatedData) => {
    const response = await fetchWithAuth(`${API_URL}subscription/update-items`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
    return response.json();
  }
);

/**
 * 구독 취소
 */
export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (immediately) => {
    const response = await fetchWithAuth(`${API_URL}subscription/cancel`, {
      method: "DELETE",
      body: JSON.stringify({ immediately }),
    });
    return response.json();
  }
);

//const subscriptionSlice = createSlice({
//  name: "subscription",
//  initialState: {
//    data: null,
//    loading: false,
//    error: null,
//  },
//  reducers: {},
//  extraReducers: (builder) => {
//    builder
//      .addCase(fetchSubscription.pending, (state) => {
//        state.loading = true;
//      })
//      .addCase(fetchSubscription.fulfilled, (state, action) => {
//        state.loading = false;
//        state.data = action.payload;
//      })
//      .addCase(fetchSubscription.rejected, (state, action) => {
//        state.loading = false;
//        state.error = action.error.message;
//      })
//      .addCase(updateSubscription.fulfilled, (state, action) => {
//        state.data = action.payload;
//      })
//      .addCase(cancelSubscription.fulfilled, (state, action) => {
//        state.data = action.payload;
//      });
//  },
//});

/**
 * 다음 회차 결제 상품 추가/삭제
 */
export const updateNextSubscriptionItems = createAsyncThunk(
  "subscription/updateNextItems",
  async ({ subscriptionId, updatedItems }) => {
    const response = await fetchWithAuth(`${API_URL}subscription/update-next-items`, {
      method: "POST",
      body: JSON.stringify({ subscriptionId, updatedItems }),
    });

    if (!response.ok) {
      throw new Error("다음 결제 상품 업데이트 실패");
    }
    return response.json();
  }
);

/**
 * 자동 결제 처리
 */
export const processSubscriptionBilling = createAsyncThunk(
  "subscription/processBilling",
  async (subscriptionId) => {
    const response = await fetchWithAuth(`${API_URL}subscription/process-billing`, {
      method: "POST",
      body: JSON.stringify({ subscriptionId }),
    });
    return response.json();
  }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState: {
//        data: { nextItems: [] },  // ✅ 기본값 설정
        data: { nextItems: [], items: [] }, // ✅ 기본값 설정
        loading: false,
        error: null,
        products: [], // ✅ 상품 리스트
        selectedProduct: null, // ✅ 선택한 상품
        selectedQuantity: 1, // ✅ 선택한 수량
    },
    reducers: {
        setSelectedProduct: (state, action) => {
          state.selectedProduct = action.payload;
        },
        setSelectedQuantity: (state, action) => {
          state.selectedQuantity = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload || { nextItems: [], items: [] }; // ✅ 기본값 설정
            state.error = null;
        })
        .addCase(fetchSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(updateSubscription.fulfilled, (state, action) => {
            state.data = action.payload;
        })
        .addCase(cancelSubscription.fulfilled, (state, action) => {
            state.data = action.payload;
        })
        .addCase(updateNextSubscriptionItems.fulfilled, (state, action) => {
            state.data.nextItems = action.payload || []; // ✅ nextItems 기본값 설정
        })
        .addCase(processSubscriptionBilling.fulfilled, (state, action) => {
            state.data = action.payload;
        })
        .addCase(fetchProducts.rejected, (state) => {
          state.products = []; // ✅ 실패 시 빈 배열로 초기화
        })
    },
});
export const { setSelectedProduct, setSelectedQuantity } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
