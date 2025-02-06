import React from 'react';
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "../../assets/styles/footer.css";

const Footer = () => {
    return (
        <footer style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            textAlign: 'center',
            left: 0,
            bottom: 0,
            width: '100%'
        }}>
            <Typography variant="body2" color="text.secondary">
                © 2025 Pillution. All rights reserved.<br />
                상호 ㈜ 필루션 | 대표 장보키 | 사업자 등록번호 123-45-6789<br />
                주소 23316 건강특별시 헬스케어구 웰니스로 42, 필루션타워 7층<br />
                대표전화 010-1234-5678 | 통신판매업 신고 제 2025-건강헿스케어-0042 호<br />
                이메일 support@pillution.co.kr
            </Typography>
        </footer>
    );
};

export default Footer;
