// postEditSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/fetchWithAuth';
import { API_URL } from "@/utils/constants";

// 게시글 조회 비동기 액션
export const fetchPost = createAsyncThunk(
    'postEdit/fetchPost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}posts/${postId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData);
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message || '게시글 조회 실패');
        }
    }
);

// 게시글 수정 비동기 액션
export const updatePost = createAsyncThunk(
    'postEdit/updatePost',
    async ({ postId, updateData, token, isAdmin }, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': token, // Use token as user id
                    'X-User-Is-Admin': isAdmin.toString(), // Convert isAdmin to string
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData);
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message || '게시글 수정 실패');
        }
    }
);

const postEditSlice = createSlice({
    name: 'postEdit',
    initialState: {
        formData: {
            title: '',
            content: '',
            category: '',
            subCategory: '전체',
            boardId: null
        },
        isAdmin: false,
        loading: false,
        error: null,
        openCancelDialog: false,
        openEditDialog: false
    },
    reducers: {
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        },
        setOpenCancelDialog: (state, action) => {
            state.openCancelDialog = action.payload;
        },
        setOpenEditDialog: (state, action) => {
            state.openEditDialog = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.loading = false;
                state.formData = {
                    title: action.payload.title,
                    content: action.payload.content,
                    category: action.payload.boardId === 1 ? '공지사항' : '자주 묻는 질문',
                    subCategory: action.payload.category || '전체',
                    boardId: action.payload.boardId
                };
            })
            .addCase(fetchPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setFormData,
    setIsAdmin,
    setOpenCancelDialog,
    setOpenEditDialog
} = postEditSlice.actions;

export default postEditSlice.reducer;
