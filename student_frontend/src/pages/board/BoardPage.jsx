import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Button, Container, Box } from "@mui/material";
import NewsBoardPage from "./NewsBoardPage"; // 소식 게시판 페이지
import FAQBoardPage from "./FAQBoardPage";   // 자주 묻는 질문 게시판 페이지

function BoardPage() {
    const location = useLocation();

    return (
        <Container>
            <h2>필루션 소식</h2>

            {/* 게시판 선택 버튼 */}
            <Box display="flex" justifyContent="center" mb={2}>
                <Button
                    variant={location.pathname === "/board/news-board" ? "contained" : "outlined"}
                    component={Link}
                    to="/board/news-board"
                    style={{ marginRight: "10px" }}
                >
                    소식 게시판
                </Button>
                <Button
                    variant={location.pathname === "/board/faq-board" ? "contained" : "outlined"}
                    component={Link}
                    to="/board/faq-board"
                >
                    자주 묻는 질문
                </Button>
            </Box>

            {/* 기본적으로 소식 게시판이 보이도록 설정 */}
            <Routes>
                <Route path="/" element={<Navigate to="/board/news-board" />} />
                <Route path="/news-board" element={<NewsBoardPage />} />
                <Route path="/faq-board" element={<FAQBoardPage />} />
            </Routes>
        </Container>
    );
}

export default BoardPage;
