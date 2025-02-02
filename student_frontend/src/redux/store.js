import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import surveyReducer from "./surveySlice";

/**
 * Redux Persist 설정
 * - redux-persist를 사용하여 redux store를 생성하고 설정하는 역할
 * - Redux Toolkit과 Redux Persist를 활용하여 애플리케이션 상태를 관리하고, 이를 localStorage에 저장(persist)할 수 있도록 설정하는 역할
 * - 리덕스 스토어에 저장한 상태가 변경되면 자동으로 localStorage에 저장됨.
 * - 화면을 새로기침하면 localStorage에 저장된 상태를 불러와서 리덕스 스토어에 저장함.
 * - persistConfig : redux-persist 설정
 * - persistReducer : persistConfig를 이용하여 authReducer를 저장하는 reducer 생성
 */

/**  Redux Persist의 설정을 정의합니다.
 * - key : localStorage에 저장될 키 이름을 지정합니다.
 * - storage: 상태를 저장할 스토리지를 정의합니다. 여기서는 localStorage를 사용합니다.
 * - whitelist: Redux의 어떤 리듀서를 저장할지 결정합니다. 여기서는 auth만 저장합니다.
 * @type {{storage, whitelist: string[], version: number, key: string}}
 */
const persistConfig = {
    key: "root",
    storage, // 로컬스토리지를 사용하여 Redux 상태 저장
    whitelist: ["auth", "survey"], // auth, survey 저장하도록 지정
};

/**
 * 루트 리듀서 생성
 * - combineReducers를 사용하여 여러 리듀서를 하나로 병합
 * - authReducer: authSlice에서 가져온 리듀서를 Redux persist 대상으로 포함
 */
const rootReducer = combineReducers({
    auth: authReducer, // auth 리듀서를 Redux persist 대상에 포함, 이렇게 포함시키면 auth 상태가 localStorage에 저장됨. 즉, authSlice에서 내보낸 authReducer를 rootReducer에 포함시켜서 Redux Persist에 저장하도록 설정
    survey: surveyReducer,
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
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

/**
 * Redux Persistor 생성
 * - persistStore를 사용하여 Redux Store와 Redux Persist를 연결
 * - 상태가 localStorage에 저장되고 복구될 수 있도록 설정
 */
export const persistor = persistStore(store);
