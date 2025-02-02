import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import theme from './theme';
import Header from "./component/layout/Header";
import Footer from "./component/layout/Footer";
import './App.css';
import RecommendationPage from "./pages/survey/RecommendationPage";
import SurveyPage from "./pages/survey/SurveyPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import ProductListPage from "./pages/product/ProductListPage";
import CartPage from "./pages/cart/CartPage";
import Login from "./features/auth/components/Login";
import MyPage from "./features/auth/components/MyPage";
import RegisterMember from "./features/auth/components/RegisterMember";
import { API_URL } from "./constant";
import { fetchWithAuth } from "./features/auth/utils/fetchWithAuth";
import { fetchUserInfo, clearUser } from "./redux/authSlice";
import { persistor } from "./redux/store";

/**
 * App 컴포넌트
 * - React 애플리케이션의 루트 컴포넌트로, 라우팅 및 전체 애플리케이션 구조를 담당.
 * - 사용자는 학생 목록 조회, 학생 추가, 사용자 정보 관리 등의 기능에 접근 가능.
 *
 * 주요 기능:
 * 1. 리덕스 상태 관리:
 *    - Redux의 `useSelector`를 사용해 사용자 정보(`user`) 및 로그인 여부(`isLoggedIn`)를 확인.
 *    - `useDispatch`를 사용해 `fetchUserInfo`를 호출하여 사용자 정보를 가져옴.
 *
 * 2. 로그인 여부 및 권한에 따른 UI 제어:
 *    - 로그인 여부와 권한(`ROLE_ADMIN`)에 따라 다른 메뉴 버튼 및 접근 권한 제공.
 *
 * 3. 라우팅 처리:
 *    - React Router를 활용해 다양한 URL 경로에 따라 적절한 컴포넌트를 렌더링.
 *    - 관리자인 경우 학생 추가 및 편집 페이지에 접근 가능.
 *    - 로그인하지 않은 사용자는 접근 제한 페이지(`/unauthorized`)로 리디렉션.
 *
 * 4. 로그아웃 처리:
 *    - JWT 기반 로그아웃 구현. `fetchWithAuth`로 서버 로그아웃 요청 후 Redux Persist 데이터를 초기화하고 초기 화면으로 리디렉션.
 *
 * 5. `<PersistGate>`:
 *    - Redux Persist를 사용해 상태를 유지하며 비동기 저장소가 초기화될 때까지 대기.
 *    - `loading` 프로퍼티로 초기화 동안 렌더링할 컴포넌트를 설정 가능. 여기서는 `null`로 설정.
 *    - 비동기적으로 유지된 데이터를 안정적으로 불러오기 위해 사용.
 *
 * @returns App 컴포넌트 JSX
 */

function App() {
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user && isLoggedIn) {
            dispatch(fetchUserInfo());
        }
    }, [user, isLoggedIn, dispatch]);

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

    return (
        <>
            <Router>
                <ThemeProvider theme={theme}>
                    <div className="App">
                        <AppBar position="static">
                            <Toolbar>
                                <Typography variant="h3" style={{ flexGrow: 1 }}>
                                    <Button color="inherit" component={Link} to="/">학생관리시스템</Button>
                                    {isLoggedIn && (
                                        <Button color="inherit" component={Link} to="/listStudent">학생목록</Button>
                                    )}
                                    {isLoggedIn && user?.roles?.includes("ROLE_ADMIN") && (
                                        <Button color="inherit" component={Link} to="/addStudent">학생 등록</Button>
                                    )}
                                    {isLoggedIn && (
                                        <Button color="inherit" component={Link} to={`/mypage/${user?.id}`}>
                                            마이페이지
                                        </Button>
                                    )}
                                </Typography>
                                {isLoggedIn ? (
                                    <>
                                        <Typography variant="body1" style={{ marginRight: "10px", fontSize: "14px" }}>
                                            {user.name} {user.roles?.includes("ROLE_ADMIN") ? "(관리자)" : "(사용자)"}
                                        </Typography>
                                        <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
                                    </>
                                ) : (
                                    <Button color="inherit" component={Link} to="/login">로그인</Button>
                                )}
                            </Toolbar>
                        </AppBar>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/listStudent" element={<StudentList />} />
                            <Route
                                path="/addStudent"
                                element={
                                    user?.roles?.includes("ROLE_ADMIN") ? (
                                        <AddStudent />
                                    ) : (
                                        <Navigate to="/unauthorized" replace />
                                    )
                                }
                            />
                            <Route path="/registerMember" element={<RegisterMember />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/mypage/:id" element={<MyPage />} />
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />
                            <Route path="/recommendation" element={<RecommendationPage />} />
                            <Route path="/survey" element={<SurveyPage />} />
                            <Route path="/products" element={<ProductListPage />} />
                            <Route path="/products/:productId" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CartPage />} />
                        </Routes>
                        <Footer />
                    </div>
                </ThemeProvider>
            </Router>
        </>
    );
}

export default App;
