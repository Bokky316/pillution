import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

export const initializeChat = createAsyncThunk(
  'consultation/initializeChat',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await fetchWithAuth(`${API_URL}chat/rooms`, {
        method: 'POST',
        body: JSON.stringify({
          userId: auth.user.id,
          consultationType: 'OTHER',
          userIssue: '초기 상담 요청'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '채팅 초기화 실패');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptConsultationRequest = createAsyncThunk(
  'consultation/acceptConsultationRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}chat/accept/${requestId}`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'consultation/sendMessage',
  async ({ roomId, senderId, content }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}chat/messages`, {
        method: 'POST',
        body: JSON.stringify({ roomId, senderId, content }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'consultation/fetchMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`);
      if (!response.ok) {
        if (response.status === 404) {
          // 404 오류 처리
          return []; // 빈 배열을 반환하여 메시지가 없음을 나타냄
        }
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data;
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return rejectWithValue('JSON 파싱 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      return rejectWithValue(error.message);
    }
  }
);


export const fetchConsultationRequests = createAsyncThunk(
  'consultation/fetchConsultationRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}chat/requests`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchChatRooms = createAsyncThunk(
  'consultation/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}chat/rooms`);
      const text = await response.text(); // 먼저 텍스트로 받아옵니다.
      console.log('Raw response:', text); // 원시 응답을 로그로 출력
      return JSON.parse(text); // 텍스트를 JSON으로 파싱
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return rejectWithValue(error.message);
    }
  }
);


const consultationSlice = createSlice({
  name: 'consultation',
  initialState: {
    isInitialized: false,
    currentRoom: null,
    messages: [],
    consultationRequests: [],
    chatRooms: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeChat.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.currentRoom = action.payload;
        state.loading = false;
      })
      .addCase(initializeChat.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(acceptConsultationRequest.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
        state.consultationRequests = state.consultationRequests.filter(
          request => request.id !== action.payload.id
        );
      })
      .addCase(fetchConsultationRequests.fulfilled, (state, action) => {
        state.consultationRequests = action.payload;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
            state.chatRooms = action.payload;
            state.loading = false;
            state.error = null;
          })
          .addCase(fetchChatRooms.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'An error occurred';
          });
  },
});

export const { setCurrentRoom, addMessage } = consultationSlice.actions;
export default consultationSlice.reducer;
