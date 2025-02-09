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
          consultationType: 'GENERAL', // 또는 적절한 상담 유형
          userIssue: '초기 상담 요청'
        })
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      const response = await fetchWithAuth(`${API_URL}chat/messages/${roomId}`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
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

const consultationSlice = createSlice({
  name: 'consultation',
  initialState: {
    isInitialized: false,
    currentRoom: null,
    messages: [],
    consultationRequests: [],
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
      });
  },
});

export const { setCurrentRoom, addMessage } = consultationSlice.actions;
export default consultationSlice.reducer;
