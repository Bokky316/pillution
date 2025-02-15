import React from 'react';
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";


const Layout = ({ children }) => {

    const location = useLocation();
    // 현재 페이지가 "/adminpage" 또는 "/adminpage/*" 경로인지 확인
    const isAdminPage = location.pathname.toLowerCase().startsWith("/adminpage"); // ✅ 대소문자 구분 제거

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // 중앙 정렬
            minHeight: '100vh', // 화면 전체 높이
            backgroundColor: '#f9f9f9', // 배경색 설정 (선택 사항)
        }}>
            {/* 메인 컨텐츠 영역 */}
            <Box sx={{
                flexGrow: 1,
                width: '100%',
                maxWidth: isAdminPage ? '50%' : '480px', // 어드민 페이지일 경우 maxWidth 제거
                margin: '0 auto',
                padding: '20px',
                paddingTop: '80px', // 헤더 높이 고려
                backgroundColor: '#ffffff', // 컨텐츠 배경색 (선택 사항)
                boxShadow: isAdminPage ? 'none' : '0px 4px 10px rgba(0, 0, 0, 0.1)', // 어드민 페이지에서는 그림자 제거
                borderRadius: isAdminPage ? '0' : '8px', // 어드민 페이지에서는 모서리 제거
            }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
