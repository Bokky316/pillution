import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

/**
 * 장바구니 아이템 목록을 가져오는 비동기 액션
 * @returns {Promise<Array>} 장바구니 아이템 목록
 */
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cart items: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('fetchCartItems.fulfilled payload:', data); // 추가된 로깅
      return data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니에 상품을 추가하는 비동기 액션
 * @param {Object} cartItemDto - 장바구니에 추가할 상품 정보
 * @returns {Promise<Object>} 추가된 장바구니 아이템 정보
 */
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartItemDto, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItemDto),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add item to cart: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
       console.log('addToCart.fulfilled payload:', data); // 추가된 로깅
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 아이템 수량을 수정하는 비동기 액션
 * @param {Object} params - 수정할 장바구니 아이템 정보
 * @param {number} params.cartItemId - 수정할 장바구니 아이템 ID
 * @param {number} params.count - 변경할 수량
 * @returns {Promise<number>} 수정된 장바구니 아이템 ID
 */
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, count }, { rejectWithValue }) => {
    try {
      console.log('Updating cart item:', cartItemId, 'with count:', count);

      const response = await fetchWithAuth(`${API_URL}cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }), // 요청 바디에 count 를 담아서 보냄
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update cart item: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('updateCartItem.fulfilled payload:', data); // 추가된 로깅
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 아이템을 삭제하는 비동기 액션
 * @param {number} cartItemId - 삭제할 장바구니 아이템 ID
 * @returns {Promise<number>} 삭제된 장바구니 아이템 ID
 */
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (cartItemId, { rejectWithValue }) => {
    try {
      console.log('Removing cart item:', cartItemId);

      const response = await fetchWithAuth(`${API_URL}cart/${cartItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove cart item: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('removeCartItem.fulfilled payload:', data); // 추가된 로깅
      return data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 상품을 주문하는 비동기 액션
 * @param {Object} cartOrderRequestDto - 주문할 장바구니 아이템 정보
 * @param {string} purchaseType - 구매 유형 (일회성 또는 구독)
 * @returns {Promise<number>} 생성된 주문 ID
 */
export const orderCartItems = createAsyncThunk(
  'cart/orderCartItems',
  async ({cartOrderRequestDto, purchaseType}, { rejectWithValue }) => {
    try {
      // purchaseType을 쿼리 파라미터로 전달
      const response = await fetchWithAuth(`${API_URL}cart/orders?purchaseType=${purchaseType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartOrderRequestDto),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to order cart items: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('orderCartItems.fulfilled payload:', data); // 추가된 로깅
      // 주문 ID 반환
      return data;
    } catch (error) {
      console.error('Error ordering cart items:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 슬라이스 정의
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
      selectCartItem: (state, action) => {
        const { cartItemId, selected } = action.payload;
        const item = state.items.find(item => item.cartItemId === cartItemId);
        if (item) {
          item.selected = selected;
        }
      },
      selectAllCartItems: (state, action) => {
        const selected = action.payload;
        state.items.forEach(item => {
          item.selected = selected;
        });
      },
    },
  extraReducers: (builder) => {
    builder
      // 장바구니 아이템 불러오기 - 로딩 상태
      .addCase(fetchCartItems.pending, (state) => {
        state.status = 'loading';
      })
      // 장바구니 아이템 불러오기 - 성공
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      // 장바구니 아이템 불러오기 - 실패
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // 장바구니에 아이템 추가 - 성공
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // 장바구니 아이템 수량 업데이트 - 성공
      .addCase(updateCartItem.fulfilled, (state, action) => {
        console.log('updateCartItem.fulfilled payload:', action.payload);
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.cartItemId === updatedItem.cartItemId);
        if (index !== -1) {
          console.log('Updating item at index:', index);
          state.items[index] = { ...state.items[index], ...updatedItem };
        } else {
          console.log('Item not found in state:', updatedItem);
        }
      })

      // 장바구니에서 아이템 제거 - 성공
      .addCase(removeCartItem.fulfilled, (state, action) => {
        console.log('removeCartItem.fulfilled payload:', action.payload);
        // action.payload는 삭제된 cartItemId
        state.items = state.items.filter(item => item.cartItemId !== action.payload);
      })
      // 장바구니 아이템 주문 - 성공
       .addCase(orderCartItems.fulfilled, (state, action) => {
        console.log('orderCartItems.fulfilled payload:', action.payload);
        state.items = state.items.filter(item => !item.selected); // 선택된 아이템 제거
        return action.payload; // 주문 ID 반환
      })
      // 장바구니 아이템 주문 - 실패
      .addCase(orderCartItems.rejected, (state, action) => {
        console.log('orderCartItems.rejected payload:', action.payload);
          state.error = action.payload;
      });
  },
});

export const { selectCartItem, selectAllCartItems } = cartSlice.actions;
export default cartSlice.reducer;
