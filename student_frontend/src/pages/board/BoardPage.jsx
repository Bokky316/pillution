import React, { useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import NewsBoardPage from "./NewsBoardPage";
import FAQBoardPage from "./FAQBoardPage";

function BoardPage() {
    const [currentBoard, setCurrentBoard] = useState("news"); // 기본: 소식 게시판

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            {/* 상단 타이틀 */}
            <Box textAlign="left" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>필루션 소식</Typography>
            </Box>

            {/* 탭 메뉴 */}
            <Box display="flex" justifyContent="center">
                <Button
                    disableRipple // 클릭 효과 제거
                    onClick={() => setCurrentBoard("news")}
                    sx={{
                        borderRadius: 0,
                        backgroundColor: currentBoard === "news" ? "#999999" : "#f5f5f5",
                        color: currentBoard === "news" ? "#fff" : "#000", // 글씨 색: 흰색
                        px: 6,
                        py: 1,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                    }}
                >
                    공지사항
                </Button>
                <Button
                    disableRipple // 클릭 효과 제거
                    onClick={() => setCurrentBoard("faq")}
                    sx={{
                        borderRadius: 0,
                        backgroundColor: currentBoard === "faq" ? "#999999" : "#f5f5f5",
                        color: currentBoard === "faq" ? "#fff" : "#000", // 글씨 색: 흰색
                        px: 6,
                        py: 1,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                    }}
                >
                    자주 묻는 질문
                </Button>
            </Box>

            {/* 선택된 게시판 표시 */}
            {currentBoard === "news" ? <NewsBoardPage /> : <FAQBoardPage />}
        </Container>
    );
}

export default BoardPage;
