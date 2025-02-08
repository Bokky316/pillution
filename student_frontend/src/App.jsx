import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Badge, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete } from "@mui/material";
import { showSnackbar } from "@/redux/snackbarSlice";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { fetchUserInfo, clearUser } from "@/redux/authSlice";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { Client } from "@stomp/stompjs";    // 🔹 stompjs 라이브러리에서 Client 객체를 가져옴, 여기서 Client는 WebSocket 클라이언트 즉, 웹소켓을 통해서 메시지를 주고받는 클라이언트
import SockJS from "sockjs-client";         // 🔹 sockjs-client 라이브러리에서 SockJS 객체를 가져옴, SockJS는 WebSocket을 지원하지 않는 브라우저에서도 웹소켓을 사용할 수 있도록 지원하는 라이브러리, SockJS를 통해서 웹소켓을 사용할 수 있음
import { markMessageAsRead } from "./redux/messageSlice";
import { setUnreadCount, setMessages } from "./redux/messageSlice";  // ✅ 읽지 않은 메시지 수를 Redux에 저장하는 액션 import
import { API_URL } from "@/constant";
import { SERVER_URL } from "@/constant";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";

import { Snackbar } from "@mui/material";
import { hideSnackbar } from "./redux/snackbarSlice";
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
import Chat from "@features/auth/components/Chat";

/**
 * App 컴포넌트
 * - 웹 애플리케이션의 전체 구조를 정의하고, 라우팅 및 전역 상태 관리를 담당합니다.
 */
function App() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { open, message } = useSelector((state) => state.snackbar || { open: false, message: "" });

    const unreadCount = useSelector(state => state.messages.unreadCount || 0);

    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [openMessagesModal, setOpenMessagesModal] = useState(false);
    const [messageContent, setMessageContent] = useState("");

    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
                    method: 'GET',
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

    useEffect(() => {
        if (!user && isLoggedIn) {
            dispatch(fetchUserInfo());
        }
    }, [user, isLoggedIn, dispatch]);

    useEffect(() => {
        if (isLoggedIn && user) {
            console.log("✅ App > useEffect > fetchUnreadMessagesCount user.id : ", user.id);
            fetchUnreadMessagesCount(user.id, dispatch);
            connectWebSocket();
            fetchMessages();
        }
    }, [isLoggedIn, user, dispatch]);

    const fetchMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setMessages(data));  // ✅ Redux 상태 업데이트
            }
        } catch (error) {
            console.error("🚨 메시지 목록 조회 실패:", error.message);
        }
    };

    /**
     * 읽지 않은 메시지 수를 가져오는 API 호출
     * @param {number} userId 사용자 ID
     * @param {function} dispatch Redux dispatch 함수
     */
    const fetchUnreadMessagesCount = async (userId, dispatch) => {
        console.log("✅ App > fetchUnreadMessagesCount userId : ", userId);
        try {
            const response = await fetchWithAuth(`${API_URL}messages/unread/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ App > fetchUnreadMessagesCount data : ${data}`);
                dispatch(setUnreadCount(data));
            }
        } catch (error) {
            console.error("🚨 읽지 않은 메시지 조회 실패:", error.message);
        }
    };

    /**
     * 웹소켓 연결 함수
     * 🔹 사용자가 로그인 상태이고, stompClient가 없을 때만 연결
     * 🔹 SockJS 객체를 생성하고, stompClient 객체를 생성하고, 연결
     * 🔹 연결이 성공하면, `/topic/chat/${user.id}` 주제를 구독하고, 새로운 메시지가 도착하면 fetchUnreadMessagesCount 함수 호출
     * 🔹 주의: stompClient 객체는 전역 변수로 선언되어 있으므로, 한 번 연결하면 다시 연결하지 않음
     * 🔹 기본적으로 SockJS는 WebSocket이 지원되지 않는 브라우저에서 WebSocket을 대체할 수 있도록 해주는 라이브러리로,
     *    WebSocket 연결이 수립될 때 자동으로 http://localhost:8080/api/ws/info와 같은 요청을 보냅니다.
     * 🔹 SockJS는 WebSocket 연결을 시도하는 대신, WebSocket 연결을 사용할 수 없으면 다른 프로토콜을 사용합니다.
     *    이때 핸드쉐이크 요청을 통해 연결 상태를 확인하고, WebSocket 대체 방식으로 연결을 설정합니다.
     *    이 요청은 WebSocket을 사용하기 위한 초기 설정 과정 중에 발생하는 요청으로, 실제 WebSocket 연결을 하기 위한
     *    준비 단계입니다. t=1738630649103는 타임스탬프로, 요청이 고유한 타이밍에 의해 식별되는 데 사용됩니다.
     */
    const connectWebSocket = () => {
        if (!user || stompClient) return;
            const socket = new SockJS(`${SERVER_URL}ws`);
            const client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log("📡 WebSocket 연결 완료");
                    setStompClient(client); // stompClient 설정

                    client.subscribe(`/topic/chat/${user.id}`, (message) => {
                        console.log("📩 App > connectWebSocket > stompClient.subscribe 새로운 메시지 도착: ", message);
                        fetchUnreadMessagesCount(user.id, dispatch);
                        fetchMessages()
                        dispatch(markMessageAsRead(message.id)); // 뱃지 제거
                    });
                },
                onDisconnect: () => {
                    console.log("🔌 WebSocket 연결 해제");
                },
                onStompError: (frame) => {
                    console.error('🚨 STOMP 에러 발생:', frame);
                },
            });
            client.activate();
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<ProductListPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/survey" element={<SurveyPage />} />
                <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />
                <Route path="/registerMember" element={<RegisterMember />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                <Route path="/messages" element={isLoggedIn ? <MessageList /> : <Navigate to="/login" />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Routes>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => dispatch(hideSnackbar())}
                message={message}
            />
            <Footer />
        </>
    );
}

export default App;
