import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

console.log("🔍 [DEBUG] fetchWithAuth import 확인:", fetchWithAuth);


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
            console.log("✅ fetchProducts 호출됨"); // 확인용 로그 추가
            console.log("🔍 [DEBUG] fetchWithAuth 실행 테스트 in fetchProducts:", fetchWithAuth);
            const response = await fetchWithAuth(`${API_URL}products`);
            if (!response.ok) {
                throw new Error("상품 정보를 불러올 수 없습니다. API 확인 필요.");
            }
            const data = await response.json();
            console.log("✅ fetchProducts 성공:", data);
            return data;
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
    "subscription/updateNextSubscriptionItems",
    async ({ subscriptionId, updatedItems }, { rejectWithValue, getState }) => {
        try {
            console.log("📡 [API 요청] 업데이트할 상품 목록:", { subscriptionId, updatedItems });

            // ✅ 현재 Redux 스토어에서 nextItems 가져오기 (방어 코드 추가)
            const state = getState();
            const currentItems = state.subscription.data?.nextItems || [];

            // ✅ 기존 아이템과 매칭하여 id 포함시키기
            const updatedItemsWithId = updatedItems.map(item => {
                const existingItem = currentItems.find(subItem => subItem.productId === item.productId);
                return {
                    id: existingItem ? existingItem.id : null,  // 기존 아이템이 있으면 id를 포함
                    ...item
                };
            });

            console.log("🔍 [DEBUG] 업데이트할 상품 목록 (id 포함):", updatedItemsWithId);

            // ❗ id가 없는 항목이 있으면 오류 처리
            if (updatedItemsWithId.some(item => item.id === null)) {
                console.error("❌ [ERROR] 일부 항목에 id가 없음!", updatedItemsWithId);
                return rejectWithValue("❌ 일부 항목에 id가 없습니다.");
            }

            // ✅ API 요청
            const response = await fetchWithAuth(`${API_URL}subscription/update-next-items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId, updatedItems: updatedItemsWithId }),
            });

            // ✅ JSON 응답을 올바르게 파싱
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "수량 업데이트 실패");
            }

            console.log("✅ [SUCCESS] 수량 업데이트 성공:", data);

            // ✅ UI 상태를 즉시 업데이트하도록 Redux 상태를 수정
            return { subscriptionId, updatedItems: updatedItemsWithId };
        } catch (error) {
            console.error("❌ [ERROR] 수량 업데이트 실패:", error);
            return rejectWithValue(error.message);
        }
    }
);





export const replaceNextSubscriptionItems = createAsyncThunk(
    'subscription/replaceNextItems',
    async ({ subscriptionId, updatedItems }, { rejectWithValue }) => {
        try {
            console.log("📡 [API 요청] 교체할 상품 목록:", { subscriptionId, updatedItems });

            const response = await fetchWithAuth(`${API_URL}subscription/replace-next-items`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ subscriptionId, updatedItems }),
            });

            if (!response.ok) {
                throw new Error('구독 아이템 교체 실패');
            }

            const data = await response.json();
            console.log("✅ [SUCCESS] 구독 아이템 교체 응답:", data);

            return data;  // ✅ Redux 상태 업데이트를 위해 반환
        } catch (error) {
            console.error('❌ [ERROR] 구독 아이템 교체 실패:', error);
            return rejectWithValue(error.message);
        }
    }
);





//(async () => {
//    try {
//        console.log("🛠️ [테스트] fetchWithAuth 실행 테스트");
//        const response = await fetchWithAuth("/api/test");
//        console.log("✅ [테스트] fetchWithAuth 정상 동작:", response);
//    } catch (error) {
//        console.error("❌ [테스트] fetchWithAuth 호출 실패:", error);
//    }
//})();


//export const addNextSubscriptionItem = createAsyncThunk(
//    "subscription/addNextSubscriptionItem",
//    async (newItem, { dispatch }) => {
//        console.log("📡 서버로 보낼 데이터:", newItem);
//        const response = await fetchWithAuth(`${API_URL}subscription/add-next-item`, {
//            method: "POST",
//            body: JSON.stringify(newItem),
//        });
//
//        if (!response.ok) {
//            throw new Error("상품 추가 실패");
//        }
//
//        console.log("✅ 상품 추가 성공");
//        dispatch(fetchSubscription()); // ✅ 최신 데이터 가져오기
//    }
//);

export const addNextSubscriptionItem = createAsyncThunk(
  "subscription/addNextSubscriptionItem",
  async (newItem, { rejectWithValue }) => {
    console.log("📡 [API 요청] 추가할 상품 데이터:", newItem);

    try {
      const response = await fetchWithAuth(`${API_URL}subscription/add-next-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errorText = await response.text(); // ❗ 서버에서 JSON이 아닌 경우 대비
        console.error("❌ [ERROR] 다음 정기결제 상품 추가 실패:", errorText);
        return rejectWithValue(errorText);
      }

      const data = await response.json(); // JSON 응답 처리
      console.log("✅ [SUCCESS] 상품 추가 응답:", data);

      return data; // ✅ 상태 업데이트를 위해 반환
    } catch (error) {
      console.error("❌ [ERROR] 다음 정기결제 상품 추가 실패:", error);
      return rejectWithValue(error.message);
    }
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

export const deleteNextSubscriptionItem = createAsyncThunk(
    "subscription/deleteNextSubscriptionItem",
    async ({ subscriptionId, productId }, { rejectWithValue, getState }) => {
        try {
            console.log("📡 [API 요청] 삭제할 상품:", { subscriptionId, productId });

            // ✅ Redux에서 현재 nextItems 가져오기
            const state = getState();
            const currentItems = state.subscription.data?.nextItems || [];

            // ✅ 삭제할 상품이 존재하는지 확인
            const existingItem = currentItems.find(item => item.productId === productId);
            if (!existingItem) {
                console.error("❌ [ERROR] 삭제할 상품을 찾을 수 없음!", productId);
                return rejectWithValue("❌ 삭제할 상품을 찾을 수 없습니다.");
            }

            const response = await fetchWithAuth(`${API_URL}subscription/delete-next-item`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId, productId }),
            });

            // ✅ 백엔드에서 JSON 응답을 보내므로 `response.json()` 사용
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "삭제 실패");
            }

            console.log("✅ [SUCCESS] 삭제 성공:", data);

            // ✅ Redux 상태 즉시 업데이트
            return { subscriptionId, productId }; // 삭제할 아이템 정보 반환
        } catch (error) {
            console.error("❌ [ERROR] 삭제 실패:", error);
            return rejectWithValue(error.message);
        }
    }
);


