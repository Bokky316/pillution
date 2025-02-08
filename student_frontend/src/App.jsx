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
import { setUnreadCount } from "./redux/messageSlice";  // ✅ 읽지 않은 메시지 수를 Redux에 저장하는 액션 import
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
import useWebSocket from "@hook/useWebSocket";
import ChatRoom from '@/pages/chat/ChatRoom';
import ChatRoomIcon from '@components/layout/ChatRoomIcon';

function App() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { open, message } = useSelector((state) => state.snackbar || { open: false, message: "" }); // ✅ Redux Snackbar 상태 사용

    const [delayedUnreadCount, setDelayedUnreadCount] = useState(0);
    // ✅ 읽지 않은 메시지 개수를 Redux에서 가져오기
    const unreadCount = useSelector(state => state.messages.unreadCount || 0);

    // 🔹 사용자 목록을 모달 창에서 사용하기 위해 상태 변수로 선언
    const [openModal, setOpenModal] = useState(false);
    // 🔹 사용자 목록을 저장할 상태 변수
    const [selectedUser, setSelectedUser] = useState(null);
    // 🔹 사용자 목록을 저장할 상태 변수
    const [users, setUsers] = useState([]);
    // 🔹 메시지 전송 모달 창에서 사용할 상태 변수
    const [openMessagesModal, setOpenMessagesModal] = useState(false); // ✅ 상태 추가
    const [messageContent, setMessageContent] = useState(""); // 메시지 내용 상태 추가

    // 🔹 전역 stompClient 선언 (WebSocket 클라이언트)
    let stompClient = null;

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

    //  사용자 정보 가져오기 (로그인은 했는데 리덕스에 사용자 정보가 없는 경우-새로고침 등으로 인한 변)
    useEffect(() => {
        if (!user && isLoggedIn) {
            dispatch(fetchUserInfo());
        }
    }, [user, isLoggedIn, dispatch]);

    // 🔹 로그인 상태 변경 또는 사용자 정보 변경 시 실행 (📌 수정된 부분)
    useEffect(() => {
        if (isLoggedIn && user) {
            console.log("✅ App > useEffect > fetchUnreadMessagesCount user.id : ", user.id);
            fetchUnreadMessagesCount(user.id, dispatch); // ✅ Redux에 저장하도록 변경
            connectWebSocket();
        }
    }, [isLoggedIn, user, dispatch]);

    useEffect(() => {
        // ✅ 읽지 않은 메시지 개수를 0.5초 뒤에 업데이트
        const timeout = setTimeout(() => {
            setDelayedUnreadCount(unreadCount);
        }, 500);

        return () => clearTimeout(timeout);  // 컴포넌트 언마운트 시 정리
    }, [unreadCount]);

    // 🔹 읽지 않은 메시지 개수 가져오는 함수
    const fetchUnreadMessagesCount = async (userId, dispatch) => {
        console.log("✅ App > fetchUnreadMessagesCount userId : ", userId);
        try {
            const response = await fetchWithAuth(`${API_URL}messages/unread/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ App > fetchUnreadMessagesCount data : ${data}`);

                // ✅ 개수만 업데이트하도록 변경
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
        if (!user || stompClient) return; // ✅ 중복 연결 방지

        const socket = new SockJS(`${SERVER_URL}ws`); // ✅ SockJS 객체 생성
        stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("📡 WebSocket 연결 완료");

                // ✅ 구독: /topic/chat/{user.id} → 사용자의 메시지 채널
                stompClient.subscribe(`/topic/chat/${user.id}`, (message) => {
                    console.log("📩 App > connectWebSocket > stompClient.subscribe 새로운 메시지가 도착했습니다. message : ", message);

                    // ✅ Redux 스낵바 알림 표시
                    dispatch(showSnackbar("📩 새로운 메시지가 도착했습니다!"));

                    fetchUnreadMessagesCount(user.id, dispatch); // ✅ 읽지 않은 메시지 개수 갱신
                });
            },
        });
        stompClient.activate();
    };

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

    const sendMessage = async () => {
        if (!selectedUser || !message) return;
        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({ recipientId: selectedUser.id, content: message }),
            });
            setOpenModal(false);
            setMessage("");
            setSelectedUser(null);
        } catch (error) {
            console.error("메시지 전송 실패:", error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await fetchWithAuth(`${API_URL}auth/logout`, { method: "POST" });
            dispatch(clearUser());
            await persistor.purge();
            window.location.href = "/";
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    };

    // 🔹 배지를 클릭하면 메시지 모달 열기
    const handleOpenMessageModal = () => {
        setOpenMessagesModal(true);
    };

    // 🔹 메시지 전송 함수
    const handleSendMessage = async () => {
        if (!messageContent) return;
        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({ senderId: user.id, receiverId: user.id, content: messageContent }), // ✅ 현재 로그인한 사용자가 수신자
            });
            setOpenMessagesModal(false);
            setMessageContent("");

            dispatch(showSnackbar("메시지가 전송되었습니다!"));
        } catch (error) {
            console.error("메시지 전송 실패:", error.message);
        }
    };

    // ✅ 메시지를 읽으면 Redux 상태를 업데이트하여 unreadMessages[] 에서 제거
    const handleReadMessages = async (messageId) => {
        try {
            // 1. DB에 메시지를 읽음 처리
            await fetchWithAuth(`${API_URL}messages/read/${messageId}`, { method: "POST" });
            // 2. Redux 상태 업데이트, markMessageAsRead() : 메시지를 읽음 처리하는 액션
            dispatch(markMessageAsRead(messageId)); // ✅ Redux 상태 업데이트, markMessageAsRead() : 메시지를 읽음 처리하는 액션
            // 3. 읽지 않은 메시지 개수를 1 감소
            dispatch(setUnreadCount(state => state.unreadCount - 1));  // ✅ 개수 줄이기
        } catch (error) {
            console.error("🚨 메시지 읽음 처리 실패:", error.message);
        }
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div className="App">
            <Header />
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
                <Route path="/messages" element={<MessageList />} />
                <Route path="/ChatRoom" element={<ChatRoom />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            </Routes>
            <Footer />
            <ChatRoomIcon />  {/* 항상 표시되는 채팅 아이콘 컴포넌트 */}
        </div>
    );
}

export default App;