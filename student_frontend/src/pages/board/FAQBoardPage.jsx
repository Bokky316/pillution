import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Typography, Box,
    Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    fetchFAQPosts,
    deleteFAQPost,
    setSelectedCategory
} from "../../redux/faqSlice";

// FAQ 게시글의 카테고리 목록
const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // 화면 크기가 작을 경우 true

    const {
        filteredPosts, // 필터링된 게시글 목록
        selectedCategory, // 선택된 카테고리
        loading, // 로딩 상태
        error // 에러 메시지
    } = useSelector((state) => state.faq);
    const auth = useSelector((state) => state.auth); // 인증 정보

    const [expandedPostId, setExpandedPostId] = useState(null); // 확장된 게시글 ID
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // 삭제 확인 다이얼로그 열림/닫힘 상태
    const [postToDelete, setPostToDelete] = useState(null); // 삭제할 게시글 ID
    const [snackbar, setSnackbar] = useState({ open: false, message: '' }); // 스낵바 상태

    // 사용자의 역할이 ADMIN인지 확인
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        // 컴포넌트가 처음 마운트될 때 "전체" 카테고리를 선택하고 게시글을 불러옴
        dispatch(setSelectedCategory("전체"));
        dispatch(fetchFAQPosts());
    }, [dispatch, location.key]);

    useEffect(() => {
        // 인증 정보가 변경될 때 로컬 스토리지에 저장
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    useEffect(() => {
        // 새 게시글 등록 후 스낵바 메시지 표시
        if (location.state?.newPost) {
            setSnackbar({ open: true, message: "새 게시글이 등록되었습니다." });
        }
    }, [location.state]);

    // 로딩 중일 경우 "로딩 중..." 메시지 표시
    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    // 에러가 발생했을 경우 에러 메시지 표시
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

    // 게시글 클릭 시 게시글 내용 확장/축소
    const handlePostClick = (postId) => {
        setExpandedPostId(prevPostId => (prevPostId === postId ? null : postId));
    };

    // 게시글 수정 페이지로 이동
    const handleEditPost = (postId) => {
        navigate(`/faq/post/${postId}/edit`);
    };

    // 게시글 삭제 확인 다이얼로그 열기
    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
        setOpenDeleteDialog(true);
    };

    // 게시글 삭제 처리
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

    // 게시글 삭제 확인 다이얼로그 닫기
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    // 스낵바 닫기
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%' },
                margin: '0 auto',
                padding: { xs: '0 8px', sm: '0 16px', md: '0 24px' },
                mb: { xs: 20, sm: 18 },
                boxSizing: 'border-box'
            }}
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                    mt: 3,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
            >
                자주 묻는 질문
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: { xs: 1, sm: 1.5 },
                    mb: 3,
                    mx: { xs: -1, sm: 0 }
                }}
            >
                {categories.map(category => (
                    <Button
                        key={category}
                        onClick={() => dispatch(setSelectedCategory(category))}
                        variant="contained"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            margin: { xs: '2px', sm: '5px' },
                            backgroundColor: selectedCategory === category ? "lightblue" : undefined,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '4px 8px', sm: '6px 16px' },
                            minWidth: { xs: 'auto', sm: '80px' }
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Box>
            {userRole === 'ADMIN' && (
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    mb={2}
                    px={{ xs: 1, sm: 2 }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        onClick={() => navigate('/post/create', {
                            state: { defaultCategory: '자주 묻는 질문' }
                        })}
                        sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}
            <TableContainer
                sx={{
                    overflowX: 'auto',
                    width: '100%',
                    '& .MuiTable-root': {
                        width: '100%',
                        tableLayout: 'fixed'
                    }
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ borderTop: '2px solid #888' }}>
                            <TableCell
                                align="center"
                                sx={{
                                    width: { xs: '25%', sm: '20%' },
                                    maxWidth: { xs: '80px', sm: '100px' },
                                    fontWeight: 'bold',
                                    padding: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                분류
                            </TableCell>
                            <TableCell
                                align="left"
                                sx={{
                                    width: userRole === 'ADMIN' ? { xs: '75%', sm: '60%' } : '75%',
                                    fontWeight: 'bold',
                                    padding: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                            >
                                제목
                            </TableCell>
                            {!isMobile && userRole === 'ADMIN' && (
                                <TableCell
                                    align="center"
                                    sx={{
                                        width: { sm: '20%' },
                                        maxWidth: { sm: '160px' },
                                        fontWeight: 'bold',
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                    }}
                                >
                                    관리
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                            [...filteredPosts].reverse().map(post => (
                                <React.Fragment key={post.id}>
                                    <TableRow>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: { xs: 1, sm: 2 },
                                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                            }}
                                        >
                                            {post.category}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                padding: { xs: 1, sm: 2 },
                                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Typography
                                                    onClick={() => handlePostClick(post.id)}
                                                    sx={{
                                                        cursor: "pointer",
                                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: isMobile ? 'calc(100% - 60px)' : 'none'
                                                    }}
                                                >
                                                    {post.title}
                                                </Typography>
                                                {isMobile && userRole === 'ADMIN' && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 0.5,
                                                        flexShrink: 0
                                                    }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditPost(post.id);
                                                            }}
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                minWidth: 'auto',
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            수정
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePost(post.id);
                                                            }}
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                minWidth: 'auto',
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                        {!isMobile && userRole === 'ADMIN' && (
                                            <TableCell align="center">
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => handleEditPost(post.id)}
                                                        sx={{
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                            width: '100%',
                                                            maxWidth: '120px'
                                                        }}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        sx={{
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                            width: '100%',
                                                            maxWidth: '120px'
                                                        }}
                                                    >
                                                        삭제
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {expandedPostId === post.id && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                sx={{ padding: { xs: 2, sm: 3 } }}
                                            >
                                                <Typography variant="body2">
                                                    {post.content}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbar.message}
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
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"게시글 삭제"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        정말로 이 게시글을 삭제하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDelete} color="error">
                        삭제
                    </Button>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        취소
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

}

export default FAQBoardPage;
