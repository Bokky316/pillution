import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from "react-router-dom";
import "../../assets/styles/header.css";

const Header = ({ handleLogout }) => {
    const dispatch = useDispatch();
    const { user, isLoggedIn } = useSelector(state => state.auth);

    const handleMenuOpen = (event) => {
        dispatch({ type: 'SET_MENU_ANCHOR', payload: event.currentTarget });
    };

    const handleMenuClose = () => {
        dispatch({ type: 'SET_MENU_ANCHOR', payload: null });
    };

    const menuAnchorEl = useSelector(state => state.ui.menuAnchorEl);

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
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleMenuClose} component={Link} to="/productList">상품</MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/recommendations">추천</MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/cart">장바구니</MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/survey">설문조사</MenuItem>
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
                                {user.name}
                                {user.roles?.includes("ROLE_ADMIN") ? " (관리자)" : " (사용자)"}
                            </Typography>
                            <Button color="inherit" component={Link} to="/mypage">마이페이지</Button>
                            <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login" sx={{ mr: 1 }}>로그인</Button>
                            <Button color="inherit" component={Link} to="/register">회원가입</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
