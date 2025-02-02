import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
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
import { setTokenAndUser, getUserFromLocalStorage, removeAuthData } from "./features/auth/utils/authUtil";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState({ email: "", name: "", roles: [] });

    useEffect(() => {
        const storedUser = getUserFromLocalStorage();
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            setLoggedInUser(storedUser);
            setIsLoggedIn(true);
        } else if (token) {
            fetchUserInfo();
        } else {
            removeAuthData();
            setIsLoggedIn(false);
            console.warn("로그인되지 않은 상태입니다.");
        }
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await fetchWithAuth(API_URL + "auth/userInfo");
            if (!response || !response.ok) {
                throw new Error("사용자 정보 가져오기 실패");
            }
            const userData = await response.json();
            setTokenAndUser(localStorage.getItem("token"), userData);
            setLoggedInUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("사용자 정보 가져오기 오류:", error.message);
            removeAuthData();
            setIsLoggedIn(false);
        }
    };

    const handleLogin = (user, token) => {
        setTokenAndUser(token, user);
        setLoggedInUser(user);
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            const response = await fetchWithAuth(API_URL + "auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("로그아웃 실패");
            }
        } catch (error) {
            console.error("로그아웃 오류:", error.message);
        } finally {
            removeAuthData();
            setLoggedInUser({ email: "", name: "", roles: [] });
            setIsLoggedIn(false);
            window.location.href = '/login';
        }
    };

    return (
            <div className="App">
                {/*헤더 부분*/}
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h3" style={{ flexGrow: 1 }}>
                            <Button color="inherit" component={Link} to="/">홈</Button>
                            <Button color="inherit" component={Link} to="/listStudent">학생목록</Button>
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
                                <Typography
                                    variant="body1"
                                    style={{ marginRight: "10px", fontSize: "14px" }}
                                >
                                    {user.name}{" "}
                                    {user.roles?.includes("ROLE_ADMIN") ? "(관리자)" : "(사용자)"}
                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
                            </>
                        ) : (
                            <Button color="inherit" component={Link} to="/login">로그인</Button>
                        )}
                    </Toolbar>
                </AppBar>
                    {/*라우팅 부분*/}
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
                        <Route path="/viewStudent/:id" element={<ViewStudent />} />
                        {isLoggedIn && user?.roles?.includes("ROLE_ADMIN") && (
                            <>
                                <Route path="/editStudent/:id" element={<EditStudent />} />
                            </>
                        )}
                        <Route path="/registerMember" element={<RegisterMember />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/mypage/:id" element={<MyPage />} />
                        {/* React Router는 상단부터 Routes에 정의된 Route를 순차적으로 검사. 모든 요청을 UnauthorizedPage로 리디렉션, 위에서 부터 순차적으로 진행됨 */}
                        {/*<Route path="*" element={<UnauthorizedPage />} />*/}
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        <Route path="/recommendation" element={<RecommendationPage />} />
                        <Route path="/survey" element={<SurveyPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/:productId" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