export const updateBillingDate = createAsyncThunk(
    "subscription/updateBillingDate",
    async ({ subscriptionId, newBillingDate }, { rejectWithValue }) => {
        try {
            console.log("📡 [API 요청] 결제일 업데이트:", { subscriptionId, newBillingDate });

            const response = await fetchWithAuth(`${API_URL}subscription/update-billing-date`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId, newBillingDate }) // ✅ JSON 형식으로 변환
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [ERROR] 결제일 업데이트 실패:", errorText);
                return rejectWithValue(errorText);
            }

            const data = await response.json();
            console.log("✅ [SUCCESS] 결제일 업데이트 성공:", data);
            return data;
        } catch (error) {
            console.error("❌ [ERROR] 결제일 업데이트 실패:", error);
            return rejectWithValue(error.message);
        }
    }
);


export const updateNextPaymentMethod = createAsyncThunk(
    "subscription/updateNextPaymentMethod",
    async ({ subscriptionId, nextPaymentMethod }, { rejectWithValue }) => {
        try {
            console.log("📡 [API 요청] 다음 회차 결제수단 업데이트:", { subscriptionId, nextPaymentMethod });

            const response = await fetchWithAuth(`${API_URL}subscription/update-next-payment-method`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId, nextPaymentMethod }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "결제수단 업데이트 실패");
            }

            console.log("✅ [SUCCESS] 다음 회차 결제수단 업데이트 성공:", data);
            return data; // ✅ Redux 상태 업데이트를 위해 반환
        } catch (error) {
            console.error("❌ [ERROR] 결제수단 업데이트 실패:", error);
            return rejectWithValue(error.message);
        }
    }
);


