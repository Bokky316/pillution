import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { setMessages, addMessage, setUnreadCount } from "@/redux/messageSlice";
import { addMessage as addChatMessage } from "@/redux/chat/chatSlice";

let stompClient = null;

const useWebSocket = (user, selectedRoom) => {
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user?.id || stompClient) return;

        console.log("🛠 WebSocket 연결 시도 - user ID:", user?.id);

        const socket = new SockJS(`${SERVER_URL}ws`);
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`),
            reconnectDelay: 5000,

            onConnect: async () => {
               console.log("📡 WebSocket 연결 성공!");
               setIsConnected(true);

               await fetchMessages(user.id, dispatch);

               // 개인 메시지 및 채팅방 메시지 구독
               stompClient.subscribe(`/topic/chat/${user.id}`, handleNewMessage);
               stompClient.subscribe(`/topic/chatting/${user.id}`, handleNewChatMessage);

               // 알림 구독
               stompClient.subscribe(`/topic/notifications/${user.id}`, handleNotification);

               // 채팅방 목록 업데이트 구독
               stompClient.subscribe('/topic/chat.rooms.update', handleChatRoomsUpdate);

               if (selectedRoom) {
                   stompClient.subscribe(`/topic/chat/${selectedRoom}`, handleRoomMessage);
                   stompClient.subscribe(`/topic/chat/${selectedRoom}/typing`, handleTypingStatus);
               }
           },

            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame);
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
                stompClient = null;
                setIsConnected(false);
            }
        };
     }, [user, dispatch, selectedRoom]);

    const handleNewMessage = async (message) => {
        console.log("📨 새로운 메시지 도착:", message.body);
        const parsedMessage = JSON.parse(message.body);
        dispatch(addMessage(parsedMessage));
        await fetchMessages(user.id, dispatch);
        await fetchUnreadMessagesCount(user.id, dispatch);
    };

    const handleNewChatMessage = (message) => {
        console.log("📨 새로운 채팅 도착:", message.body);
        const parsedMessage = JSON.parse(message.body);
        dispatch(addChatMessage(parsedMessage));
    };

    const handleNotification = (notification) => {
        console.log("🔔 새 메시지 알림:", notification.body);
        // 여기에 알림 처리 로직 추가 (예: 토스트 메시지)
    };

    const handleChatRoomsUpdate = () => {
        console.log("🔄 채팅방 목록 업데이트");
        dispatch(fetchChatRooms()); // chatSlice에 fetchChatRooms 액션 추가 필요
    };

    const handleRoomMessage = (message) => {
        const receivedMessage = JSON.parse(message.body);
        dispatch(addChatMessage(receivedMessage));
    };

    const handleTypingStatus = (status) => {
            const typingStatus = JSON.parse(status.body);
            dispatch(setTypingStatus(typingStatus));
        };

    const sendTypingStatus = (isTyping) => {
        if (stompClient && isConnected) {
            const typingStatus = {
                roomId: selectedRoom,
                senderId: user.id,
                typing: isTyping
            };
            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify(typingStatus)
            });
        }
    };

    return { sendMessage, sendTypingStatus };
};

// ✅ 메시지 목록 가져오기 (dispatch 추가)
const fetchMessages = async (userId, dispatch) => {
    try {
        const response = await fetchWithAuth(`${API_URL}messages/${userId}`);
        if (response.ok) {
            const data = await response.json();
            dispatch(setMessages(data));
        }
    } catch (error) {
        console.error("🚨 메시지 목록 조회 실패:", error.message);
    }
};

// ✅ 읽지 않은 메시지 개수 가져오기
const fetchUnreadMessagesCount = async (userId, dispatch) => {
    try {
        const response = await fetchWithAuth(`${API_URL}messages/unread/${userId}`);
        if (response.ok) {
            const data = await response.json();
            dispatch(setUnreadCount(data));
        }
    } catch (error) {
        console.error("🚨 읽지 않은 메시지 개수 조회 실패:", error.message);
    }
};

export default useWebSocket;
