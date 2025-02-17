import { createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth, fetchWithoutAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";

/**
 * messages 슬라이스(Slice) 정의
 * 슬라이스(Slice)는 Redux Toolkit에서 도입된 개념으로, Redux 상태의 한 부분을(메시지 목록) 관리하기 위한 로직을 모아놓은 단위입니다.
 * 메시지 상태를 Redux에서 관리,
 * - 전체 메시지 목록을 저장하는 messages 상태
 * - 읽지 않은 메시지 목록을 저장하는 unreadMessages 상태
 * - 보낸 메시지 목록을 저장하는 sentMessages 상태
 * - 메시지를 추가하는 addMessage 액션
 * - 메시지를 읽음으로 표시하는 markMessageAsRead 액션
 * - 메시지 목록을 설정하는 setMessages 액션
 * - 보낸 메시지 목록을 설정하는 setSentMessages 액션
 *
 * @type {Slice<{unreadMessages: *[], messages: *[], sentMessages: *[], unreadCount: number}, {setMessages: reducers.setMessages, addMessage: reducers.addMessage, markMessageAsRead: reducers.markMessageAsRead, setSentMessages: reducers.setSentMessages, setUnreadMessages: reducers.setUnreadMessages, setUnreadCount: reducers.setUnreadCount}, string, string, SliceSelectors<{unreadMessages: *[], messages: *[], sentMessages: *[], unreadCount: number}>>}
 */
const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [], // 전체 메시지 목록
        unreadMessages: [], // 읽지 않은 메시지 목록
        sentMessages: [], // 보낸 메시지 목록
        unreadCount: 0,  // 읽지 않은 메시지 개수를 저장하는 상태
    },

    reducers: {
        // 전체 메시지 목록 설정, 읽지 않은 메시지 목록 설정
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.unreadMessages = action.payload.filter(msg => !msg.read);
            state.unreadCount = state.unreadMessages.length;
        },
        // 보낸 메시지 목록 설정
        setSentMessages: (state, action) => {
            state.sentMessages = action.payload;
        },
        // 새 메시지 추가
        addMessage: (state, action) => {
            state.messages.push(action.payload);
            if (!action.payload.read) {
                state.unreadMessages.push(action.payload);
                state.unreadCount += 1;
            }
        },
        // 메시지를 읽음으로 표시
        markMessageAsRead: (state, action) => {
            const messageId = action.payload;
            state.messages = state.messages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
            );
            state.unreadMessages = state.unreadMessages.filter(msg => msg.id !== messageId);
            state.unreadCount = state.unreadMessages.length;
        },
        // 읽지 않은 메시지 목록 설정
        setUnreadMessages: (state, action) => {
            console.log("✅ messageSlice setUnreadMessages 실행됨", action.payload);
            state.unreadMessages = action.payload;
            state.unreadCount = action.payload.length;
        },
        // 읽지 않은 메시지 개수 설정
        setUnreadCount: (state, action) => {
            console.log("✅ messageSlice setUnreadCount 실행됨", action.payload);
            state.unreadCount = action.payload;
        },
    }
});

// 액션 생성자 내보내기
export const {
    setMessages,
    setSentMessages,
    addMessage,
    markMessageAsRead,
    setUnreadMessages,
    setUnreadCount
} = messageSlice.actions;

export default messageSlice.reducer;
