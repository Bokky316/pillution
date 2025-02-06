import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Typography, Box,
    Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    fetchNewsPosts,
    setCurrentPage,
    deleteNewsPost
} from '../../redux/newsSlice';

function NewsBoardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 상태 관리
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    // Redux 상태 가져오기
    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages
    } = useSelector(state => state.news);

    const auth = useSelector((state) => state.auth);
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    // 게시글 데이터 가져오기
    useEffect(() => {
        dispatch(fetchNewsPosts({ page: currentPage }));
    }, [dispatch, currentPage]);

    // 사용자 인증 정보 로컬 스토리지에 저장
    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    // 페이지 이동 처리
    const handlePageClick = (page) => {
        dispatch(setCurrentPage(page));
    };

    // 게시글 수정 버튼 클릭 처리
    const handleEditPost = (postId) => {
        navigate(`/post/${postId}/edit`);
    };

    // 삭제 버튼 클릭 처리 (삭제 확인 다이얼로그 열기)
    const handleDeleteClick = (postId) => {
        setPostToDelete(postId);
        setDeleteDialogOpen(true);
    };

    // 삭제 확인 처리
    const handleDeleteConfirm = () => {
        if (postToDelete) {
            dispatch(deleteNewsPost(postToDelete))
                .unwrap() // Redux Toolkit의 unwrap()으로 비동기 작업 결과 처리
                .then(() => {
                    setSnackbarMessage("게시글이 성공적으로 삭제되었습니다.");
                    setSnackbarOpen(true);
                    dispatch(fetchNewsPosts({ page: currentPage })); // 삭제 후 목록 새로고침
                })
                .catch(() => {
                    setSnackbarMessage("게시글 삭제 중 오류가 발생했습니다.");
                    setSnackbarOpen(true);
                });
        }
        setDeleteDialogOpen(false);
        setPostToDelete(null); // 초기화
    };

    // 삭제 취소 처리
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPostToDelete(null); // 초기화
    };

    // 스낵바 닫기 처리
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    };

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography variant="h6">{error}</Typography>;

    return (
        <Box maxWidth="lg" mx="auto" p={3} mb={18}>
            <Typography variant="h4" align="center" gutterBottom>공지사항</Typography>

            {/* 관리자 전용 게시글 등록 버튼 */}
            {userRole === 'ADMIN' && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/post/create', { state: { defaultCategory: '공지사항' } })}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

            {/* 테이블 렌더링 */}
            <TableContainer>
                <Table sx={{ borderLeft: 'none', borderRight: 'none' }}>
                    <TableHead>
                        <TableRow sx={{ borderTop: '2px solid #888' }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>제목</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>작성일</TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>관리</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell align="center">
                                        <Typography
                                            sx={{
                                                display: "inline-block",
                                                backgroundColor: "primary.main",
                                                color: "white",
                                                borderRadius: "20px",
                                                padding: "2px 10px",
                                                fontSize: "0.75rem",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {post.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="left">
                                        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: '#666' }}>
                                        {formatDate(post.createdAt)}
                                    </TableCell>
                                    {userRole === 'ADMIN' && (
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleEditPost(post.id)}
                                                sx={{ marginRight: 1 }}
                                            >
                                                수정
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteClick(post.id)}
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={userRole === 'ADMIN' ? 4 : 3} align="center">
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <Box display="flex" justifyContent="center" gap={0.5} mt={3}>
                {[...Array(totalPages)].map((_, index) => (
                    <Button
                        key={index}
                        variant={currentPage === index ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        sx={{ minWidth: '30px', padding: '4px 8px' }}
                        onClick={() => handlePageClick(index)}
                    >
                        {index + 1}
                    </Button>
                ))}
            </Box>

            {/* 스낵바 */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>게시글 삭제</DialogTitle>
                <DialogContent>
                    <DialogContentText>정말로 이 게시글을 삭제하시겠습니까?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteConfirm} color="error">삭제</Button>
                    <Button onClick={handleDeleteCancel} color="primary">취소</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default NewsBoardPage;
