import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPostDetail = createAsyncThunk(
    'postDetail/fetchPostDetail',
    async (postId, { rejectWithValue }) => {
        try {
            const [postResponse, postsResponse] = await Promise.all([
                axios.get(`http://localhost:8080/api/posts/${postId}`),
                axios.get(`http://localhost:8080/api/posts/board/1?page=0&size=100`)
            ]);

            const posts = postsResponse.data.dtoList;
            const currentIndex = posts.findIndex(post => post.id === parseInt(postId));

            return {
                post: postResponse.data,
                prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
                nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
            };
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deletePost = createAsyncThunk(
    'postDetail/deletePost',
    async ({ postId, token }, { rejectWithValue }) => {
        try {
            await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return postId;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const postDetailSlice = createSlice({
    name: 'postDetail',
    initialState: {
        post: null,
        prevPost: null,
        nextPost: null,
        loading: false,
        error: null,
        isAdmin: false
    },
    reducers: {
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPostDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.post = action.payload.post;
                state.prevPost = action.payload.prevPost;
                state.nextPost = action.payload.nextPost;
            })
            .addCase(fetchPostDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deletePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePost.fulfilled, (state) => {
                state.loading = false;
                state.post = null;
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setIsAdmin } = postDetailSlice.actions;
export default postDetailSlice.reducer;