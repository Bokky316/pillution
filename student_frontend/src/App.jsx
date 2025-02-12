import React from "react";
import {
    CircularProgress
} from "@mui/material";
import { useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { persistor } from "@/redux/store";

import { API_URL } from "@/constant";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import Layout from "@components/layout/Layout";

import RecommendationPage from "@/pages/survey/RecommendationPage";
import SurveyPage from "@/pages/survey/SurveyPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductListPage from "@/pages/product/ProductListPage";
import CartPage from "@/pages/cart/CartPage";
import BoardPage from "@/pages/board/BoardPage";
import NewsBoardPage from "@/pages/board/NewsBoardPage";
import FAQBoardPage from "@/pages/board/FAQBoardPage";
import PostDetailPage from "@/pages/board/PostDetailPage";
import PostCreatePage from "@/pages/board/PostCreatePage";
import PostEditPage from "@/pages/board/PostEditPage";
import AdminPage from "@/pages/admin/AdminPage";
import Login from "@features/auth/components/Login";
import MyPage from "@features/auth/components/MyPage";
import RegisterMember from "@features/auth/components/RegisterMember";
import UnauthorizedPage from "@features/auth/components/UnAuthorizedPage";
import OAuth2RedirectHandler from '@features/auth/components/OAuth2RedirectHandler';
import MessageList from "@features/auth/components/MessageList";
import ConsultationRequestList from "@features/chat/ConsultationRequestList"; // ✅ ChatRoomList 컴포넌트 import
import FloatingConsultationButton from "@features/chat/FloatingConsultationButton";
import ChatRoom from "@features/chat/ChatRoom";

import useAuth from "@/hook/useAuth";
import useWebSocket from "@hook/useWebSocket";
import useMessage from "@hook/useMessage";

function App() {
    const { isLoading, isLoggedIn, user } = useAuth();
    useWebSocket(user);
    const { delayedUnreadCount } = useMessage(user?.id);

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div className="App">
            <Header />
            <Layout>
                <Routes>
                    {/* Routes */}
                    <Route path="/" element={<ProductListPage />} />
                    <Route path="/recommendation" element={<RecommendationPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/survey" element={<SurveyPage />} />
                    <Route path="/board/*" element={<BoardPage />} />
                    <Route path="/news" element={<NewsBoardPage />} />
                    <Route path="/faq" element={<FAQBoardPage />} />
                    <Route path="/post/:postId" element={<PostDetailPage />} />
                    <Route path="/post/create" element={<PostCreatePage />} />
                    <Route path="/post/:postId/edit" element={<PostEditPage />} />
                    <Route path="/faq/post/:postId/edit" element={<PostEditPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/registerMember" element={<RegisterMember />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                    <Route path="/messages" element={<MessageList />} />
                    <Route path="/consultation" element={<ConsultationRequestList />} />
                    <Route path="/chatroom/:roomId" element={<ChatRoom />} />
                    <Route path="/adminpage/*" element={<AdminPage />} />
                </Routes>
            </Layout>
            <Footer />
            <FloatingConsultationButton/>
        </div>
    );
}

export default App;
