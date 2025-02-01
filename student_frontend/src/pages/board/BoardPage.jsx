import React, { useState } from "react";
import { Container, Button, Typography, Box } from "@mui/material";
import NewsBoardPage from "./NewsBoardPage";
import FAQBoardPage from "./FAQBoardPage";
import PostDetailPage from "./PostDetailPage";

function BoardPage() {
    const [currentBoard, setCurrentBoard] = useState("news"); // 기본: 소식 게시판

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>필루션 소식</Typography>

            {/* 소식 게시판 & 자주 묻는 질문 선택 버튼 */}
            <Box display="flex" justifyContent="center" mb={3}>
                <Button
                    variant={currentBoard === "news" ? "contained" : "outlined"}
                    onClick={() => setCurrentBoard("news")}
                    sx={{ marginRight: "10px" }}
                >
                    공지사항
                </Button>
                <Button
                    variant={currentBoard === "faq" ? "contained" : "outlined"}
                    onClick={() => setCurrentBoard("faq")}
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
