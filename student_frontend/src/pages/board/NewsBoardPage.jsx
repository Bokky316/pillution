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

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages
    } = useSelector(state => state.news);

    const auth = useSelector((state) => state.auth);

    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        dispatch(fetchNewsPosts({ page: currentPage }));
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    const handlePageClick = (page) => {
        dispatch(setCurrentPage(page));
    };

    const handleEditPost = (postId) => {
        navigate(`/post/${postId}/edit`);
    };

    const handleDeleteClick = (postId) => {
        setPostToDelete(postId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (postToDelete) {
            dispatch(deleteNewsPost(postToDelete))
                .then(() => {
                    setSnackbarMessage("게시글이 성공적으로 삭제되었습니다.");
                    setSnackbarOpen(true);
                })
                .catch(() => {
                    setSnackbarMessage("게시글 삭제 중 오류가 발생했습니다.");
                    setSnackbarOpen(true);
                });
        }
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    };

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography variant="h6">{error}</Typography>;

    return (
        <Box maxWidth="lg" mx="auto" p={3} mb={18}>
            <Typography variant="h4" align="center" gutterBottom>공지사항</Typography>

            {userRole === 'ADMIN' && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            navigate('/post/create', {
                                state: { defaultCategory: '공지사항' }
                            });
                            setSnackbarMessage("새 게시글 작성 페이지로 이동합니다.");
                            setSnackbarOpen(true);
                        }}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

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
                                        <Link
                                            to={`/post/${post.id}`}
                                            style={{ textDecoration: 'none', color: 'black' }}
                                        >
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
                                <TableCell
                                    colSpan={userRole === 'ADMIN' ? 4 : 3}
                                    align="center"
                                >
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleCloseSnackbar}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
}

export default NewsBoardPage;
