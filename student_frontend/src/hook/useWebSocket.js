import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { setMessages, addMessage, setUnreadCount } from "@/redux/messageSlice";
import { addMessage as addChatMessage, fetchChatRooms, setTypingStatus } from "@/redux/chat/chatSlice";
import {
  initializeChat,
  acceptConsultationRequest,
  sendMessage as sendConsultationMessage,
  fetchMessages as fetchConsultationMessages
} from "@/redux/consultationSlice";

/**
 * WebSocket을 사용하는 커스텀 훅
 * - WebSocket을 사용하여 실시간 채팅을 구현할 때 사용합니다.
 * - 사용자가 로그인하면 WebSocket을 통해 새로운 메시지를 받아옵니다.
 * - 새로운 메시지가 도착하면 스낵바로 알림을 표시합니다.
 * - 새로운 메시지가 도착하면 메시지 목록을 즉시 갱신합니다.
 *
 * @type {null}
 */
let stompClient = null; // ✅ 전역 변수로 설정 (중복 연결 방지)

const useWebSocket = (user) => {
    const dispatch = useDispatch();

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

                await fetchMessages(user.id, dispatch);

                stompClient.subscribe(`/topic/chat/${user.id}`, async (message) => {
                    console.log("📨 useWebSocket > stompClient.subscribe 새로운 메시지 도착! message.body : ", message.body);

                    const parsedMessage = JSON.parse(message.body);
                    dispatch(addMessage(parsedMessage));
                    await fetchMessages(user.id, dispatch);
                    await fetchUnreadMessagesCount(user.id, dispatch);
                });

                // 채팅 구독 추가
                stompClient.subscribe(`/topic/chatting/${user.id}`, async (message) => {
                    console.log("📨 useWebSocket > stompClient.subscribe 새로운 채팅 도착! message.body : ", message.body);

                    const parsedMessage = JSON.parse(message.body);
                    dispatch(addChatMessage(parsedMessage));
                });

                // 알림 구독 추가
                stompClient.subscribe(`/topic/notifications/${user.id}`, handleNotification);

                // 채팅방 목록 업데이트 구독 추가
                stompClient.subscribe('/topic/chat.rooms.update', handleChatRoomsUpdate);
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
            }
        };
    }, [user, dispatch]);

    const handleNotification = (notification) => {
        console.log("🔔 새 메시지 알림:", notification.body);
        // 여기에 알림 처리 로직 추가 (예: 토스트 메시지)
    };

    const handleChatRoomsUpdate = () => {
        console.log("🔄 채팅방 목록 업데이트");
        dispatch(fetchChatRooms(user.id));
    };

    const sendMessage = (destination, body) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: destination,
                body: JSON.stringify(body)
            });
        } else {
            console.error("WebSocket 연결이 닫혀있거나 초기화되지 않았습니다.");
        }
    };

    const sendTypingStatus = (roomId, isTyping) => {
        if (stompClient && stompClient.connected) {
            const typingStatus = {
                roomId: roomId,
                senderId: user.id,
                typing: isTyping
            };
            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify(typingStatus)
            });
        }
    };

    const joinChatRoom = (roomId) => {
      if (stompClient && stompClient.connected) {
        stompClient.subscribe(`/topic/chat.room.${roomId}`, (message) => {
          const parsedMessage = JSON.parse(message.body);
          dispatch(addChatMessage(parsedMessage));
        });
        sendMessage('/app/chat.join', { roomId, userId: user.id });
      }
    };

    const leaveChatRoom = (roomId) => {
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`/topic/chat.room.${roomId}`);
        sendMessage('/app/chat.leave', { roomId, userId: user.id });
      }
    };

    const requestConsultation = (consultationType, userIssue) => {
      if (stompClient && stompClient.connected) {
        sendMessage('/app/consultation.request', {
          userId: user.id,
          consultationType,
          userIssue
        });
      }
    };

    const acceptConsultation = (requestId) => {
      if (stompClient && stompClient.connected) {
        sendMessage('/app/consultation.accept', { requestId, consultantId: user.id });
      }
    };


   return {
         sendMessage,
         sendTypingStatus,
         joinChatRoom,
         leaveChatRoom,
         requestConsultation,
         acceptConsultation
       };
   }; // useWebSocket 함수의 끝

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
