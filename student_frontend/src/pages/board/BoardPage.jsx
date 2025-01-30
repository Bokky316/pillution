import React, { useState } from "react";
import { Container, Button } from "@mui/material";
import NewsBoardPage from "./NewsBoardPage";
import FAQBoardPage from "./FAQBoardPage";

function BoardPage() {
    const [currentBoard, setCurrentBoard] = useState("news"); // 기본: 소식 게시판

    return (
        <Container>
            <h2>필루션 소식</h2>
            {/* 소식 게시판 & 자주 묻는 질문 선택 버튼 */}
            <Button
                variant={currentBoard === "news" ? "contained" : "outlined"}
                onClick={() => setCurrentBoard("news")}
                style={{ marginRight: "10px" }}
            >
                소식 게시판
            </Button>
            <Button
                variant={currentBoard === "faq" ? "contained" : "outlined"}
                onClick={() => setCurrentBoard("faq")}
            >
                자주 묻는 질문
            </Button>

            {/* 선택된 게시판 표시 */}
            {currentBoard === "news" ? <NewsBoardPage /> : <FAQBoardPage />}
        </Container>
    );
}

export default BoardPage;