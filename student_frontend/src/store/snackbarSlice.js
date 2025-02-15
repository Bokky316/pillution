import { createSlice } from "@reduxjs/toolkit";

/**
 * 스낵바 상태를 관리하는 슬라이스(Slice) 정의
 * - 슬라이스(Slice)는 Redux Toolkit에서 도입된 개념으로, Redux 상태의 한 부분을(스낵바 상태) 관리하기 위한 로직을 모아놓은 단위입니다.
 * - 메시지를 보여주는 모달(Snackbar)의 오픈 여부 (open) 관리
 * - 표시될 메시지 (message) 관리
 * - Redux를 통해 상태를 전역적으로 관리할 수 있도록 설정
 * - 웹소켓을 통해 메시지가 도착하면 Redux를 활용하여 스낵바를 띄우도록 구현합니다.
 * 사용예시
 * - dispatch(showSnackbar("새로운 메시지가 도착했습니다!"));
 * - dispatch(hideSnackbar());
 */

const initialState = {
    open: false,     // ✅ 스낵바가 열려 있는지 여부
    message: "",    // ✅ 스낵바에 표시될 메시지 내용
};

const snackbarSlice = createSlice({
    name: "snackbar",
    initialState,
    reducers: {
        showSnackbar: (state, action) => {
            state.open = true;  // 스낵바를 열고
            state.message = action.payload; // payload에 전달된 메시지를 표시
        },
        hideSnackbar: (state) => {
            state.open = false;
            state.message = "";
        },
    },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
