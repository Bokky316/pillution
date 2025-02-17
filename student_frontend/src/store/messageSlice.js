import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";

/**
 * 보낸 메시지를 가져오는 비동기 액션
 * @param {string} userId - 메시지를 가져올 사용자 ID
 * @returns {Promise<Array>} - 서버에서 받은 메시지 목록을 담은 Promise
 */
export const fetchSentMessages = createAsyncThunk(
    'messages/fetchSentMessages',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/sent/${userId}`);
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다.');
            }
            return await response.json(); // JSON으로 파싱된 데이터 반환
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * 받은 메시지를 가져오는 비동기 액션
 * @param {string} userId - 메시지를 가져올 사용자 ID
 * @returns {Promise<Array>} - 서버에서 받은 메시지 목록을 담은 Promise
 */
export const fetchReceivedMessages = createAsyncThunk(
    'messages/fetchReceivedMessages',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/${userId}`);
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다.');
            }
            return await response.json(); // JSON으로 파싱된 데이터 반환
        } catch (error) {
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
        /**
         * 메시지 목록을 설정하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.unreadMessages = action.payload.filter(msg => !msg.read);
            state.unreadCount = state.unreadMessages.length;
        },
        /**
         * 새 메시지를 추가하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        addMessage: (state, action) => {
            state.messages.push(action.payload);
            if (!action.payload.read) {
                state.unreadMessages.push(action.payload);
                state.unreadCount += 1;
            }
        },
        /**
         * 메시지를 읽음 처리하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        markMessageAsRead: (state, action) => {
            const messageId = action.payload;
            state.messages = state.messages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
            );
            state.unreadMessages = state.unreadMessages.filter(msg => msg.id !== messageId);
            state.unreadCount = state.unreadMessages.length;
        },
        /**
         * 읽지 않은 메시지 목록을 설정하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        setUnreadMessages: (state, action) => {
            state.unreadMessages = action.payload;
            state.unreadCount = action.payload.length;
        },
        /**
         * 읽지 않은 메시지 개수를 설정하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        /**
         * 보낸 메시지 목록을 설정하는 리듀서
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
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
                if (Array.isArray(action.payload)) {
                    state.sentMessages = action.payload;
                } else {
                    console.error('Received payload is not an array:', action.payload);
                    state.sentMessages = []; // 또는 적절한 기본값 설정
                }
                state.error = null;
            })
            .addCase(fetchSentMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchReceivedMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReceivedMessages.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.messages = action.payload;
                    state.unreadMessages = action.payload.filter(msg => !msg.read);
                    state.unreadCount = state.unreadMessages.length;
                } else {
                    console.error('Received payload is not an array:', action.payload);
                    state.messages = []; // 또는 적절한 기본값 설정
                    state.unreadMessages = [];
                    state.unreadCount = 0;
                }
                state.error = null;
            })
            .addCase(fetchReceivedMessages.rejected, (state, action) => {
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

/**
 * 받은 메시지 목록 선택자
 * @param {Object} state - Redux store의 전체 상태
 * @returns {Array} - 받은 메시지 목록
 */
export const selectReceivedMessages = (state) => state.messages.messages;

/**
 * 읽지 않은 메시지 개수 선택자
 * @param {Object} state - Redux store의 전체 상태
 * @returns {number} - 읽지 않은 메시지 개수
 */
export const selectUnreadCount = (state) => state.messages.unreadCount;
