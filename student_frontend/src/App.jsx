import React, { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    CircularProgress,
    Snackbar
} from "@mui/material";
import { showSnackbar, hideSnackbar } from "@/redux/snackbarSlice";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { fetchUserInfo, clearUser } from "@/redux/authSlice";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { Client } from "@stomp/stompjs";    // 🔹 stompjs 라이브러리에서 Client 객체를 가져옴, 여기서 Client는 WebSocket 클라이언트 즉, 웹소켓을 통해서 메시지를 주고받는 클라이언트
import SockJS from "sockjs-client";         // 🔹 sockjs-client 라이브러리에서 SockJS 객체를 가져옴, SockJS는 WebSocket을 지원하지 않는 브라우저에서도 웹소켓을 사용할 수 있도록 지원하는 라이브러리, SockJS를 통해서 웹소켓을 사용할 수 있음
import { markMessageAsRead, setUnreadCount } from "./redux/messageSlice";
import { setChatRooms, setInvitedRequestsCount } from "./redux/chatSlice"; // ✅ chatSlice에서 가져옴
import { API_URL, SERVER_URL } from "@/constant";
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
import ChatRoomList from "@features/chat/ChatRoomList"; // ✅ ChatRoomList 컴포넌트 import
import FloatingConsultationButton from "@features/chat/FloatingConsultationButton";
import useWebSocket from "@hook/useWebSocket";

function App() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { open, message } = useSelector((state) => state.snackbar || { open: false, message: "" });
    const [delayedUnreadCount, setDelayedUnreadCount] = useState(0);
    const unreadCount = useSelector(state => state.messages.unreadCount || 0);
    const invitedChatRoomsCount = useSelector((state) => state.chat.invitedChatRoomsCount);
    const [openMessageModal, setOpenMessageModal] = useState(false);
    const [messages, setMessages] = useState([]);

    const useWebSocket = (user) => { // ✅ useWebSocket 훅 정의

        useEffect(() => {
            if (user) {
                const socket = new SockJS(`${SERVER_URL}ws`);
                const stompClient = Stomp.over(socket);

                stompClient.connect({}, () => {
                    console.log('WebSocket connected');
                    stompClient.subscribe(`/topic/chat/${user.id}`, (message) => {
                        dispatch(showSnackbar("새로운 메시지가 도착했습니다!"));
                        fetchUnreadMessagesCount(user.id, dispatch);
                    });
                });

                return () => {
                    stompClient.disconnect();
                    console.log('WebSocket disconnected');
                };
            }
        }, [user, dispatch]);
    };

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

    useEffect(() => {
        if (!user && isLoggedIn) {
            dispatch(fetchUserInfo());
        }
    }, [user, isLoggedIn, dispatch]);

    useEffect(() => {
        if (isLoggedIn && user) {
            fetchUnreadMessagesCount(user.id, dispatch);
        }
    }, [isLoggedIn, user, dispatch]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDelayedUnreadCount(unreadCount);
        }, 500);

        return () => clearTimeout(timeout);
    }, [unreadCount]);

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

    const handleOpenMessageModal = async () => {
        setOpenMessageModal(true);
    };

    const handleOpenChatRooms = () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        navigate("/chatrooms");
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div className="App">
            <Header />
            <Routes>
{/*                 <Route path="/" element={<Home />} /> */}
                {/*<Route path="/listStudent" element={<StudentList />} />*/}
                {/*<Route path="/addStudent" element={user?.roles?.includes("ROLE_ADMIN") ? <AddStudent /> : <Navigate to="/unauthorized" replace />} />*/}
                {/*<Route path="/viewStudent/:id" element={<ViewStudent />} />*/}
                {/*{isLoggedIn && user?.roles?.includes("ROLE_ADMIN") && <Route path="/editStudent/:id" element={<EditStudent />} />}*/}
                <Route path="/registerMember" element={<RegisterMember />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />
                <Route path="/mypage/:id" element={<MyPage />} />
                <Route path="/messages" element={<MessageList />} />
                <Route path="/chatrooms" element={<ChatRoomList />} /> {/* ✅ 채팅방 목록 라우트 추가 */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/survey" element={<SurveyPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            </Routes>
            <Footer />
            <FloatingConsultationButton />



            <Dialog open={openMessageModal} onClose={() => setOpenMessageModal(false)} fullWidth maxWidth="md">
                <DialogTitle>메시지 목록</DialogTitle>
                <DialogContent dividers>
                    <MessageList />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMessageModal(false)} color="primary">닫기</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => dispatch(hideSnackbar())}
                message={message}
            />
        </div>
    );
}

export default App;
