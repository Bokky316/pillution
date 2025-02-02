import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import '@/App.css';
import theme from '@/theme';
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import { setUser, clearUser, fetchUserInfo } from "@/redux/authSlice";
import { fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
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
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";




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
    console.log("App 컴포넌트 렌더링");
    // 리덕스 스토어의 상태를 가져오기 위해 useSelector 훅 사용, auth 슬라이스에서 user, isLoggedIn 상태를 가져옴
    // user: 사용자 정보 객체, isLoggedIn: 로그인 여부
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    console.log("Redux 상태:", { user, isLoggedIn });

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
            await persistor.purge(); // Redux Persist 데이터 초기화
            window.location.href = "/";
        } catch (error) {
            console.error("로그아웃 실패:", error.message);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    };

    return (
        <ThemeProvider theme={theme}>
                <div className="App">
                    <Header
                        isLoggedIn={isLoggedIn}
                        user={user}
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
        </ThemeProvider>
    );
}


export default App;
