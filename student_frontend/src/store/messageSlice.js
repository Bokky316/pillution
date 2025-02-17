import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";

/**
 * 보낸 메시지를 가져오는 비동기 액션 (createAsyncThunk)
 * - 서버 API를 호출하여 특정 사용자가 보낸 메시지 목록을 가져옴
 * - 요청 성공 시: 서버에서 받은 메시지 목록을 payload로 하여 fulfilled 액션 디스패치
 * - 요청 실패 시: 에러 메시지를 payload로 하여 rejected 액션 디스패치
 * @param {string} userId - 메시지를 가져올 사용자 ID (필수)
 * @returns {Promise<Array>} - 서버에서 받은 메시지 목록을 담은 Promise
 */
export const fetchSentMessages = createAsyncThunk(
    'messages/fetchSentMessages',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/sent/${userId}`);
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다');
            }
            const data = await response.json();
            console.log('✅ fetchSentMessages 액션 성공:', data);  // 성공 로그 추가
            return data;
        } catch (error) {
            console.error('❌ fetchSentMessages 액션 실패:', error);  // 실패 로그 추가
            return rejectWithValue(error.message);
        }
    }
);

/**
 * messages 슬라이스(Slice) 정의
 * 슬라이스(Slice)는 Redux Toolkit에서 도입된 개념으로, Redux 상태의 한 부분을(메시지 목록) 관리하기 위한 로직을 모아놓은 단위입니다.
 * 메시지 상태를 Redux에서 관리,
 * - 전체 메시지 목록을 저장하는 messages 상태
 * - 읽지 않은 메시지 목록을 저장하는 unreadMessages 상태
 * - 보낸 메시지 목록을 저장하는 sentMessages 상태
 * - 읽지 않은 메시지 개수를 저장하는 unreadCount 상태
 * - API 요청 상태를 저장하는 loading 상태
 * - API 요청 에러를 저장하는 error 상태
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
         * 전체 메시지 목록 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 새로운 메시지 목록을 받음
         */
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.unreadMessages = action.payload.filter(msg => !msg.read);
            state.unreadCount = state.unreadMessages.length;
        },
        /**
         * 새 메시지 추가
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 새 메시지 객체를 받음
         */
        addMessage: (state, action) => {
            state.messages.push(action.payload);
            if (!action.payload.read) {
                state.unreadMessages.push(action.payload);
                state.unreadCount += 1;
            }
        },
        /**
         * 메시지를 읽음으로 표시
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 읽음 처리할 메시지 ID를 받음
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
         * 읽지 않은 메시지 목록 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 읽지 않은 메시지 목록을 받음
         */
        setUnreadMessages: (state, action) => {
            state.unreadMessages = action.payload;
            state.unreadCount = action.payload.length;
        },
        /**
         * 읽지 않은 메시지 개수 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 읽지 않은 메시지 개수를 받음
         */
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        /**
         * 보낸 메시지 목록 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체, action.payload로 보낸 메시지 목록을 받음
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
 * - Redux store에서 보낸 메시지 목록을 선택하는 selector
 * - useSelector 훅과 함께 사용하여 컴포넌트에서 보낸 메시지 목록에 접근 가능
 * @param {Object} state - Redux store의 전체 상태
 * @returns {Array} - 보낸 메시지 목록
 */
export const selectSentMessages = (state) => state.messages.sentMessages;
