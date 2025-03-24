import React, { useState, useEffect } from 'react';
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
// 이미지 import 방식으로 변경
import menuModalImg1 from "@/assets/images/menu-modal-img1.png";
import menuModalImg2 from "@/assets/images/menu-modal-img2.png";
import logo from "@/assets/images/logo.png"; // 로고 이미지 import

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
        { label: "스토어", path: "/products" },
        { label: "필루션후기"},
        { label: "스토리" },
        { label: "브랜드스토리" },
    ];

    return (
        <>
            <AppBar position="fixed" className={`container ${isHome && isTop ? "" : "scrolled"}`} >
                <Toolbar position="relative" className="nav-bar">
                    {/* 햄버거 메뉴 버튼 */}
                    <IconButton disableRipple className={`ham-menu ${isHome && isTop ? "" : "scrolled"}`} sx={{ marginLeft:'3px' }} edge="start" onClick={handleOpen}>
                      <MenuIcon />
                    </IconButton>

                    {/* 중앙 로고 */}
                    <Box className="logo-box" position="absolute" >
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img
                                src={logo} {/* import한 로고 이미지 사용 */}
                                alt="Pillution Logo"
                                className="logo"
                            />
                        </Link>
                    </Box>

                    {/* 오른쪽 사용자 정보 */}
                    <Box sx={{ display: 'flex', alignItems: 'center',marginRight:'25px' }}>
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
                                                sx={{ display: isMobile ? 'none' : 'block',
                                                  "&:hover": {
                                                      backgroundColor: "transparent", // 마우스 올렸을 때 배경색을 투명하게 설정
                                                  }
                                                }}
                                            >
                                                상담 요청
                                            </Button>
                                        </Badge>
                                        <Button
                                            disableRipple
                                            component={Link}
                                            to="/consultation-list"
                                            className={`user-menu ${isHome && isTop ? "" : "scrolled"}`}
                                            sx={{ display: isMobile ? 'none' : 'block',
                                              "&:hover": {
                                                  backgroundColor: "transparent", // 마우스 올렸을 때 배경색을 투명하게 설정
                                              }
                                            }}
                                        >
                                            상담 목록
                                        </Button>
                                    </>
                                )}
                                {user && (
                                    <IconButton disableRipple className={`user-menu ${isHome && isTop ? "" : "scrolled"}`} sx={{ marginRight:"8px",marginLeft:"8px" }} color="inherit" component={Link} to="/cart">
                                        <ShoppingCartIcon />
                                    </IconButton>
                                )}
                                <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                    {!isMobile && (
                                        <Typography
                                            variant="caption"
                                            className="login-tag"
                                            sx={{
                                                position: "absolute",
                                                top: "28px", // 위쪽 위치 고정
                                                left: "50%",  // 가운데 정렬
                                                transform: "translateX(-50%)",  // 정확한 중앙 위치
                                                fontSize: "10px",  // 작은 텍스트
                                                fontWeight: "bold",
                                                backgroundColor: "#4169E1",
                                                color: "white",
                                                padding: "0px 3px",
                                                borderRadius: "10px",
                                                pointerEvents: "none",
                                                whiteSpace: "nowrap",  // 텍스트 줄바꿈 방지
                                            }}
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

                                <Box sx={{ position: "relative", display: "inline-block" }}>
                                    <Menu
                                        anchorEl={userMenuAnchorEl}
                                        open={Boolean(userMenuAnchorEl)}
                                        onClose={handleUserMenuClose}
                                        disableScrollLock={true}
                                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}  // 아이콘 아래에서 열림
                                        transformOrigin={{ vertical: "top", horizontal: "center" }}  // 위에서 아래로 펼쳐짐
                                        sx={{
                                            mt: 1.5,  // 메뉴 위치를 더 아래로 조정
                                            "& .MuiPaper-root": {
                                                backgroundColor: "#ffffff",  // 배경 흰색
                                                borderRadius: "12px",  // 둥근 모서리
                                                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",  // 부드러운 그림자
                                                padding: "10px 0",
                                                minWidth: "180px",  // 메뉴 너비
                                                overflow: "hidden",  // 내부 요소 넘침 방지
                                            },
                                            "& .MuiMenuItem-root": {
                                                fontSize: "14px",  // 폰트 크기
                                                fontWeight: "500",  // 글자 두께
                                                padding: "12px 36px",  // 패딩
                                                display: "flex",  // 플렉스 적용
                                                alignItems: "center",  // 수직 중앙 정렬
                                                gap: "9px",  // 아이콘과 텍스트 간격 조정
                                                transition: "background 0.2s",
                                                "&:hover": {
                                                    backgroundColor: "#f5f5f5",  // 마우스 올렸을 때 배경색 변경
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/messages"); }}>
                                            <span>📩</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>메시지 목록</Box>
                                        </MenuItem>
                                        <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/mypage"); }}>
                                            <span>🙋</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>마이페이지</Box>
                                        </MenuItem>
                                        <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/subscription"); }}>
                                            <span>📦</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>구독관리</Box>
                                        </MenuItem>
                                        <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/recommendation"); }}>
                                            <span>⭐</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>추천결과</Box>
                                        </MenuItem>
                                        {user.role === "CS_AGENT" && (
                                            <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/consultation-list"); }}>
                                                <span>📝</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>상담 목록</Box>
                                            </MenuItem>
                                        )}
                                        {user.role === "ADMIN" && (
                                            <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); navigate("/adminpage"); }}>
                                                <span>🔧</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>관리자페이지</Box>
                                            </MenuItem>
                                        )}
                                        <MenuItem sx={{ display: "flex", alignItems: "center" }} onClick={() => { handleUserMenuClose(); handleLogout(); }}>
                                            <span>🚪</span> <Box sx={{ flexGrow: 1, textAlign: "center" }}>로그아웃</Box>
                                        </MenuItem>
                                    </Menu>
                                </Box>
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
            <Modal open={open} onClose={handleClose} disableScrollLock={true}>
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "350px",
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
                    <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <Button
                            onClick={handleClose}
                            sx={{
                                all: "unset",  // 기본 버튼 스타일 제거
                                cursor: "pointer",  // "X" 표시 부분만 클릭 가능
                                display: "inline-block",  // 내용(X)만 차지하도록 변경
                                fontSize: "18px"  // X 글자 크기 유지
                            }}
                        >
                            ✕
                        </Button>
                    </Box>
                    <Link to="/survey" style={{ textDecoration: "none", color: "inherit" }} onClick={handleClose} >
                        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "16px", fontSize: "18px" }}>
                            영양제 추천받기
                            <Typography component="span" sx={{ fontSize: "12px", backgroundColor: "#FF6B6B", color: "white", padding: "3px 5px", borderRadius: "4px", marginLeft: "4px" }}>HOT</Typography>
                        </Typography>
                    </Link>
                    {menuItems.map((item, index) => (
                        item.path ? (
                            // 링크가 있는 경우, <Link> 사용
                            <Link
                                key={index}
                                to={item.path}
                                style={{ textDecoration: "none", color: "inherit" }}
                                onClick={handleClose}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            </Link>
                        ) : (
                            <Typography
                                key={index}
                                sx={{
                                    fontSize: "16px",
                                    marginBottom: "8px",
                                    cursor: "default"
                                }}
                            >
                                {item.label}
                            </Typography>
                        )
                    ))}
                    <Box sx={{ display: "flex", gap: "8px", marginTop: "10px", justifyContent: "center", marginBottom: "15px" }}>
                        <img src={menuModalImg1} alt="필리 투게더딜" style={{ width: "150px", height: "auto", borderRadius: "12px 12px 0 0", margin: "0 8px" }} />
                        <img src={menuModalImg2} alt="PHEW by.pilly" style={{ width: "150px", height: "auto", borderRadius: "12px 12px 0 0", margin: "0 8px" }} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {/* 필루션소식 및 FAQ */}
                        <Link to="/board" style={{ textDecoration: "none", color: "inherit" }} onClick={handleClose}>
                            <Typography sx={{ fontSize: "16px", cursor: "pointer", marginBottom: "8px" }}>
                                필루션소식 및 FAQ
                            </Typography>
                        </Link>

                        {/* 회원 혜택 */}
                        <Typography sx={{ fontSize: "16px", cursor: "default" }}>
                            회원 혜택
                        </Typography>

                        {/* 필루션 사용 가이드 + 말풍선 */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Typography sx={{ fontSize: "16px", cursor: "default" }}>
                                필루션 사용 가이드
                            </Typography>

                            {/* 말풍선 스타일 적용 */}
                            <Typography
                                sx={{
                                    position: "relative",
                                    marginLeft: "15px",
                                    backgroundColor: "black",
                                    color: "white",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    display: "inline-block",
                                    fontSize: "14px",
                                    cursor: "default",
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: "-12px", // 꼬리 위치 조정
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        borderWidth: "6px",
                                        borderStyle: "solid",
                                        borderColor: "transparent black transparent transparent",
                                    }
                                }}
                            >
                                필루션 서비스, 혜택, FAQ
                            </Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ marginTop: "34px", fontSize: "12px", color: "gray", textAlign: "center" }}>
                        © Carewith Inc. All Rights Reserved.
                    </Typography>
                </Box>
            </Modal>
        </>
    );
};

export default Header;