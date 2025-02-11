import { createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

/**
 * messages 슬라이스(Slice) 정의
 * 슬라이스(Slice)는 Redux Toolkit에서 도입된 개념으로, Redux 상태의 한 부분을(메시지 목록) 관리하기 위한 로직을 모아놓은 단위입니다.
 * 메시지 상태를 Redux에서 관리,
 * - 전체 메시지 목록을 저장하는 messages 상태
 * - 읽지 않은 메시지 목록을 저장하는 unreadMessages 상태
 * - 메시지를 추가하는 addMessage 액션
 * - 메시지를 읽음으로 표시하는 markMessageAsRead 액션
 * - 메시지 목록을 설정하는 setMessages 액션
 *
 * @type {Slice<{unreadMessages: *[], messages: *[]}, {setMessages: reducers.setMessages, addMessage: reducers.addMessage, markMessageAsRead: reducers.markMessageAsRead}, string, string, SliceSelectors<{unreadMessages: *[], messages: *[]}>>}
 */
const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [], // 전체 메시지 목록 첨에 여기 들어있다가
        unreadMessages: [], // 읽지 않은 메시지 목록 / 읽으면 여기서 빼줘야 함
        unreadCount: 0,  // ✅ 읽지 않은 메시지 개수를 저장하는 상태 추가 / 뱃지에 있는 숫자
    },

    // 반드시 리듀서를 통해 바꾸야 한따
    reducers: {
        // ✅ setMessages: 전체 메시지 목록 설정, 읽지 않은 메시지 목록 설정, payload로 전체 메시지 목록을 받음, 읽지 않은 메시지 목록은 read 속성이 false인 메시지로 설정
        setMessages: (state, action) => {
            state.messages = action.payload;    // 전체 메시지 목록 설정
            state.unreadMessages = action.payload.filter(msg => !msg.read);     // 읽지 않은 메시지 목록 설정
            state.unreadCount = state.unreadMessages.length;  // ✅ 개수 자동 업데이트
        },
        //
        addMessage: (state, action) => {
            state.messages.push(action.payload);    // 기존 메시지 목록에 새 메시지 추가
            if (!action.payload.read) {   // 새 메시지가 읽지 않은 상태라면
                state.unreadMessages.push(action.payload);  // 읽지 않은 메시지 목록에 추가
                state.unreadCount += 1;  // ✅ 새 메시지가 읽지 않음이면 개수 증가
            }
        },
        // ✅ markMessageAsRead: 메시지를 읽음으로 표시, payload로 메시지 ID를 받아서 해당 메시지를 읽음으로 표시하고 읽지 않은 메시지 목록에서 제거
        markMessageAsRead: (state, action) => {
            const messageId = action.payload;   // 메시지 ID 추출
            state.messages = state.messages.map(msg =>  // 리덕스에서 보관하고 있는 메시지 목록을 순회하면서 해당 메시지를 찾음
                msg.id === messageId ? { ...msg, read: true } : msg // 찾은 메시지를 읽음으로 처리, 그렇게 되면 읽지 않은 메시지 목록에서 해당 메시지가 제거됨, 제거되면 읽지 않은 메시지 목록이 갱신됨
            );
            state.unreadMessages = state.unreadMessages.filter(msg => msg.id !== messageId);    // 읽지 않은 메시지 목록에서 해당 메시지 제거
            state.unreadCount = state.unreadMessages.length;  // ✅ 읽음 처리 후 개수 업데이트
        },
        setUnreadMessages: (state, action) => {
            console.log("✅ messageSlice setUnreadMessages 실행됨", action.payload);
            state.unreadMessages = action.payload;  // ✅ 배열로 저장
            state.unreadCount = action.payload.length;  // ✅ 개수 상태 업데이트
        },
        setUnreadCount: (state, action) => {
            console.log("✅ messageSlice setUnreadCount 실행됨", action.payload);
            state.unreadCount = action.payload;  // ✅ 개수만 업데이트
        },
    }
});

// ✅ 액션 생성자 내보내기
export const { setMessages, addMessage, markMessageAsRead , setUnreadMessages, setUnreadCount } = messageSlice.actions;
export default messageSlice.reducer;
