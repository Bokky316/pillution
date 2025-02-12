import { createSlice } from '@reduxjs/toolkit';

const boardSlice = createSlice({
    name: 'board',
    initialState: {
        currentBoard: 'news'
    },
    reducers: {
        setCurrentBoard: (state, action) => {
            state.currentBoard = action.payload;
        }
    }
});

export const { setCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;