import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

// createPost 액션 생성
export const createPost = createAsyncThunk(
    'postCreate/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue({
                message: error.message || '게시물 등록에 실패했습니다.',
                status: error.status
            });
        }
    }
);

const postCreateSlice = createSlice({
    name: 'postCreate',
    initialState: {
        formData: {
            title: '',
            content: '',
            category: '공지사항',
            subCategory: '',
            boardId: 1,
            authorId: null,
        },
        isAdmin: false,
        authorId: null,
        openCancelDialog: false,
        openSubmitDialog: false,
        loading: false,
        error: null,
    },
    reducers: {
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        },
        setAuthorId: (state, action) => {
            state.authorId = action.payload;
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
                title: '',
                content: '',
                category: '공지사항',
                subCategory: '',
                boardId: 1,
                authorId: state.authorId,
            };
            state.openCancelDialog = false;
            state.openSubmitDialog = false;
            state.error = null;
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