import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Typography, Badge,
    Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from "react-router-dom";
import { clearUser } from "@/redux/authSlice";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { persistor } from "@/redux/store";
import { hideSnackbar } from '@/redux/snackbarSlice';
import MessageList from "@features/auth/components/MessageList";
import { setInvitedRequestsCount } from '@/redux/chatSlice'; // 상담 요청 개수 액션 추가
import "../../assets/styles/header.css";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector(state => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openMessagesModal, setOpenMessagesModal] = useState(false);
    const delayedUnreadCount = useSelector(state => state.messages.unreadCount || 0);
    const invitedRequestsCount = useSelector(state => state.chat.invitedRequestsCount || 0); // 상담 요청 개수 가져오기
    const { open: snackbarOpen, message: snackbarMessage } = useSelector(state => state.snackbar);

    // WebSocket 연결 상태 관리
    const [stompClient, setStompClient] = useState(null);

    // 메뉴 열림/닫힘 처리
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await fetchWithAuth(`${API_URL}auth/logout`, {
                method: "POST",
            });
            dispatch(clearUser());
            await persistor.purge();
            window.location.href = "/";
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    };

    // 초대된 상담 요청 개수 가져오기
    const fetchInvitedRequestsCount = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}consultation/pending-requests`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setInvitedRequestsCount(data.length));
            }
        } catch (error) {
            console.error("초대된 상담 요청 개수 조회 실패:", error.message);
        }
    };

    // WebSocket 연결 설정
    const connectWebSocket = () => {
        if (!isLoggedIn || !user) return;

        const socket = new SockJS(`${API_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("📡 WebSocket 연결 성공");
                client.subscribe(`/topic/consultation/${user.id}`, (message) => {
                    console.log("📨 새로운 상담 요청 알림:", message.body);
                    fetchInvitedRequestsCount(); // 새로운 요청이 있을 때 개수 업데이트
                });
            },
            onStompError: (error) => console.error("❌ WebSocket 오류:", error),
        });

        client.activate();
        setStompClient(client);

        return () => client.deactivate();
    };

    // 초기 데이터 및 WebSocket 연결 설정
    useEffect(() => {
        if (isLoggedIn) {
            fetchInvitedRequestsCount();
            connectWebSocket();
        }
    }, [isLoggedIn]);

    return (
        <>
            <AppBar position="static" className="nav-bar" sx={{
                width: '100vw',
                boxShadow: 'none',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                backgroundColor: 'transparent',
            }}>
                <Toolbar sx={{
                    minHeight: '80px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: '1280px',
                    margin: '0 auto',
                    width: '100%',
                    backgroundColor: '#f4f4f4',
                    color: '#000000',
                }}>
                    {/* 메뉴 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleMenuOpen}
                            sx={{ mr: 2 }}
                            id="menu-button"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => navigate("/products")}>상품</MenuItem>
                            <MenuItem onClick={() => navigate("/recommendation")}>추천</MenuItem>
                            <MenuItem onClick={() => navigate("/cart")}>장바구니</MenuItem>
                            <MenuItem onClick={() => navigate("/survey")}>설문조사</MenuItem>
                        </Menu>
                    </Box>

                    {/* 로고 */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img
                                src="/src/assets/images/logo.png"
                                alt="Pillution Logo"
                                style={{ height: '50px', verticalAlign: 'middle' }}
                            />
                        </Link>
                    </Box>

                    {/* 사용자 정보 및 알림 */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isLoggedIn && (
                            <>
                                <Button color="inherit" component={Link} to="/messages">메시지목록</Button>
                                <Badge badgeContent={invitedRequestsCount} color="secondary">
                                    <Button color="inherit" component={Link} to="/consultation">
                                        상담 요청
                                    </Button>
                                </Badge>
                                <Badge badgeContent={delayedUnreadCount > 0 ? delayedUnreadCount : null} color="error">
                                    <Typography variant="body1" sx={{ mr: 2 }}>
                                        {user.name}
                                        {user.role === "ADMIN" ? " (관리자)" : " (사용자)"}
                                    </Typography>
                                </Badge>
                                <Button color="inherit" onClick={() => navigate("/mypage")}>마이페이지</Button>
                                <Button color="inherit" onClick={handleLogout}>
                                    로그아웃
                                </Button>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                                <Button color="inherit" onClick={() => navigate("/login")} sx={{ mr: 1 }}>로그인</Button>
                                <Button color="inherit" onClick={() => navigate("/registerMember")}>회원가입</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 메시지 목록 모달 */}
            <Dialog open={openMessagesModal} onClose={() => setOpenMessagesModal(false)} fullWidth maxWidth="md">
                <DialogTitle>메시지 목록</DialogTitle>
                <DialogContent>
                    <MessageList /> {/* 메시지 목록 컴포넌트 */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMessagesModal(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 스낵바 알림 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => dispatch(hideSnackbar())}
                message={snackbarMessage}
            />
        </>
    );
};

export default Header;
