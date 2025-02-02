import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    menuAnchorEl: null,
  },
  reducers: {
    setMenuAnchor: (state, action) => {
      state.menuAnchorEl = action.payload;
    },
  },
});

export const { setMenuAnchor } = uiSlice.actions;
export default uiSlice.reducer;
