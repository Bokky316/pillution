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
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 아이템 수량을 수정하는 비동기 액션
 * @param {Object} params - 수정할 장바구니 아이템 정보
 * @param {number} params.cartItemId - 수정할 장바구니 아이템 ID
 * @param {number} params.count - 변경할 수량
 * @returns {Promise<Object>} 수정된 장바구니 아이템 정보
 */
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, count }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to update cart item: ${response.status} - ${errorText}`);
      }
      return { cartItemId, count };
    } catch (error) {
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
      const response = await fetchWithAuth(`${API_URL}cart/${cartItemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to remove cart item: ${response.status} - ${errorText}`);
      }
      return cartItemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 장바구니 상품을 주문하는 비동기 액션
 * @param {Object} cartOrderRequestDto - 주문할 장바구니 아이템 정보
 * @returns {Promise<number>} 생성된 주문 ID
 */
export const orderCartItems = createAsyncThunk(
  'cart/orderCartItems',
  async (cartOrderRequestDto, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart/orders`, {
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
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 장바구니 슬라이스 정의
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { cartItemId, count } = action.payload;
        const item = state.items.find(item => item.id === cartItemId);
        if (item) item.quantity = count;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default cartSlice.reducer;
