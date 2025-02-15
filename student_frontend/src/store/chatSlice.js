import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chatRooms: [], // ✅ 참여 중이거나 초대받은 채팅방 목록
        invitedRequestsCount: 0, // ✅ 초대받은 상담 요청 개수
    },
    reducers: {
        /**
         * ✅ 참여 중이거나 초대받은 채팅방 목록을 설정
         */
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
        },

        /**
         * ✅ 초대받은 상담 요청 개수를 설정
         */
        setInvitedRequestsCount: (state, action) => {
            state.invitedRequestsCount = action.payload;
        },
    },
});

// Redux 액션 생성자 내보내기
export const { setChatRooms, setInvitedRequestsCount } = chatSlice.actions;

// 리듀서 내보내기
export default chatSlice.reducer;
