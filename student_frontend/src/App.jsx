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
            console.warn("로그인되지 않은 상태입니다.");
            removeAuthData();
            setIsLoggedIn(false);
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
        <ThemeProvider theme={theme}>
            <Router>
                <div className="App">
                    <Header
                        isLoggedIn={isLoggedIn}
                        loggedInUser={loggedInUser}
                        handleLogout={handleLogout}
                    />
                    <Routes>
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/registerMember" element={<RegisterMember />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/recommendations" element={<RecommendationPage />} />
                        <Route path="/survey" element={<SurveyPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/:productId" element={<ProductDetailPage />} />
                        <Route path="/productList" element={<ProductListPage />} />
                        <Route path="/cart" element={<CartPage />} />
                    </Routes>
                    <Footer />
                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
