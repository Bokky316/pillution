import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import {
    AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Typography, Badge, useMediaQuery
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from "react-router-dom";
import { clearUser } from "@/store/authSlice";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn } = useSelector(state => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const unreadMessagesCount = useSelector(state => state.messages.unreadCount || 0);
    const invitedRequestsCount = useSelector(state => state.chat.invitedRequestsCount || 0);

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

    return (
        <AppBar position="fixed" sx={{
            backgroundColor: isAdminPage ? '#ffffff' : '#f4f4f4', // 어드민 페이지일 경우 흰색 배경
            boxShadow: isAdminPage ? 'none' : 'none',
            color: '#000000',
            zIndex: 1100,
        }}>
            <Toolbar sx={{
                display: 'flex',
                justifyContent: 'space-between', // 왼쪽, 중앙, 오른쪽 정렬
                alignItems: 'center',
                maxWidth:  '480px', // 어드민 페이지에서는 maxWidth 제거
                width: '100%',
                margin: '0 auto',
                padding: '0 16px', // 좌우 패딩 추가
            }}>
                {/* 왼쪽 메뉴 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenuOpen}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate("/products"); }}>상품</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate("/recommendation"); }}>추천</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate("/survey"); }}>설문조사</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate("/subscription"); }}>구독</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate("/board"); }}>필루션소식</MenuItem>
                    </Menu>
                </Box>

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
                            style={{
                                height: isMobile ? '40px' : '50px', // 모바일에서는 로고 크기 축소
                                verticalAlign: 'middle'
                            }}
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
                                          color="inherit"
                                          component={Link}
                                          to="/consultation"
                                          sx={{ display: isMobile ? 'none' : 'block' }}
                                      >
                                          상담 요청
                                      </Button>
                                  </Badge>
{/*                                   <Button */}
{/*                                       color="inherit" */}
{/*                                       component={Link} */}
{/*                                       to="/consultation-list" */}
{/*                                       sx={{ display: isMobile ? 'none' : 'block' }} */}
{/*                                   > */}
{/*                                       상담 목록 */}
{/*                                   </Button> */}
                              </>
                          )}
                          <IconButton color="inherit" component={Link} to="/cart">
                              <ShoppingCartIcon />
                          </IconButton>
                          <Box sx={{ position: 'relative' }}>
                              {!isMobile && (
                                  <Typography
                                      variant="caption"
                                      sx={{
                                          position: 'absolute',
                                          top: '-16px',
                                          right: '0',
                                          fontWeight: 'bold',
                                          color: '#1976d2',
                                      }}
                                  >
                                      My
                                  </Typography>
                              )}
                              <Badge badgeContent={unreadMessagesCount} color="error">
                                  <IconButton
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
                      <>
                          <IconButton
                              color="inherit"
                              onClick={() => navigate("/login")}
                          >
                              <ShoppingCartIcon />
                          </IconButton>
                          <IconButton
                              color="inherit"
                              onClick={() => navigate("/login")}
                          >
                              <PersonIcon />
                          </IconButton>
                      </>
                  )}
              </Box>
                </Toolbar>
        </AppBar>
    );
};

export default Header;
