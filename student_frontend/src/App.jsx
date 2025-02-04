import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import '@/App.css';
import theme from '@/theme';
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import { setUser, clearUser, fetchUserInfo } from "@/redux/authSlice";
import RecommendationPage from "@/pages/survey/RecommendationPage";
import SurveyPage from "@/pages/survey/SurveyPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductListPage from "@/pages/product/ProductListPage";
import CartPage from "@/pages/cart/CartPage";
import Login from "@features/auth/components/Login";
import MyPage from "@features/auth/components/MyPage";
import RegisterMember from "@features/auth/components/RegisterMember";
import UnauthorizedPage from "@features/auth/components/UnAuthorizedPage";
import { API_URL } from "@/constant";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import OAuth2RedirectHandler from '@features/auth/components/OAuth2RedirectHandler';

function App() {
    // Redux 상태에서 user와 isLoggedIn 정보를 가져옵니다.
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    // 컴포넌트가 마운트될 때 로그인 상태를 확인합니다.
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    // 사용자 정보를 Redux 상태에 저장합니다.
                    dispatch(setUser({
                        ...data,
                        isSocialLogin: !!data.provider, // provider 존재 여부로 소셜 로그인 판단
                    }));
                } else {
                    dispatch(clearUser());
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                dispatch(clearUser());
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [dispatch]);

    // 로그인 상태이지만 사용자 정보가 없는 경우, 사용자 정보를 가져옵니다.
    useEffect(() => {
        if (isLoggedIn && !user) {
            dispatch(fetchUserInfo());
        }
    }, [isLoggedIn, user, dispatch]);

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}auth/logout`, {
                method: "POST",
            });
            if (response.ok) {
                dispatch(clearUser());
                await persistor.purge(); // Redux Persist 데이터 초기화

                // 모든 쿠키 삭제
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                window.location.href = "/";
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    };

    // 로딩 중일 때 표시할 내용
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Header
                    isLoggedIn={isLoggedIn}
                    user={user}
                    handleLogout={handleLogout}
                />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/registerMember" element={<RegisterMember />} />
                    <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />
                    <Route path="/recommendation" element={<RecommendationPage />} />
                    <Route path="/survey" element={<SurveyPage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                </Routes>
                <Footer />
            </div>
        </ThemeProvider>
    );
}

export default App;
