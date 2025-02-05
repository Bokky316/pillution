import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    fetchFAQPosts,
    deleteFAQPost,
    setSelectedCategory,
    togglePost
} from "../../redux/faqSlice";

const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        filteredPosts,
        selectedCategory,
        expandedPosts,
        loading,
        error
    } = useSelector((state) => state.faq);
    const auth = useSelector((state) => state.auth);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState(null);
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '' });

    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        dispatch(fetchFAQPosts());
    }, [dispatch]);

    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    useEffect(() => {
        if (location.state?.newPost) {
            setSnackbar({ open: true, message: "새 게시글이 등록되었습니다." });
        }
    }, [location.state]);

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

    const handlePostClick = (postId) => {
        dispatch(togglePost(postId));
    };

    const handleEditPost = (postId) => {
        navigate(`/faq/post/${postId}/edit`);
    };

    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (postToDelete) {
            try {
                await dispatch(deleteFAQPost(postToDelete)).unwrap();
                setSnackbar({ open: true, message: "게시글이 삭제되었습니다." });
            } catch (err) {
                setSnackbar({ open: true, message: "게시글 삭제에 실패했습니다." });
            }
        }
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                width: '100%',
                overflowX: 'hidden',
                padding: {
                    xs: '0 8px',
                    sm: '0 16px',
                    md: '0 24px'
                }
            }}
        >
            <Typography variant="h4" align="center" gutterBottom>자주 묻는 질문</Typography>

            <Box display="flex" justifyContent="center" mb={3} flexWrap="wrap">
                {categories.map(category => (
                    <Button
                        key={category}
                        onClick={() => dispatch(setSelectedCategory(category))}
                        variant="contained"
                        sx={{
                            margin: "5px",
                            backgroundColor: selectedCategory === category ? "lightblue" : undefined,
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Box>

            {userRole === 'ADMIN' && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/post/create', {
                            state: { defaultCategory: '자주 묻는 질문' }
                        })}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

            <TableContainer
                component={Paper}
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    marginBottom: '120px',
                    '& table': {
                        width: '100%',
                        minWidth: '600px'
                    }
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" style={{ width: '15%', fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="left" style={{ width: '65%', fontWeight: 'bold' }}>제목</TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell align="center" style={{ width: '20%', fontWeight: 'bold' }}>관리</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                            [...filteredPosts].reverse().map(post => (
                                <React.Fragment key={post.id}>
                                    <TableRow>
                                        <TableCell align="center" onClick={() => handlePostClick(post.id)}>
                                            {post.category}
                                        </TableCell>
                                        <TableCell onClick={() => handlePostClick(post.id)}>
                                            {post.title}
                                        </TableCell>
                                        {userRole === 'ADMIN' && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => handleEditPost(post.id)}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDeletePost(post.id)}
                                                    >
                                                        삭제
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {expandedPosts[post.id] && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={userRole === 'ADMIN' ? 3 : 2}
                                                sx={{ backgroundColor: '#f5f5f5', padding: '20px 60px' }}
                                            >
                                                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {post.content}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={userRole === 'ADMIN' ? 3 : 2} align="center">
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">삭제 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        정말로 이 게시글을 삭제하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                message={snackbar.message}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
}

export default FAQBoardPage;
