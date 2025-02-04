import { createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false,
        isSocialLogin: false,
        provider: null,
    },
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.isSocialLogin = action.payload.isSocialLogin || false;
            state.provider = action.payload.provider || null;
        },
        clearUser(state) {
            state.user = null;
            state.isLoggedIn = false;
            state.isSocialLogin = false;
            state.provider = null;
        },
    },
});

export const fetchUserInfo = () => async (dispatch) => {
    try {
        const response = await fetchWithAuth(`${API_URL}auth/userInfo`);
        if (!response.ok) {
            if (response.status === 401) {
                console.warn("인증되지 않은 사용자 요청입니다.");
                return;
            }
            throw new Error("사용자 정보 가져오기 실패");
        }
        const userData = await response.json();
        console.log("fetchUserInfo 사용자 정보 userData : ", userData);

        if (!userData || Object.keys(userData).length === 0) {
            console.warn("존재하지 않는 사용자 정보입니다.");
            return;
        }

        console.log("사용자 정보:", userData);

        dispatch(setUser({
            ...userData,
            isSocialLogin: userData.provider !== null,
            provider: userData.provider
        }));
    } catch (error) {
        dispatch(clearUser());
    }
};

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
