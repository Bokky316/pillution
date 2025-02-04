import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from "react-router-dom";
import { fetchUserInfo } from "@/redux/authSlice";
import "../../assets/styles/header.css";

const Header = ({ handleLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector(state => state.auth);
    const menuOpen = useSelector(state => state.ui.menuAnchorEl);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        dispatch({ type: 'SET_MENU_ANCHOR', payload: true });
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        dispatch({ type: 'SET_MENU_ANCHOR', payload: false });
    };

    const handleMenuItemClick = (path) => {
        handleMenuClose();
        if (path === "/cart" && !isLoggedIn) {
            navigate("/login");
        } else {
            navigate(path);
        }
    };

    useEffect(() => {
        if (!menuOpen) {
            setAnchorEl(null);
        }
    }, [menuOpen]);
    useEffect(() => {
            if (isLoggedIn && !user) {
                dispatch(fetchUserInfo());
            }
        }, [isLoggedIn, user, dispatch]);

    return (
        <AppBar position="static" className="nav-bar" sx={{
            width: '100vw',
            boxShadow: 'none',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
        }}>
            <Toolbar sx={{
                minHeight: '80px',
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '1280px',
                margin: '0 auto',
                width: '100%',
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
                        <MenuItem onClick={() => handleMenuItemClick("/products")}>상품</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick("/recommendation")}>추천</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick("/cart")}>장바구니</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick("/survey")}>설문조사</MenuItem>
                    </Menu>
                </Box>

                {/* 로고 (중앙 정렬) */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <img
                            src="/src/assets/images/logo.png"
                            alt="Pillution Logo"
                            style={{ height: '50px', verticalAlign: 'middle' }}
                        />
                    </Link>
                </Box>

                {/* 로그인 상태에 따른 버튼 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoggedIn ? (
                        <>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                {user?.name}
                                {user?.roles?.includes("ROLE_ADMIN") ? " (관리자)" : " (사용자)"}
                            </Typography>
                            <Button color="inherit" onClick={() => navigate("/mypage")}>마이페이지</Button>
                            <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
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
    );
};

export default Header;
