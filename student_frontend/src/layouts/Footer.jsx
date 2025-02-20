import React, { useState, useEffect } from 'react';
import { Typography, useMediaQuery, useTheme, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import "@/styles/footer.css";

const Footer = () => {
    const [isBottom, setIsBottom] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            if (scrollY + windowHeight >= documentHeight - 100) {
                setIsBottom(true);
            } else {
                setIsBottom(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const footerStyle = {
        padding: isMobile ? '20px' : '25px',
        backgroundColor: '#4A4A4A',
        textAlign: 'center',
        position: 'relative',
        left: 0,
        bottom: 0,
        width: '100%',
        boxShadow: 'none',
        transition: 'box-shadow 0.3s ease-in-out',
    };

    const textStyle = {
        fontSize: isMobile ? '0.7rem' : '0.8rem',
        color: '#D3D3D3',
    };

    return (
        <footer style={footerStyle}>
            <Box sx={{ maxWidth: '600px', margin: '0 auto' }}>
                <Typography variant={isMobile ? "caption" : "body2"} style={textStyle}>
                    © 2025 Pillution. All rights reserved.
                </Typography>
                {isHomePage && !isMobile && (
                    <>
                        <Typography variant="body2" style={textStyle}>
                            상호 ㈜ 필루션 | 대표 장보키 | 사업자 등록번호 123-45-6789
                        </Typography>
                        <Typography variant="body2" style={textStyle}>
                            주소 23316 건강특별시 헬스케어구 웰니스로 42, 필루션타워 7층
                        </Typography>
                        <Typography variant="body2" style={textStyle}>
                            대표전화 010-1234-5678 | 통신판매업 신고 제 2025-건강헿스케어-0042 호
                        </Typography>
                        <Typography variant="body2" style={textStyle}>
                            이메일 support@pillution.co.kr
                        </Typography>
                    </>
                )}
            </Box>
        </footer>
    );
};

export default Footer;
