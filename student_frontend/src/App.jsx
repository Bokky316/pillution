import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./component/layout/Header";
import Footer from "./component/layout/Footer";
import RecommendationPage from "./pages/survey/RecommendationPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import StudentList from "./features/student/StudentList";
import AddStudent from "./features/student/AddStudent";
import Login from "./features/auth/components/Login";
import MyPage from "./features/auth/components/MyPage";
import ViewStudent from "./features/student/ViewStudent";
import EditStudent from "./features/student/EditStudent";
import RegisterMember from "./features/auth/components/RegisterMember";
import { API_URL } from "./constant";
import { fetchWithAuth } from "./features/auth/utils/fetchWithAuth";
import { setTokenAndUser, getUserFromLocalStorage, removeAuthData } from "./features/auth/utils/authUtil";


function App() {
    // 로그인 상태를 저장할 상태변수
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 상태인데 사용자 정보를 저장할 상태변수
    const [loggedInUser, setLoggedInUser] = useState({ email: "", name: "", roles: [] });

    // 컴포넌트 로드 시 로컬 스토리지와 서버에서 사용자 정보 가져오기
    useEffect(() => {
        const storedUser = getUserFromLocalStorage();
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            // 로컬 스토리지에 사용자 정보와 토큰이 모두 있는 경우
            setLoggedInUser(storedUser); // 사용자 정보 설정하고
            setIsLoggedIn(true);    // 로그인 상태로 설정한다.
        } else if (token) {
            // 로컬 스토리지에 사용자 정보는 없지만 토큰이 있는 경우는 서버에서 사용자 정보를 가져온다.
            fetchUserInfo();
        } else {
            // 로컬 스토리지에 사용자 정보나 토큰이 없는 경우
            console.warn("로그인되지 않은 상태입니다.");
            removeAuthData(); // 혹시라도 남아있는 인증 데이터를 삭제
            setIsLoggedIn(false);
        }
    }, []);

    // 서버에서 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        try {
            const response = await fetchWithAuth(API_URL + "auth/userInfo");
            if (!response || !response.ok) {
                throw new Error("사용자 정보 가져오기 실패");
            }
            const userData = await response.json();
            setTokenAndUser(localStorage.getItem("token"), userData); // 토큰과 사용자 정보 저장
            setLoggedInUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("사용자 정보 가져오기 오류:", error.message);
            removeAuthData();
            setIsLoggedIn(false);
        }
    };


    // 로그인 처리, 로그인 컴포넌트에서 호출되어 사용자 정보와 토큰을 로컬 스토리지에 저장
    const handleLogin = (user, token) => {
        // 1. 토큰과 사용자 정보를 localStorage에 저장
        setTokenAndUser(token, user);
        // 2. localStorage에 저장한 �����을 확인
        setLoggedInUser(user);
        // 3. 로그인 상태로 설정
        setIsLoggedIn(true);
    };

    // [수정] 로그아웃 처리
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
            // 항상 localStorage 데이터 제거
            removeAuthData();
            setLoggedInUser({ email: "", name: "", roles: [] });
            setIsLoggedIn(false);
            window.location.href = '/login';
        }
    };



    return (
        <Router>
            <div className="App">
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h3" style={{ flexGrow: 1 }}>
                            <Button color="inherit" component={Link} to="/">학생 목록</Button>
                            <Button color="inherit" component={Link} to="/addStudent">학생 등록</Button>
                            {isLoggedIn && (
                                <Button color="inherit" component={Link} to="/mypage">마이페이지</Button>
                            )}
                        </Typography>
                        {isLoggedIn ? (
                            <>
                                <Typography variant="body1" style={{ marginRight: "10px", fontSize: "14px" }}>
                                    {loggedInUser.name}
                                    {loggedInUser.roles && loggedInUser.roles.includes("ROLE_ADMIN") ? " (관리자)" : " (사용자)"}

                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
                            </>
                        ) : (
                            <Button color="inherit" component={Link} to="/login">로그인</Button>
                        )}
                    </Toolbar>
                </AppBar>
                <Routes>
                    <Route path="/" element={<StudentList />} />
                    <Route path="/addStudent" element={<AddStudent />} />
                    <Route path="/viewStudent/:id" element={<ViewStudent />} />
                    <Route path="/editStudent/:id" element={<EditStudent />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/registerMember" element={<RegisterMember />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/recommendations" element={<RecommendationPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
