import React, { useEffect } from 'react';
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === "/"; // 홈 페이지 여부 확인

    useEffect(() => {
        if (isHomePage) {
            document.body.style.overflowX = "hidden"; // 홈 페이지에서는 수평 스크롤 비활성화
        } else {
            document.body.style.overflowX = "auto"; // 다른 페이지에서는 원래대로
        }

        return () => {
            document.body.style.overflowX = "auto"; // 언마운트 시 원래대로 복구
        };
    }, [isHomePage]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f9f9f9',
        }}>
            {/* 메인 컨텐츠 영역 */}
            <Box sx={{
                flexGrow: 1,
                width: '100%',
                maxWidth: isHomePage ? "100%" : "480px", // 홈 페이지면 maxWidth 100% 적용, 그 외에는 모바일 중심 UI의 폭 (보통 360~480px)
                marginTop: '64px', // 헤더 높이만큼의 여백 추가
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0, // 나머지 방향은 0으로 설정
                padding: isHomePage ? 0 : '20px', // 홈 페이지면 padding 제거
                paddingTop: isHomePage ? 0 : '80px', // 홈 페이지면 paddingTop 제거
                backgroundColor: isHomePage ? 'transparent' : '#ffffff', // 홈 페이지에서는 배경색 투명
                boxShadow: isHomePage ? "none" : "0px 4px 10px rgba(0, 0, 0, 0.1)", // 카드 스타일 그림자, 홈 페이지에서는 그림자 제거
                borderRadius: isHomePage ? 0 : '8px', // 홈 페이지에서는 border-radius 제거
            }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
