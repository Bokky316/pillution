import { createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../common/fetchWithAuth";
import { API_URL } from "../constant";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chatRooms: [], // ✅ 참여 중이거나 초대받은 채팅방 목록
        invitedChatRoomsCount: 0, // ✅ 초대받은 채팅방 개수
    },
    reducers: {
        /**
         * ✅ 참여 중이거나 초대받은 채팅방 목록을 설정
         */
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
        },

        /**
         * ✅ 초대받은 채팅방 개수를 설정
         */
        setInvitedChatRoomsCount: (state, action) => {
            state.invitedChatRoomsCount = action.payload;
        },
    },
});

export const { setChatRooms, setInvitedChatRoomsCount } = chatSlice.actions; // ✅ 액션 생성자 내보내기, 이렇게 내보내면 다른 파일에서 import { setChatRooms, setInvitedChatRoomsCount } from "./redux/chatSlice";로 사용 가능
export default chatSlice.reducer;   // ✅ 리듀서 함수 내보내기, 이렇게 내보내면 다른 파일에서 import chatReducer from "./redux/chatSlice";로 사용 가능, chatReducer 이름은 상관없음
