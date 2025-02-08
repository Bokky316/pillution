/*
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { SERVER_URL } from "@/constant";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const [stompClient, setStompClient] = useState(null);

    const connect = useCallback(() => {
        if (isLoggedIn && user && !stompClient) {
            const socket = new SockJS(`${SERVER_URL}ws`);
            const client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log("📡 WebSocket 연결 성공 (WebSocketContext)");
                    setStompClient(client);
                },
                onDisconnect: () => {
                    console.log("🔌 WebSocket 연결 해제 (WebSocketContext)");
                    setStompClient(null);
                },
                onStompError: (frame) => {
                    console.error('🚨 STOMP 에러 발생 (WebSocketContext):', frame);
                },
            });
            client.activate();
        }

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [isLoggedIn, user, stompClient]);

    useEffect(() => {
        return connect();
    }, [connect]);

    return (
        <WebSocketContext.Provider value={{ stompClient }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
 */
