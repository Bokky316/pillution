import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

// 액션: 사용자의 채팅방 목록을 가져오는 비동기 thunk
export const fetchChatRooms = createAsyncThunk(
    'chat/fetchChatRooms',
    async (userId) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/user/${userId}`);
        return response.json();
    }
);

// 액션: 새 메시지를 전송하는 비동기 thunk
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ roomId, content, senderId }) => {
        const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, senderId })
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
        error: null,
        typingStatus: {},
        unreadCount: {} // 채팅방별 읽지 않은 메시지 수 추가
    },
    reducers: {
            addMessage: (state, action) => {
                state.messages.push(action.payload);
                // 읽지 않은 메시지 수 증가
                const roomId = action.payload.roomId;
                state.unreadCount[roomId] = (state.unreadCount[roomId] || 0) + 1;
            },
            setTypingStatusDirect: (state, action) => {
                const { roomId, senderId, typing } = action.payload;
                state.typingStatus[roomId] = { senderId, typing };
            },
            markMessageAsRead: (state, action) => {
                const { roomId, messageId } = action.payload;
                const message = state.messages.find(msg => msg.id === messageId && msg.roomId === roomId);
                if (message) {
                    message.read = true;
                    // 읽지 않은 메시지 수 감소
                    state.unreadCount[roomId] = Math.max((state.unreadCount[roomId] || 0) - 1, 0);
                }
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
                    // 해당 채팅방의 읽지 않은 메시지 수 제거
                    delete state.unreadCount[action.payload];
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

    export const { addMessage, setTypingStatusDirect, markMessageAsRead } = chatSlice.actions;

    export default chatSlice.reducer;