import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNewsPosts = createAsyncThunk(
    'news/fetchNewsPosts',
    async ({ page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/posts/board/1?page=${page}&size=${size}`);
            return {
                posts: response.data.dtoList,
                totalPages: response.data.totalPages
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteNewsPost = createAsyncThunk(
    'news/deleteNewsPost',
    async (postId, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.delete(`http://localhost:8080/api/posts/${postId}`);

            if (response.status === 204) {
                // 삭제 후 다시 게시물 불러오기
                dispatch(fetchNewsPosts({ page: 0 }));
                return postId;
            }
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const newsSlice = createSlice({
    name: 'news',
    initialState: {
        posts: [],
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 0
    },
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        // fetchNewsPosts 관련 리듀서
        builder.addCase(fetchNewsPosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchNewsPosts.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload.posts;
            state.totalPages = action.payload.totalPages;
        });
        builder.addCase(fetchNewsPosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // deleteNewsPost 관련 리듀서
        builder.addCase(deleteNewsPost.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteNewsPost.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(deleteNewsPost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const { setCurrentPage } = newsSlice.actions;
export default newsSlice.reducer;