import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

/**
 * 사용자의 채팅방 목록을 가져오는 비동기 thunk 액션
 * @returns {Promise<Array>} 채팅방 목록
 */
export const fetchChatRooms = createAsyncThunk(
    'chat/fetchChatRooms',
    async () => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/user`);
        if (!response.ok) throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
        return response.json();
    }
);

/**
 * 특정 채팅방의 메시지를 가져오는 비동기 thunk 액션
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise<Object>} 채팅방 ID와 메시지 목록
 */
export const selectChatRoom = createAsyncThunk(
    'chat/selectChatRoom',
    async (roomId) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`);
        if (!response.ok) throw new Error('채팅 메시지를 불러오는데 실패했습니다.');
        return { roomId, messages: await response.json() };
    }
);

/**
 * 새 메시지를 전송하는 비동기 thunk 액션
 * @param {Object} messageData - 메시지 데이터
 * @param {number} messageData.roomId - 채팅방 ID
 * @param {string} messageData.content - 메시지 내용
 * @returns {Promise<Object>} 전송된 메시지 정보
 */
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ roomId, content, senderId }) => { // senderId 파라미터 추가
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, senderId }) // 요청 body에 senderId 포함
        });
        if (!response.ok) throw new Error('메시지 전송에 실패했습니다.');
        return response.json();
    }
);

/**
 * 새 채팅방을 생성하는 비동기 thunk 액션
 * @param {Object} roomData - 채팅방 데이터
 * @param {string} roomData.name - 채팅방 이름
 * @param {Array<number>} roomData.participantIds - 참가자 ID 목록
 * @returns {Promise<Object>} 생성된 채팅방 정보
 */
export const createChatRoom = createAsyncThunk(
    'chat/createChatRoom',
    async ({ name, participantIds }) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms`, {
            method: 'POST',
            body: JSON.stringify({ name, participantIds })
        });
        if (!response.ok) throw new Error('채팅방 생성에 실패했습니다.');
        return response.json();
    }
);

/**
 * 채팅방을 나가는 비동기 thunk 액션
 * @param {number} roomId -
 * @returns {Promise<number>} 나간 채팅방 ID
 */
export const leaveChatRoom = createAsyncThunk(
    'chat/leaveChatRoom',
    async (roomId) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/leave`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('채팅방 나가기에 실패했습니다.');
        return roomId;
    }
);

/**
 * 채팅 관련 상태를 관리하는 Redux 슬라이스
 */
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chatRooms: [],      // 사용자의 채팅방 목록
        selectedRoom: null, // 현재 선택된 채팅방 ID
        messages: [],        // 현재 채팅방의 메시지 목록
        status: 'idle',      // 비동기 작업 상태 ('idle', 'loading', 'succeeded', 'failed')
        error: null ,         // 오류 메시지
        unreadMessages: []  // 읽지 않은 메시지
    },
    reducers: {
        /**
         * 새 메시지를 현재 채팅방에 추가
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        addMessage: (state, action) => {
              const newMessage = action.payload;
              const existingMessage = state.messages.find(msg => msg.id === newMessage.id);
              if (!existingMessage) {
                state.messages.push(newMessage);
              }
            },
        /**
         * 채팅방 목록을 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
        },
        /**
         * 메시지 목록을 설정
         * @param {Object} state - 현재 상태
         * @param {Object} action - 액션 객체
         */
        setMessages: (state, action) => {
            state.messages = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchChatRooms 액션 처리
            .addCase(fetchChatRooms.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChatRooms.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.chatRooms = action.payload;
            })
            .addCase(fetchChatRooms.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // selectChatRoom 액션 처리
            .addCase(selectChatRoom.fulfilled, (state, action) => {
                state.selectedRoom = action.payload.roomId;
                state.messages = action.payload.messages;
            })
            // sendMessage 액션 처리
            .addCase(sendMessage.fulfilled, (state, action) => {
                // 필요하다면 메시지 전송 성공 후 추가적인 상태 업데이트
                console.log("sendMessage.fulfilled", action.payload);
            })
            // createChatRoom 액션 처리
            .addCase(createChatRoom.fulfilled, (state, action) => {
                state.chatRooms.push(action.payload);
            })
            // leaveChatRoom 액션 처리 부분 수정
            .addCase(leaveChatRoom.fulfilled, (state, action) => {
                // action.payload는 단순 roomId입니다 (thunk에서 반환한 값)
                state.chatRooms = state.chatRooms.filter(room => room.id !== action.payload);
                if (state.selectedRoom === action.payload) {
                    state.selectedRoom = null;
                    state.messages = [];
                }
            });
    }
});

export const { addMessage, setChatRooms, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
