import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import '@/App.css';
import theme from '@/theme';
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import { setUser, clearUser } from "@/redux/userSlice";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import RecommendationPage from "@/pages/survey/RecommendationPage";
import SurveyPage from "@/pages/survey/SurveyPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductListPage from "@/pages/product/ProductListPage";
import CartPage from "@/pages/cart/CartPage";
import Login from "@features/auth/components/Login";
import MyPage from "@features/auth/components/MyPage";
import RegisterMember from "@features/auth/components/RegisterMember";
import UnauthorizedPage from "@features/auth/components/UnAuthorizedPage";
import Home from "@features/auth/components/Home";
import { API_URL } from "@/constant";

function App() {
    const dispatch = useDispatch();
    const { name: userName, isLoggedIn } = useSelector(state => state.user);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserInfo();
        } else {
            dispatch(clearUser());
        }
    }, [dispatch]);

    const fetchUserInfo = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}auth/userInfo`);
            if (!response.ok) {
                throw new Error("사용자 정보 가져오기 실패");
            }
            const userData = await response.json();
            dispatch(setUser({ name: userData.name }));
        } catch (error) {
            console.error("사용자 정보 가져오기 오류:", error.message);
            dispatch(clearUser());
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}auth/logout`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("로그아웃 실패");
            }
        } catch (error) {
            console.error("로그아웃 오류:", error.message);
        } finally {
            dispatch(clearUser());
            window.location.href = '/login';
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <div className="App">
                    <Header
                        isLoggedIn={isLoggedIn}
                        userName={userName}
                        handleLogout={handleLogout}
                    />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registerMember" element={<RegisterMember />} />
                        <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />
                        <Route path="/recommendation" element={<RecommendationPage />} />
                        <Route path="/survey" element={<SurveyPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/:productId" element={<ProductDetailPage />} />
                        <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    </Routes>
                    <Footer />
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
