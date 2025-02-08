import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatRooms: [],
    selectedRoom: null,
    messages: [],
  },
  reducers: {
    setChatRooms: (state, action) => {
      state.chatRooms = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setChatRooms, setSelectedRoom, setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;