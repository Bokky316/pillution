import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

// 액션: 사용자의 채팅방 목록을 가져오는 비동기 thunk
export const fetchChatRooms = createAsyncThunk(
    'chat/fetchChatRooms',
    async (userId) => { // userId 파라미터 추가
        const response = await fetchWithAuth(`${API_URL}chat/rooms/user/${userId}`); // 사용자 ID를 파라미터로 전달
        return response.json();
    }
);

// 액션: 새 메시지를 전송하는 비동기 thunk
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ roomId, content, senderId }) => { // senderId 파라미터 추가
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, senderId }) // 요청 body에 senderId 포함
        });
        return response.json();
    }
);

// 액션: 특정 채팅방의 메시지를 가져오는 비동기 thunk
export const selectChatRoom = createAsyncThunk(
    'chat/selectChatRoom',
    async (roomId) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`);
        return { roomId, messages: await response.json() };
    }
);

// 액션: 새 채팅방을 생성하는 비동기 thunk
export const createChatRoom = createAsyncThunk(
    'chat/createChatRoom',
    async ({ name, participantIds }) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms`, {
            method: 'POST',
            body: JSON.stringify({ name, participantIds })
        });
        return response.json();
    }
);

// 액션: 채팅방을 나가는 비동기 thunk
export const leaveChatRoom = createAsyncThunk(
    'chat/leaveChatRoom',
    async (roomId) => {
        await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/leave`, {
            method: 'POST'
        });
        return roomId;
    }
);

// 슬라이스
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chatRooms: [],
        selectedRoom: null,
        messages: [],
        status: 'idle',
        error: null
    },
    reducers: {
        // 리듀서: 새 메시지를 추가하는 액션
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatRooms.fulfilled, (state, action) => {
                state.chatRooms = action.payload;
                state.status = 'succeeded';
            })
            .addCase(selectChatRoom.fulfilled, (state, action) => {
                state.selectedRoom = action.payload.roomId;
                state.messages = action.payload.messages;
                state.status = 'succeeded';
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload);
                state.status = 'succeeded';
            })
            .addCase(createChatRoom.fulfilled, (state, action) => {
                state.chatRooms.push(action.payload);
                state.status = 'succeeded';
            })
            .addCase(leaveChatRoom.fulfilled, (state, action) => {
                state.chatRooms = state.chatRooms.filter(room => room.id !== action.payload);
                state.selectedRoom = null;
                state.messages = [];
                state.status = 'succeeded';
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.status = 'loading';
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                }
            )
    }
});

// 액션 생성자 내보내기
export const { addMessage } = chatSlice.actions;

// 리듀서 내보내기
export default chatSlice.reducer;
