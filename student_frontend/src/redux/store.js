import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from 'redux';
import authReducer from "./authSlice";
import surveyReducer from "./surveySlice";
import uiReducer from './uiSlice';
import recommendationReducer from "./recommendationSlice";  // 추가된 부분
import snackbarReducer from "./snackbarSlice";  // ✅ 스낵바 리듀서 추가, snackbarSlice에서 가져옴, 가져와서 root 리듀서에 추가, 추가하면 Redux Persist 대상이 됨. 그렇게 되면 스낵바 상태가 localStorage에 저장되고 복구됨.
import messageReducer from "./messageSlice"; // ✅ messagesSlice 추가
import chatReducer from './chatSlice';

/**
 * Redux Persist 설정을 정의합니다.
 * - key : localStorage에 저장될 키 이름을 지정합니다.
 * - storage: 상태를 저장할 스토리지를 정의합니다. 여기서는 localStorage를 사용합니다.
 * - whitelist: Redux의 어떤 리듀서를 저장할지 결정합니다. 여기서는 auth, survey, ui, recommendations를 저장합니다.
 */


/**  Redux Persist의 설정을 정의합니다.
 * - key : localStorage에 저장될 키 이름을 지정합니다.
 * - storage: 상태를 저장할 스토리지를 정의합니다. 여기서는 localStorage를 사용합니다.
 * - whitelist: Redux의 어떤 리듀서를 저장할지 결정합니다.
 * @type {{storage, whitelist: string[], version: number, key: string}}
 */

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "survey", "ui", "recommendations", "snackbar", "chat"],  // recommendations 추가
};

/**
 * 루트 리듀서 생성
 * - combineReducers를 사용하여 여러 리듀서를 하나로 병합
 * - authReducer, surveyReducer, uiReducer, recommendationReducer를 통합
 */
const rootReducer = combineReducers({
    auth: authReducer,
    survey: surveyReducer,
    ui: uiReducer,
    recommendations: recommendationReducer,  // 추가된 부분
    snackbar: snackbarReducer, // ✅ snackbar 상태 관리 추가, 추가하면 Redux Persist 대상이 됨. 그렇게 되면 스낵바 상태가 localStorage에 저장되고 복구됨.
    messages: messageReducer, // ✅ Redux 스토어에 등록
    chat: chatReducer,
});

/**
 * Persisted Reducer 생성
 * - Redux Persist 설정을 적용한 리듀서를 생성
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store 생성
 * - Redux Toolkit의 configureStore 사용
 * - Middleware 설정에서 Redux Persist 관련 액션을 무시하도록 serializableCheck 조정
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
 * - 상태가 localStorage에 저장되고 복구될 수 있도록 설정
 */
export const persistor = persistStore(store);