/**
 * ✅ 배송 주소 업데이트
 */
export const updateDeliveryAddress = createAsyncThunk(
    "subscription/updateDeliveryAddress",
    async ({ subscriptionId, postalCode, roadAddress, detailAddress }, { rejectWithValue }) => {
        try {
            console.log("📡 [API 요청] 배송 주소 업데이트:", { subscriptionId, postalCode, roadAddress, detailAddress });

            const response = await fetchWithAuth(`${API_URL}subscription/update-delivery`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId, postalCode, roadAddress, detailAddress }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "❌ 배송지 업데이트 실패");
            }

            console.log("✅ [SUCCESS] 배송 주소 업데이트 성공:", data);
            return data; // ✅ Redux 상태 업데이트를 위해 데이터 반환
        } catch (error) {
            console.error("❌ [ERROR] 배송 주소 업데이트 실패:", error);
            return rejectWithValue(error.message);
        }
    }
);



const subscriptionSlice = createSlice({
    name: "subscription",
    initialState: {
        data: { nextItems: [], items: [], postalCode: "", roadAddress: "", detailAddress: ""  }, // ✅ 기본값 설정
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
        // ✅ UI 즉시 업데이트를 위한 리듀서 추가
        updateNextItemsDirectly: (state, action) => {
            if (state.data) {
                state.data.nextItems = action.payload;
            }
        },
        updateDetailAddress: (state, action) => {
            state.data.detailAddress = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(addNextSubscriptionItem.fulfilled, (state, action) => {
            console.log("🛠️ Redux 상태 업데이트: addNextSubscriptionItem.fulfilled 실행됨", action.payload);

            // ✅ state.data가 undefined이면 기본값 설정
            if (!state.data) {
                console.error("❌ [ERROR] state.data가 존재하지 않습니다!", state);
                state.data = { nextItems: [] };
            }

            // ✅ state.data.nextItems가 없으면 빈 배열로 초기화
            if (!state.data.nextItems) {
                state.data.nextItems = [];
            }

            // ✅ 동일한 상품이 이미 있는지 확인 후 수량만 증가
            const existingItemIndex = state.data.nextItems.findIndex(
                (item) => item.productId === action.payload.productId
            );

            if (existingItemIndex !== -1) {
                state.data.nextItems[existingItemIndex].nextMonthQuantity += action.payload.nextMonthQuantity;
            } else {
                state.data.nextItems.push(action.payload);
            }

            console.log("✅ [Redux] 업데이트된 nextItems:", state.data.nextItems);
        })
        .addCase(fetchSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload || { nextItems: [], items: [] };

            // ✅ nextItems에서 productId 설정 유지
            if (state.data.nextItems) {
                state.data.nextItems = state.data.nextItems.map(item => {
                    let productId = item.productId ?? (item.product ? item.product.id : null);

                    if (!productId) {
                        const matchedProduct = state.products.find(p => p.name === item.productName);
                        productId = matchedProduct ? matchedProduct.id : null;
                    }

                    return {
                        ...item,
                        productId: productId
                    };
                });
            }

            // ✅ Redux 상태에 배송 주소 정보 저장 추가
            state.data.postalCode = action.payload.postalCode || "";
            state.data.roadAddress = action.payload.roadAddress || "";
            state.data.detailAddress = action.payload.detailAddress || "";

            console.log("🛠 Redux 업데이트된 배송정보:", state.data.postalCode, state.data.roadAddress, state.data.detailAddress);

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
            console.log("✅ [Redux] 수량 업데이트 성공:", action.payload);
            const { subscriptionId, updatedItems } = action.payload;

            if (state.data.id === subscriptionId) {
                state.data.nextItems = updatedItems;
            }
        })
        .addCase(updateNextSubscriptionItems.pending, (state) => {
            state.loading = true;
        })
        .addCase(updateNextSubscriptionItems.rejected, (state, action) => {
            state.loading = false;
            console.error("❌ [ERROR] Redux 상태 업데이트 실패:", action.payload);
        })
        .addCase(processSubscriptionBilling.fulfilled, (state, action) => {
            state.data = action.payload;
        })
        .addCase(fetchProducts.rejected, (state) => {
          state.products = []; // ✅ 실패 시 빈 배열로 초기화
        })
        .addCase(fetchProducts.fulfilled, (state, action) => {
            console.log("🔍 Redux 상태 업데이트: fetchProducts.fulfilled 실행됨", action.payload); // ✅ 디버깅 로그 추가
            state.products = action.payload;  // ✅ Redux 상태에 저장
        })
        .addCase(replaceNextSubscriptionItems.fulfilled, (state, action) => {
            console.log("✅ [Redux] 구독 아이템 교체 완료:", action.payload);
            state.data.nextItems = action.payload;  // ✅ 새로운 아이템으로 교체
        })
        .addCase(replaceNextSubscriptionItems.rejected, (state, action) => {
            console.error("❌ [ERROR] 구독 아이템 교체 실패:", action.payload);
        })
       .addCase(deleteNextSubscriptionItem.fulfilled, (state, action) => {
           console.log("✅ [Redux] 삭제 완료:", action.payload);

           // ✅ 삭제된 항목을 Redux 상태에서 제거
           state.data.nextItems = state.data.nextItems.filter(item => item.productId !== action.payload.productId);
       })
       .addCase(deleteNextSubscriptionItem.rejected, (state, action) => {
           console.error("❌ [ERROR] Redux 상태 업데이트 실패:", action.payload);
       })
       .addCase(updateBillingDate.fulfilled, (state, action) => {
           console.log("✅ [Redux] 결제일 변경 완료:", action.payload);
           state.data.nextBillingDate = action.payload.newBillingDate;
       })
       .addCase(updateBillingDate.rejected, (state, action) => {
           console.error("❌ [ERROR] Redux 상태 업데이트 실패:", action.payload);
       })
        // 다음 회차 결제수단 업데이트
       .addCase(updateNextPaymentMethod.fulfilled, (state, action) => {
           console.log("✅ [Redux] 다음 회차 결제수단 업데이트 완료:", action.payload);
           state.data.nextPaymentMethod = action.payload.nextPaymentMethod;
       })
       .addCase(updateNextPaymentMethod.rejected, (state, action) => {
           console.error("❌ [ERROR] Redux 상태 업데이트 실패:", action.payload);
       })
       .addCase(updateDeliveryAddress.fulfilled, (state, action) => {
           console.log("🛠️ Redux 상태 업데이트: updateDeliveryAddress.fulfilled 실행됨", action.payload);

           // ✅ 서버 응답에서 주소 데이터가 없으면 기존 값 유지
           if (!action.payload.postalCode || !action.payload.roadAddress) {
               console.error("❌ [ERROR] Redux 상태 업데이트 실패: 서버 응답에 주소 데이터 없음", action.payload);
               return;
           }

           // ✅ Redux 상태 업데이트 (기존 데이터 유지)
           state.data = {
               ...state.data,
               postalCode: action.payload.postalCode,
               roadAddress: action.payload.roadAddress,
               detailAddress: action.payload.detailAddress || state.data.detailAddress // 기존 상세 주소 유지
           };

           console.log("✅ [Redux] 업데이트된 배송 정보:", state.data);
       })
    },
});
export const { setSelectedProduct, setSelectedQuantity, updateDetailAddress } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
