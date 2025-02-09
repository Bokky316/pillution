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
import consultationReducer from "./consultationSlice";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "survey", "ui", "recommendations", "snackbar", "chat", "consultation"],
};

const rootReducer = combineReducers({
    auth: authReducer,
    survey: surveyReducer,
    ui: uiReducer,
    recommendations: recommendationReducer,
    snackbar: snackbarReducer,
    messages: messageReducer,
    chat: chatReducer,
    consultation: consultationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
                    "persist/PERSIST", "persist/REHYDRATE",
                    "consultation/initializeChat/pending",
                    "consultation/initializeChat/fulfilled",
                    "consultation/initializeChat/rejected",
                ],
                ignoredActionPaths: ['payload.error', 'meta.arg'],
                ignoredPaths: ['survey.responses', 'consultation.currentChat'],
            },
        }),
});

export const persistor = persistStore(store);
