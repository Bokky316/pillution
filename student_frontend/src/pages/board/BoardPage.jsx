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

    useEffect(() => {
        const isNewVisit = !sessionStorage.getItem('boardPageVisited');
        const isHeaderClick = sessionStorage.getItem('headerBoardClick') === 'true';

        if (isNewVisit || isHeaderClick) {
            // 새로운 방문 또는 헤더를 통한 재접근
            dispatch(setCurrentBoard("news"));
            localStorage.setItem("currentBoard", "news");
            sessionStorage.setItem('boardPageVisited', 'true');
            sessionStorage.removeItem('headerBoardClick');
        } else {
            // 새로고침
            const savedBoard = localStorage.getItem("currentBoard") || "news";
            dispatch(setCurrentBoard(savedBoard));
        }

        // 컴포넌트가 언마운트될 때 세션 스토리지 클리어
        return () => {
            sessionStorage.removeItem('boardPageVisited');
        };
    }, [location.key, dispatch]);

    const handleBoardChange = (board) => {
        dispatch(setCurrentBoard(board));
        localStorage.setItem("currentBoard", board);
    };

    return (
        <Container maxWidth="lg">
            {/* 상단 타이틀 */}
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
                필루션 소식
            </Typography>

            {/* 탭 메뉴 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button
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
