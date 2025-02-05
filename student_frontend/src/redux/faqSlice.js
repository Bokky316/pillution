import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching FAQ posts
export const fetchFAQPosts = createAsyncThunk(
    'faq/fetchFAQPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("http://localhost:8080/api/posts/faq");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for deleting a FAQ post
export const deleteFAQPost = createAsyncThunk(
    'faq/deleteFAQPost',
    async (postId, { rejectWithValue }) => {
        try {
            await axios.delete(`http://localhost:8080/api/posts/${postId}`);
            return postId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const faqSlice = createSlice({
    name: 'faq',
    initialState: {
        posts: [],
        filteredPosts: [],
        selectedCategory: '전체',
        expandedPosts: {},
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
            if (action.payload === "전체") {
                state.filteredPosts = state.posts;
            } else {
                state.filteredPosts = state.posts.filter(
                    post => post.category === action.payload
                );
            }
        },
        togglePost: (state, action) => {
            state.expandedPosts[action.payload] = !state.expandedPosts[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFAQPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFAQPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
                state.filteredPosts = action.payload;
            })
            .addCase(fetchFAQPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteFAQPost.fulfilled, (state, action) => {
                state.posts = state.posts.filter(post => post.id !== action.payload);
                state.filteredPosts = state.filteredPosts.filter(
                    post => post.id !== action.payload
                );
            });
    },
});

export const { setSelectedCategory, togglePost } = faqSlice.actions;
export default faqSlice.reducer;