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
            dispatch(setCurrentBoard("news"));
            localStorage.setItem("currentBoard", "news");
            sessionStorage.setItem('boardPageVisited', 'true');
            sessionStorage.removeItem('headerBoardClick');
        } else {
            const savedBoard = localStorage.getItem("currentBoard") || "news";
            dispatch(setCurrentBoard(savedBoard));
        }

        return () => {
            sessionStorage.removeItem('boardPageVisited');
        };
    }, [location.key, dispatch]);

    const handleBoardChange = (board) => {
        dispatch(setCurrentBoard(board));
        localStorage.setItem("currentBoard", board);
    };

    return (
        <Container
            maxWidth="lg"
                sx={{
                    overflowX: 'hidden',  // 가로 스크롤 방지
                    px: { xs: 2, sm: 3 },  // 반응형 패딩
                    maxWidth: '100vw',   // 뷰포트 너비 제한
                    boxSizing: 'border-box' // 박스 크기 계산
                }}
       >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="left"
                sx={{
                    my: 4,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } // 반응형 폰트 크기
                }}
            >
                필루션 소식
            </Typography>

            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                flexDirection: { xs: 'column', sm: 'row' }, // 모바일에서는 세로로 배치
                width: '100%',
                overflowX: 'hidden' // 가로 스크롤 방지
            }}>
                <Button
                    onClick={() => handleBoardChange("news")}
                    sx={{
                        borderRadius: 0,
                        backgroundColor: currentBoard === "news" ? "#999999" : "#f5f5f5",
                        color: currentBoard === "news" ? "#fff" : "#000",
                        px: { xs: 2, sm: 6 }, // 반응형 패딩
                        py: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem' }, // 반응형 폰트 크기
                        fontWeight: "bold",
                        width: { xs: '100%', sm: 'auto' }, // 모바일에서는 전체 너비
                        mb: { xs: 1, sm: 0 } // 모바일에서 버튼 사이 간격
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
                        px: { xs: 2, sm: 6 }, // 반응형 패딩
                        py: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem' }, // 반응형 폰트 크기
                        fontWeight: "bold",
                        width: { xs: '100%', sm: 'auto' } // 모바일에서는 전체 너비
                    }}
                >
                    자주 묻는 질문
                </Button>
            </Box>

            {/* 현재 선택된 게시판에 따라 렌더링 */}
            <Box sx={{ overflowX: 'hidden', width: '100%' }}> {/* 추가적인 가로 스크롤 방지 */}
                {currentBoard === "news" ? <NewsBoardPage /> : <FAQBoardPage />}
            </Box>
        </Container>
    );
}

export default BoardPage;
