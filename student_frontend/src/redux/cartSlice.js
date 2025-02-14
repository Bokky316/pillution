import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: []
    },
    reducers: {
        initializeCart: (state, action) => {
            state.items = action.payload.map(item => ({
                ...item,
                selected: true,
                totalPrice: item.price * item.quantity
            }));
        },
        addItem: (state, action) => {
            const newItem = action.payload;
            const existingItem = state.items.find(item => item.id === newItem.id);
            if (existingItem) {
                existingItem.quantity += newItem.quantity;
                existingItem.totalPrice = existingItem.price * existingItem.quantity;
            } else {
                state.items.push({ ...newItem, selected: true, totalPrice: newItem.price * newItem.quantity });
            }
        },
        removeItem: (state, action) => {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id);
        },
        updateItemQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) {
                item.quantity = quantity;
                item.totalPrice = item.price * quantity;
            }
        },
        updateItemSelection: (state, action) => {
            const { id, selected } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) {
                item.selected = selected;
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const {
    initializeCart,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemSelection,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
