import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from 'redux';
import authReducer from "./authSlice";
import surveyReducer from "./surveySlice";
import uiReducer from './uiSlice';
import recommendationReducer from "./recommendationSlice";
import snackbarReducer from "./snackbarSlice";
import messageReducer from "./messageSlice";
import chatReducer from "./chat/chatSlice";

/**
 * Redux Persist 설정을 정의합니다.
 * - key : localStorage에 저장될 키 이름을 지정합니다.
 * - storage: 상태를 저장할 스토리지를 정의합니다. 여기서는 localStorage를 사용합니다.
 * - whitelist: Redux의 어떤 리듀서를 저장할지 결정합니다.
 * @type {{storage, whitelist: string[], version: number, key: string}}
 */
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "survey", "ui", "recommendations", "snackbar", "chat"],
};

/**
 * 루트 리듀서 생성
 * - combineReducers를 사용하여 여러 리듀서를 하나로 병합
 * - 각 리듀서는 애플리케이션의 특정 부분의 상태를 관리합니다.
 */
const rootReducer = combineReducers({
    auth: authReducer,              // 인증 관련 상태 관리
    survey: surveyReducer,          // 설문 관련 상태 관리
    ui: uiReducer,                  // UI 관련 상태 관리
    recommendations: recommendationReducer,  // 추천 관련 상태 관리
    snackbar: snackbarReducer,      // 스낵바 알림 상태 관리
    messages: messageReducer,       // 메시지 관련 상태 관리
    chat: chatReducer,              // 채팅 관련 상태 관리
});

/**
 * Persisted Reducer 생성
 * - Redux Persist 설정을 적용한 리듀서를 생성
 * - 이를 통해 지정된 상태가 로컬 스토리지에 저장되고 복원됩니다.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store 생성
 * - Redux Toolkit의 configureStore 사용
 * - Middleware 설정에서 Redux Persist 관련 액션을 무시하도록 serializableCheck 조정
 * - 이는 Redux Persist 작업 중 발생할 수 있는 직렬화 오류를 방지합니다.
 */
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, "persist/PERSIST", "persist/REHYDRATE"],
                ignoredActionPaths: ['payload.error', 'meta.arg'],
                ignoredPaths: ['survey.responses'],
            },
        }),
});

/**
 * Redux Persistor 생성
 * - persistStore를 사용하여 Redux Store와 Redux Persist를 연결
 * - 이를 통해 상태가 localStorage에 저장되고 복구될 수 있도록 설정
 * - 앱이 시작될 때 저장된 상태를 자동으로 복원합니다.
 */
export const persistor = persistStore(store);
