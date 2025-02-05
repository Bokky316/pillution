import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import NewsBoardPage from "./NewsBoardPage";
import FAQBoardPage from "./FAQBoardPage";
import { setCurrentBoard } from '../../redux/boardSlice';

function BoardPage() {
    const dispatch = useDispatch();
    const currentBoard = useSelector(state => state.board.currentBoard);
    const location = useLocation();

    // 새로고침 시 localStorage에서 현재 게시판 상태를 불러오기
    useEffect(() => {
        const savedBoard = localStorage.getItem("currentBoard") || "news";
        dispatch(setCurrentBoard(savedBoard));
    }, [location, dispatch]);

    // 게시판 변경 시 localStorage에 저장
    const handleBoardChange = (board) => {
        dispatch(setCurrentBoard(board));
        localStorage.setItem("currentBoard", board);
    };

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            {/* 상단 타이틀 */}
            <Box textAlign="left" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>필루션 소식</Typography>
            </Box>

            {/* 탭 메뉴 */}
            <Box display="flex" justifyContent="center">
                <Button
                    disableRipple
                    onClick={() => handleBoardChange("news")}
                    sx={{
                        borderRadius: 0,
                        backgroundColor: currentBoard === "news" ? "#999999" : "#f5f5f5",
                        color: currentBoard === "news" ? "#fff" : "#000",
                        px: 6,
                        py: 1,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                    }}
                >
                    공지사항
                </Button>
                <Button
                    disableRipple
                    onClick={() => handleBoardChange("faq")}
                    sx={{
                        borderRadius: 0,
                        backgroundColor: currentBoard === "faq" ? "#999999" : "#f5f5f5",
                        color: currentBoard === "faq" ? "#fff" : "#000",
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
