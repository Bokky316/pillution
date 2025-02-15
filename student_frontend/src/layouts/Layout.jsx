import React from 'react';
import { Box } from "@mui/material";

const Layout = ({ children }) => {
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
                maxWidth: '480px', // 모바일 중심 UI의 폭 (보통 360~480px)
                margin: '0 auto',
                padding: '20px',
                paddingTop: '80px', // 헤더 높이 고려
                backgroundColor: '#ffffff', // 컨텐츠 배경색 (선택 사항)
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // 카드 스타일 그림자
                borderRadius: '8px', // 둥근 모서리 (선택 사항)
            }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
