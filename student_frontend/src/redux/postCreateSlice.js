import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 게시글 생성 비동기 액션
export const createPost = createAsyncThunk(
    'postCreate/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const userData = JSON.parse(localStorage.getItem('loggedInUser'));
            const token = userData.token;

            const response = await axios.post(
                "http://localhost:8080/api/posts",
                postData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || '게시글 생성 실패');
        }
    }
);

const postCreateSlice = createSlice({
    name: 'postCreate',
    initialState: {
        formData: {
            title: "",
            content: "",
            category: "공지사항",
            boardId: 1,
            subCategory: "",
            authorId: null,
        },
        loading: false,
        error: null,
        isAdmin: false,
        openCancelDialog: false,
        openSubmitDialog: false,
    },
    reducers: {
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        },
        setAuthorId: (state, action) => {
            state.formData.authorId = action.payload;
        },
        setOpenCancelDialog: (state, action) => {
            state.openCancelDialog = action.payload;
        },
        setOpenSubmitDialog: (state, action) => {
            state.openSubmitDialog = action.payload;
        },
        resetForm: (state) => {
            state.formData = {
                title: "",
                content: "",
                category: "공지사항",
                boardId: 1,
                subCategory: "",
                authorId: state.formData.authorId,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFormData,
    setIsAdmin,
    setAuthorId,
    setOpenCancelDialog,
    setOpenSubmitDialog,
    resetForm,
} = postCreateSlice.actions;

export default postCreateSlice.reducer;