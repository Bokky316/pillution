import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchNewsPosts = createAsyncThunk(
    'news/fetchNewsPosts',
    async ({ page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/posts/board/1?page=${page}&size=${size}`);
            return {
                posts: response.data.dtoList,
                totalPages: response.data.totalPages
            };
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: '서버 연결에 실패했습니다.' });
        }
    }
);

export const deleteNewsPost = createAsyncThunk(
    'news/deleteNewsPost',
    async (postId, { dispatch, rejectWithValue }) => {
        try {
            console.log("Sending delete request for post:", postId);
            const response = await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            console.log("Delete response:", response);

            if (response.status === 204) {
                dispatch(fetchNewsPosts({ page: 0 }));
                return postId;
            }
        } catch (error) {
            console.error("Delete request failed:", error.response || error);
            return rejectWithValue(error.response?.data || { message: '삭제에 실패했습니다.' });
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
        totalPages: 0,
        deleteStatus: 'idle',
        deleteError: null
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
            state.error = action.payload?.message || '게시글을 불러오는데 실패했습니다.';
        });

        // deleteNewsPost 관련 리듀서
        builder.addCase(deleteNewsPost.pending, (state) => {
            state.loading = true;
            state.deleteStatus = 'loading';
            state.deleteError = null;
        });
        builder.addCase(deleteNewsPost.fulfilled, (state) => {
            state.loading = false;
            state.deleteStatus = 'succeeded';
            state.deleteError = null;
        });
        builder.addCase(deleteNewsPost.rejected, (state, action) => {
            state.loading = false;
            state.deleteStatus = 'failed';
            state.deleteError = action.payload?.message || '삭제에 실패했습니다.';
        });
    }
});

export const { setCurrentPage } = newsSlice.actions;
export default newsSlice.reducer;