import React, { useEffect, useState, useRef } from "react";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
    fetchUserInfo,
    clearUser
} from "@/redux/authSlice";
import {
    fetchWithAuth,
    fetchWithoutAuth
} from "@features/auth/utils/fetchWithAuth";
import {
    showSnackbar,
} from "@/redux/snackbarSlice";
import {
    setUnreadCount,
    markMessageAsRead
} from "./redux/messageSlice";
import {
    API_URL,
    SERVER_URL
} from "@/constant";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import RecommendationPage from "@/pages/survey/RecommendationPage";
import SurveyPage from "@/pages/survey/SurveyPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductListPage from "@/pages/product/ProductListPage";
import CartPage from "@/pages/cart/CartPage";
import Login from "@features/auth/components/Login";
import MyPage from "@features/auth/components/MyPage";
import RegisterMember from "@features/auth/components/RegisterMember";
import UnauthorizedPage from "@features/auth/components/UnAuthorizedPage";
import OAuth2RedirectHandler from '@features/auth/components/OAuth2RedirectHandler';
import MessageList from "@features/auth/components/MessageList";
import ChatRoom from '@/pages/chat/ChatRoom';
import ChatRoomIcon from '@components/layout/ChatRoomIcon';

/**
 * App 컴포넌트
 * @returns {JSX.Element}
 */
function App() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { open, message } = useSelector((state) => state.snackbar || { open: false, message: "" });
    const unreadCount = useSelector(state => state.messages.unreadCount || 0);

    // stompClient를 useRef로 관리하여 컴포넌트가 리렌더링되어도 유지되도록 함
    const stompClientRef = useRef(null);
    // WebSocket 연결 상태를 저장하는 state
    const [isConnected, setIsConnected] = useState(false);

    // ✅ 사용자 목록을 모달 창에서 사용하기 위해 상태 변수로 선언
    const [openModal, setOpenModal] = useState(false);
    // ✅ 사용자 목록을 저장할 상태 변수
    const [selectedUser, setSelectedUser] = useState(null);
    // ✅ 사용자 목록을 저장할 상태 변수
    const [users, setUsers] = useState([]);
    // ✅ 메시지 전송 모달 창에서 사용할 상태 변수
    const [openMessagesModal, setOpenMessagesModal] = useState(false); // ✅ 상태 추가
    const [messageContent, setMessageContent] = useState(""); // 메시지 내용 상태 추가

    /**
     * 컴포넌트 마운트 시 로그인 상태를 확인하고 사용자 정보를 가져옴
     */
    useEffect(() => {
        const checkLoginStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && data.status === "success") {
                    dispatch(fetchUserInfo(data.data));
                } else {
                    dispatch(clearUser());
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                dispatch(clearUser());
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [dispatch]);

    /**
     * 사용자 정보가 없는 경우 사용자 정보를 가져옴
     */
    useEffect(() => {
        if (!user && isLoggedIn) {
            dispatch(fetchUserInfo());
        }
    }, [user, isLoggedIn, dispatch]);

    /**
     * 로그인 상태가 변경될 때 WebSocket 연결을 설정하고 읽지 않은 메시지 수를 가져옴
     */
    useEffect(() => {
        if (isLoggedIn && user) {
            fetchUnreadMessagesCount(user.id, dispatch);
            connectWebSocket();
        }

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isLoggedIn, user, dispatch]);

    /**
     * 읽지 않은 메시지 개수를 가져오는 함수
     * @param {string} userId - 사용자 ID
     * @param {function} dispatch - Redux dispatch 함수
     */
    const fetchUnreadMessagesCount = async (userId, dispatch) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/unread/${userId}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setUnreadCount(data));
            }
        } catch (error) {
            console.error("🚨 읽지 않은 메시지 조회 실패:", error.message);
        }
    };

    /**
     * WebSocket 연결 함수
     */
    const connectWebSocket = () => {
        if (!user || isConnected) return;

        const socket = new SockJS(`${SERVER_URL}ws`);
        stompClientRef.current = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                console.log("📡 WebSocket 연결 완료");

                stompClientRef.current.subscribe(`/topic/chat/${user.id}`, (message) => {
                    // 새로운 메시지가 도착하면 Redux 스낵바 알림을 표시하고 읽지 않은 메시지 개수를 갱신
                    dispatch(showSnackbar("📩 새로운 메시지가 도착했습니다!"));
                    fetchUnreadMessagesCount(user.id, dispatch);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onDisconnect: () => {
                setIsConnected(false);
                console.log("🔌 WebSocket 연결 해제");
            }
        });
        stompClientRef.current.activate();
    };

    /**
     * 사용자 목록을 가져오는 함수
     */
    const fetchUsers = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}users`);
            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } catch (error) {
            console.error("사용자 목록 조회 실패:", error.message);
        }
    };

    /**
     * 메시지 전송 함수
     */
    const sendMessage = async () => {
        if (!selectedUser || !message) return;
        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({
                    recipientId: selectedUser.id,
                    content: message
                }),
            });
            setOpenModal(false);
            setMessage(""); // message 상태 초기화
            setSelectedUser(null);
        } catch (error) {
            console.error("메시지 전송 실패:", error.message);
        }
    };

    /**
     * 로그아웃 함수
     */
    const handleLogout = async () => {
        try {
            await fetchWithAuth(`${API_URL}auth/logout`, {
                method: "POST"
            });
            dispatch(clearUser());
            window.location.href = "/";
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
        }
    };

    /**
     * 메시지 전송 함수
     */
    const handleSendMessage = async () => {
        if (!messageContent) return;
        try {
            // 실제 메시지를 받는 사용자의 ID를 사용해야 합니다.
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({
                    recipientId: user.id, // user.id 대신 실제 recipientId를 사용해야 함
                    content: messageContent
                }),
            });
            setOpenMessagesModal(false);
            setMessageContent("");

            dispatch(showSnackbar("메시지가 전송되었습니다!"));
        } catch (error) {
            console.error("메시지 전송 실패:", error.message);
        }
    };

    /**
     * 메시지를 읽음으로 표시하는 함수
     * @param {string} messageId - 메시지 ID
     */
    const handleReadMessages = async (messageId) => {
        try {
            // 1. DB에 메시지를 읽음 처리
            await fetchWithAuth(`${API_URL}messages/read/${messageId}`, {
                method: "POST"
            });

            // 2. Redux 상태 업데이트, markMessageAsRead() : 메시지를 읽음 처리하는 액션
            dispatch(markMessageAsRead(messageId));

            // 3. 읽지 않은 메시지 개수를 1 감소
            dispatch(setUnreadCount(state => state.unreadCount - 1));
        } catch (error) {
            console.error("🚨 메시지 읽음 처리 실패:", error.message);
        }
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div className="App">
            {/* Header 컴포넌트에 unreadCount prop을 전달 */}
            <Header unreadCount={unreadCount} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registerMember" element={<RegisterMember />} />
                <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/survey" element={<SurveyPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* MessageList 컴포넌트에 onMessageRead prop을 전달 */}
                <Route path="/messages" element={<MessageList onMessageRead={handleReadMessages} />} />
                <Route path="/ChatRoom" element={<ChatRoom />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            </Routes>
            <Footer />
            <ChatRoomIcon />
        </div>
    );
}

export default App;
