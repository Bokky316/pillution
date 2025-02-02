import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import '@/App.css';
import theme from '@/theme';
import Footer from "@components/layout/Footer";
import { fetchUserInfo, clearUser } from "@features/auth/authSlice";
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
import { persistor } from "@/redux/store";

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
        <ThemeProvider theme={theme}>
            <div className="App">
                {/* 여기에 Header 컴포넌트를 추가할 수 있습니다 */}
                <Routes>
                    <Route path="/" element={<Home />} />
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
    );
}

export default App;
