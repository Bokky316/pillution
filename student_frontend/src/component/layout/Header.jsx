import React from 'react';
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
import { SERVER_URL } from '@/constant';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { persistor } from "@/redux/store";
import { hideSnackbar } from '@/redux/snackbarSlice'; // ✅ 스낵바 관련 액션 추가
import MessageList from "@features/auth/components/MessageList";// ✅ MessageList 컴포넌트 import
import "../../assets/styles/header.css";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector(state => state.auth);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openMessagesModal, setOpenMessagesModal] = React.useState(false);
    const delayedUnreadCount = useSelector(state => state.messages.unreadCount || 0);
    const { open, message } = useSelector(state => state.snackbar); // ✅ 스낵바 상태 추가

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (path) => {
        handleMenuClose();
        if (path === "/cart" && !isLoggedIn) {
            navigate("/login");
        } else {
            navigate(path);
        }
    };

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

    // ✅ 메시지 읽음 처리 함수 추가
    const handleReadMessages = async (messageId) => {
        try {
            await fetchWithAuth(`${API_URL}messages/read/${messageId}`, { method: "POST" });
            // Redux 상태 업데이트 로직 추가 (필요시)
        } catch (error) {
            console.error("메시지 읽음 처리 실패:", error.message);
        }
    };
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
                backgroundColor: 'transparent',  // 배경색을 투명하게 설정
            }}>
                <Toolbar sx={{
                    minHeight: '80px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: '1280px',
                    margin: '0 auto',
                    width: '100%',
                    backgroundColor: '#f4f4f4',  // 툴바의 배경색을 흰색으로 설정
                    color: '#000000',  // 텍스트 색상을 검정색으로 설정
                }}>
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
                            <MenuItem onClick={() => handleMenuItemClick("/products")}>상품</MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick("/recommendation")}>추천</MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick("/cart")}>장바구니</MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick("/survey")}>설문조사</MenuItem>
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img
                                src="/src/assets/images/logo.png"
                                alt="Pillution Logo"
                                style={{ height: '50px', verticalAlign: 'middle' }}
                            />
                        </Link>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isLoggedIn && (
                            <Button color="inherit" component={Link} to="/messages">메시지목록</Button>
                        )}
                        {isLoggedIn && user ? (
                            <>
                                {/* 🔹 배지를 클릭하면 메시지 목록 모달이 열리도록 설정 */}
                                <Badge
                                    badgeContent={delayedUnreadCount > 0 ? delayedUnreadCount : null}
                                    color="error"
                                    onClick={() => setOpenMessagesModal(true)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Typography variant="body1" sx={{ mr: 2 }}>
                                        {user.name}
                                        {user.role === "ADMIN" ? " (관리자)" : " (사용자)"}
                                    </Typography>
                                </Badge>
                                <Button color="inherit" onClick={() => navigate("/mypage")}>마이페이지</Button>
                                <Button color="inherit" onClick={handleLogout}>
                                    {user.social ? '소셜 로그아웃' : '로그아웃'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" onClick={() => navigate("/login")} sx={{ mr: 1 }}>로그인</Button>
                                <Button color="inherit" onClick={() => navigate("/registerMember")}>회원가입</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ✅ 이름 위의 읽지 않은 메시지 숫자의 배지 클릭시 메시지 목록 모달 */}
            <Dialog open={openMessagesModal} onClose={() => setOpenMessagesModal(false)} fullWidth maxWidth="md">
                <DialogTitle>메시지 목록</DialogTitle>
                <DialogContent>
                    <MessageList onMessageRead={handleReadMessages} /> {/* ✅ 메시지를 읽었을 때 처리 */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMessagesModal(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* ✅ 스낵바 알림 */}
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => dispatch(hideSnackbar())}
                message={message}
            />
        </>
    );
};

export default Header;
