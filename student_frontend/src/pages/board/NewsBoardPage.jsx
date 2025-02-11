import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Typography, Box,
    Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    IconButton, useTheme, useMediaQuery
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                .unwrap()
                .then(() => {
                    setSnackbarMessage("게시글이 성공적으로 삭제되었습니다.");
                    setSnackbarOpen(true);
                    dispatch(fetchNewsPosts({ page: currentPage }));
                })
                .catch(() => {
                    setSnackbarMessage("게시글 삭제 중 오류가 발생했습니다.");
                    setSnackbarOpen(true);
                });
        }
        setDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPostToDelete(null);
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
        <Box
            maxWidth="lg"
            mx="auto"
            p={{ xs: 2, sm: 3, md: 4 }}
            mb={18}
            sx={{ overflowX: 'hidden' }}
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
                공지사항
            </Typography>
            {userRole === 'ADMIN' && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/post/create', { state: { defaultCategory: '공지사항' } })}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}
            <TableContainer sx={{ width: '100%', overflowX: 'hidden' }}>
                <Table sx={{
                    borderLeft: 'none',
                    borderRight: 'none',
                    width: '100%',
                    tableLayout: 'fixed',
                    minWidth: '100%',
                }}>
                    <TableHead>
                        <TableRow sx={{ borderTop: '2px solid #888' }}>
                            <TableCell
                                align="center"
                                sx={{
                                    width: '15%',
                                    fontWeight: 'bold',
                                    padding: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                분류
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    fontWeight: 'bold',
                                    padding: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '60%'
                                }}
                            >
                                제목
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    fontWeight: 'bold',
                                    padding: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    display: { xs: 'none', sm: 'table-cell' },
                                    width: '15%'
                                }}
                            >
                                작성일
                            </TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        padding: { xs: 1, sm: 2 },
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                        width: '10%'
                                    }}
                                >
                                    관리
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: '15%',
                                            padding: { xs: '8px 4px', sm: 2 }
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                display: "inline-block",
                                                backgroundColor: "primary.main",
                                                color: "white",
                                                borderRadius: "20px",
                                                padding: { xs: '2px 6px', sm: '2px 10px' },
                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                fontWeight: "bold",
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {post.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            padding: { xs: 1, sm: 2 },
                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            color: '#666',
                                            padding: { xs: 1, sm: 2 },
                                            display: { xs: 'none', sm: 'table-cell' },
                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                        }}
                                    >
                                        {formatDate(post.createdAt)}
                                    </TableCell>
                                    {userRole === 'ADMIN' && (
                                        <TableCell align="center" sx={{ padding: { xs: 1, sm: 2 } }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                alignItems: 'center'
                                            }}>
                                                <Button variant="outlined" color="primary" onClick={() => handleEditPost(post.id)}>
                                                    수정
                                                </Button>
                                                <Button variant="outlined" color="error" onClick={() => handleDeleteClick(post.id)}>
                                                    삭제
                                                </Button>
                                            </Box>
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
        </Box>
    );


}

export default NewsBoardPage;
