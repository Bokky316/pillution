import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";

/**
 * 보낸 메시지를 가져오는 비동기 액션 (createAsyncThunk)
 * @param {string} userId - 메시지를 가져올 사용자 ID
 * @returns {Promise<Array>} - 서버에서 받은 메시지 목록을 담은 Promise
 */
export const fetchSentMessages = createAsyncThunk(
    'messages/fetchSentMessages',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/sent/${userId}`);
            console.log('✅ fetchSentMessages 액션 성공:', response);
            return response;
        } catch (error) {
            console.error('❌ fetchSentMessages 액션 실패:', error);
            return rejectWithValue(error.message);
        }
    }
);

/**
 * messages 슬라이스(Slice) 정의
 */
const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
        sentMessages: [],
        unreadMessages: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.unreadMessages = action.payload.filter(msg => !msg.read);
            state.unreadCount = state.unreadMessages.length;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
            if (!action.payload.read) {
                state.unreadMessages.push(action.payload);
                state.unreadCount += 1;
            }
        },
        markMessageAsRead: (state, action) => {
            const messageId = action.payload;
            state.messages = state.messages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
            );
            state.unreadMessages = state.unreadMessages.filter(msg => msg.id !== messageId);
            state.unreadCount = state.unreadMessages.length;
        },
        setUnreadMessages: (state, action) => {
            state.unreadMessages = action.payload;
            state.unreadCount = action.payload.length;
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
                setSentMessages: (state, action) => {
                    state.sentMessages = action.payload;
                },
            },
            extraReducers: (builder) => {
                builder
                    .addCase(fetchSentMessages.pending, (state) => {
                        state.loading = true;
                    })
                    .addCase(fetchSentMessages.fulfilled, (state, action) => {
                        state.loading = false;
                        state.sentMessages = action.payload;
                        state.error = null;
                    })
                    .addCase(fetchSentMessages.rejected, (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                    });
            },
        });

        // 액션 생성자 내보내기
        export const {
            setMessages,
            addMessage,
            markMessageAsRead,
            setUnreadMessages,
            setUnreadCount,
            setSentMessages
        } = messageSlice.actions;

        export default messageSlice.reducer;

        /**
         * 보낸 메시지 목록 선택자
         * @param {Object} state - Redux store의 전체 상태
         * @returns {Array} - 보낸 메시지 목록
         */
        export const selectSentMessages = (state) => state.messages.sentMessages;

