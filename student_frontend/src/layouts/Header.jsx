import React, { useState,useEffect  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import {
    AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Typography, Badge, useMediaQuery, Modal
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from "react-router-dom";
import { clearUser } from "@/store/authSlice";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";
import "@/styles/header.css";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn } = useSelector(state => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const unreadMessagesCount = useSelector(state => state.messages.unreadCount || 0);
    const invitedRequestsCount = useSelector(state => state.chat.invitedRequestsCount || 0);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [isTop, setIsTop] = useState(true);
    const isHome = location.pathname === "/";


     // 어드민 페이지 여부 확인
    const isAdminPage = location.pathname.toLowerCase().startsWith("/adminpage"); // ✅ 대소문자 구분 제거

    // 화면 크기 확인
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleUserMenuOpen = (event) => setUserMenuAnchorEl(event.currentTarget);
    const handleUserMenuClose = () => setUserMenuAnchorEl(null);

    const handleLogout = async () => {
        try {
            await fetchWithAuth(`${API_URL}auth/logout`, { method: "POST" });
            dispatch(clearUser());
            navigate('/');
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsTop(window.scrollY === 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const menuItems = [
        { label: "스토어", path: "/store" },
        { label: "필루션후기", path: "/reviews" },
        { label: "스토리", path: "/story" },
        { label: "브랜드스토리", path: "/brand-story" },
        { label: "필루션소식", path: "/news" },
        { label: "자주묻는질문(FAQ)", path: "/faq" },
        { label: "비회원 주문", path: "/guest-order" },
        { label: "회원 혜택", path: "/benefits" }
    ];

    return (
        <>
            <AppBar position="fixed" className={`container ${isHome && isTop ? "" : "scrolled"}`} >
                <Toolbar className="nav-bar">
                    {/* 햄버거 메뉴 버튼 */}
                    <IconButton disableRipple className={`ham-menu ${isHome && isTop ? "" : "scrolled"}`} edge="start" onClick={handleOpen}>
                      <MenuIcon />
                    </IconButton>

                    {/* 중앙 로고 */}
                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img
                                src="/src/assets/images/logo.png"
                                alt="Pillution Logo"
                                className="logo"
                            />
                        </Link>
                    </Box>

                    {/* 오른쪽 사용자 정보 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLoggedIn ? (
                                <>
                                    {user.role === "CS_AGENT" && (
                                        <>
                                            <Badge badgeContent={invitedRequestsCount} color="secondary">
                                                <Button
                                                    disableRipple
                                                    component={Link}
                                                    to="/consultation"
                                                    className={`user-menu ${isHome && isTop ? "" : "scrolled"}`}
                                                    sx={{ display: isMobile ? 'none' : 'block' }}
                                                >
                                                    상담 요청
                                                </Button>
                                            </Badge>
                                            <Button
                                                disableRipple
                                                component={Link}
                                                to="/consultation-list"
                                                className={`user-menu ${isHome && isTop ? "" : "scrolled"}`}
                                                sx={{ display: isMobile ? 'none' : 'block' }}
                                            >
                                                상담 목록
                                            </Button>
                                        </>
                                    )}
                                    {user.role === "USER" && (
                                        <IconButton disableRipple className={`user-menu ${isHome && isTop ? "" : "scrolled"}`} color="inherit" component={Link} to="/cart">
                                            <ShoppingCartIcon />
                                        </IconButton>
                                    )}
                                    <Box sx={{ position: 'relative' }}>
                                        {!isMobile && (
                                            <Typography
                                                position="absolute"
                                                variant="caption"
                                                className="login-tag"
                                            >
                                                MY
                                            </Typography>
                                        )}
                                        <Badge badgeContent={unreadMessagesCount} color="error">
                                            <IconButton
                                                disableRipple
                                                className={`user-menu ${isHome && isTop ? "" : "scrolled"}`}
                                                color="inherit"
                                                onClick={handleUserMenuOpen}
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                        </Badge>
                                    </Box>
                                    <Menu
                                        anchorEl={userMenuAnchorEl}
                                        open={Boolean(userMenuAnchorEl)}
                                        onClose={handleUserMenuClose}
                                    >
                                        <MenuItem onClick={() => { handleUserMenuClose(); navigate("/messages"); }}>메시지 목록</MenuItem>
                                        <MenuItem onClick={() => { handleUserMenuClose(); navigate("/mypage"); }}>마이페이지</MenuItem>
                                        {user.role === "CS_AGENT" && (
                                            <MenuItem onClick={() => { handleUserMenuClose(); navigate("/consultation-list"); }}>상담 목록</MenuItem>
                                        )}
                                        {user.role === "ADMIN" && (
                                            <MenuItem onClick={() => { handleUserMenuClose(); navigate("/adminpage"); }}>관리자페이지</MenuItem>
                                        )}
                                        <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); }}>로그아웃</MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <IconButton
                                    disableRipple
                                    className={`user-menu ${isHome && isTop ? "" : "scrolled"}`}
                                    onClick={() => navigate("/login")}
                                >
                                    <PersonIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Toolbar>
            </AppBar>

            {/* 모달 메뉴 */}
            <Modal open={open} onClose={handleClose}>
                        <Box
                            sx={{
                                width: "80%",
                                maxWidth: "320px",
                                height: "100vh",
                                backgroundColor: "#fff",
                                position: "fixed",
                                left: 0,
                                top: 0,
                                padding: "20px",
                                boxShadow: "2px 0px 12px rgba(0,0,0,0.1)",
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                            }}
                        >
                            <Button
                                onClick={handleClose}
                                sx={{ textAlign: "right", width: "100%", justifyContent: "flex-end", display: "flex", fontSize: "18px" }}
                            >
                                ✕
                            </Button>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "16px", fontSize: "18px" }}>
                                영양제 추천받기 <Typography component="span" sx={{ fontSize: "12px", backgroundColor: "#FF6B6B", color: "white", padding: "3px 5px", borderRadius: "4px", marginLeft: "4px" }}>HOT</Typography>
                            </Typography>
                            {menuItems.map((item, index) => (
                                <Link key={index} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
                                    <Typography sx={{ marginBottom: "8px", fontSize: "16px", cursor: "pointer" }}>{item.label}</Typography>
                                </Link>
                            ))}
                            <Box sx={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
                                <img src="/path/to/image1.jpg" alt="필리 투게더딜" style={{ width: "105px", height: "auto", borderRadius: "12px" }} />
                                <img src="/path/to/image2.jpg" alt="PHEW by.pilly" style={{ width: "105px", height: "auto", borderRadius: "12px" }} />
                            </Box>
                            <Typography
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    padding: "10px 14px",
                                    borderRadius: "6px",
                                    display: "inline-block",
                                    marginTop: "18px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                필리 서비스, 혜택, FAQ
                            </Typography>
                            <Typography sx={{ marginTop: "34px", fontSize: "12px", color: "gray", textAlign: "center" }}>
                                © Carewith Inc. All Rights Reserved.
                            </Typography>
                        </Box>
                    </Modal>
        </>
    );
};

export default Header;
