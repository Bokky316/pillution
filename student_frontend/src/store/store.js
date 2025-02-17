import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from 'redux';
import authReducer from "@/store/authSlice";
import surveyReducer from "@/store/surveySlice";
import uiReducer from '@/store/uiSlice';
import recommendationReducer from "@/store/recommendationSlice";
import boardReducer from "@/store/boardSlice";
import newsReducer from "@/store/newsSlice";
import postDetailReducer from "@/store/postDetailSlice";
import faqReducer from "@/store/faqSlice";
import postCreateReducer from "@/store/postCreateSlice";
import postEditReducer from "@/store/postEditSlice";
import snackbarReducer from "@/store/snackbarSlice";
import messageReducer from "@/store/messageSlice";
import chatReducer from "@/store/chatSlice";
import productReducer from "@/store/productSlice";
import sidebarReducer from '@/store/sidebarSlice';
import subscriptionReducer from "@/store/subscriptionSlice";
import cartReducer from "@/store/cartSlice";
import orderReducer from "@/store/orderSlice";
import paymentReducer from "@/store/paymentSlice";
import deliveryReducer from "@/store/deliverySlice"; // 새로 추가된 배송 정보 리듀서

/**
 * Redux Persist의 설정을 정의합니다.
 * - key : localStorage에 저장될 키 이름을 지정합니다.
 * - storage: 상태를 저장할 스토리지를 정의합니다. 여기서는 localStorage를 사용합니다.
 * - whitelist: Redux의 어떤 리듀서를 저장할지 결정합니다.
 */
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "survey", "ui", "products", "recommendations", "board", "news", "postDetail", "faq", "postCreate", "postEdit", "snackbar", "chat", "sidebar", "subscription", "cart", "order", "payment", "delivery"], // delivery 추가
};

/**
 * 루트 리듀서 생성
 * - combineReducers를 사용하여 여러 리듀서를 하나로 병합
 */
const rootReducer = combineReducers({
    auth: authReducer,
    survey: surveyReducer,
    ui: uiReducer,
    recommendations: recommendationReducer,
    board: boardReducer,
    news: newsReducer,
    faq: faqReducer,
    postDetail: postDetailReducer,
    postCreate: postCreateReducer,
    postEdit: postEditReducer,
    snackbar: snackbarReducer,
    messages: messageReducer,
    chat: chatReducer,
    products: productReducer,
    subscription: subscriptionReducer,
    sidebar: sidebarReducer,
    cart: cartReducer,
    order: orderReducer,
    payment: paymentReducer,
    delivery: deliveryReducer, // 새로 추가된 배송 정보 리듀서
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
