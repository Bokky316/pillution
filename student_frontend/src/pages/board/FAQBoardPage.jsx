import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Typography, Box,
    Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    fetchFAQPosts,
    deleteFAQPost,
    setSelectedCategory
} from "../../redux/faqSlice";

// FAQ 카테고리 목록
const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Redux 상태에서 필요한 값 가져오기
    const {
        filteredPosts,    // 선택된 카테고리에 따라 필터링된 게시글 목록
        selectedCategory,    // 현재 선택된 카테고리
        loading,    // 로딩 상태
        error    // 에러 메시지
    } = useSelector((state) => state.faq);
    const auth = useSelector((state) => state.auth);    // 인증 정보 가져오기

    // 로컬 상태 관리
    const [expandedPostId, setExpandedPostId] = useState(null);    // 확장된 게시글 ID
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);    // 삭제 다이얼로그 열림 상태
    const [postToDelete, setPostToDelete] = useState(null);    // 삭제할 게시글 ID
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });    // 스낵바 상태

    // 사용자 권한 확인 (관리자인지 여부)
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    // 컴포넌트 마운트 시 카테고리 초기화 및 게시글 fetch
    useEffect(() => {
        dispatch(setSelectedCategory("전체")); // 카테고리를 "전체"로 초기화
        dispatch(fetchFAQPosts());
    }, [dispatch, location.key]); // location.key를 의존성 배열에 추가

    // 인증 정보가 변경될 때 로컬 스토리지에 저장
    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    // 새 게시글 등록 시 스낵바 메시지 표시
    useEffect(() => {
        if (location.state?.newPost) {
            setSnackbar({ open: true, message: "새 게시글이 등록되었습니다." });
        }
    }, [location.state]);

    // 로딩 중일 때 표시할 UI
    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    // 에러 발생 시 표시할 UI
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

    // 게시글 클릭 시 확장/축소 처리
    const handlePostClick = (postId) => {
        setExpandedPostId(prevPostId => (prevPostId === postId ? null : postId));
    };

    // 게시글 수정 버튼 클릭 시 수정 페이지로 이동
    const handleEditPost = (postId) => {
        navigate(`/faq/post/${postId}/edit`);
    };

    // 삭제 버튼 클릭 시 삭제 다이얼로그 열기
    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
        setOpenDeleteDialog(true);
    };

    // 삭제 확인 처리 함수
    const handleConfirmDelete = async () => {
        if (postToDelete) {
            try {
                await dispatch(deleteFAQPost(postToDelete)).unwrap();
                // 삭제 요청 디스패치 및 결과 확인
                setSnackbar({ open: true, message: "게시글이 삭제되었습니다." });
            } catch (err) {
                setSnackbar({ open: true, message: "게시글 삭제에 실패했습니다." });
            }
        }
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    // 삭제 다이얼로그 닫기 처리 함수
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    // 스낵바 닫기 처리 함수
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ width: '100%', overflowX: 'hidden', padding: { xs: '0 8px', sm: '0 16px', md: '0 24px' } }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mt: 3 }}>자주 묻는 질문</Typography>

            {/* 카테고리 버튼 */}
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

            {/* 관리자 전용 게시글 등록 버튼 */}
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

            {/* 게시글 테이블 */}
            <TableContainer sx={{ marginBottom: '180px' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ borderTop: '2px solid #888' }}>
                            <TableCell align="center" style={{ width: '15%', fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="left" style={{ width: '65%', fontWeight: 'bold' }}>제목</TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell align="center" style={{ width: '20%', fontWeight: 'bold' }}>관리</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* 게시글 목록 렌더링 */}
                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                            [...filteredPosts].reverse().map(post => (
                                <React.Fragment key={post.id}>
                                    <TableRow>
                                        <TableCell align="center">{post.category}</TableCell>
                                        <TableCell
                                            onClick={() => handlePostClick(post.id)}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            {post.title}
                                        </TableCell>
                                        {userRole === 'ADMIN' && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Button variant="outlined" color="primary" onClick={() => handleEditPost(post.id)}>
                                                        수정
                                                    </Button>
                                                    <Button variant="outlined" color="error" onClick={() => handleDeletePost(post.id)}>
                                                        삭제
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {/* 게시글 내용 확장 */}
                                    {expandedPostId === post.id && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={userRole === 'ADMIN' ? 3 : 2}
                                                sx={{ backgroundColor: '#f5f5f5', padding: '20px 60px', paddingLeft: '80px' }}
                                            >
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", marginTop: 2, marginBottom: 2 }}>
                                                    {post.content}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            /* 게시글이 없을 경우 */
                            <TableRow>
                                <TableCell colSpan={userRole === 'ADMIN' ? 3 : 2} align="center">
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>삭제 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>정말로 이 게시글을 삭제하시겠습니까?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>삭제</Button>
                    <Button onClick={handleCloseDeleteDialog} color="primary">취소</Button>
                </DialogActions>
            </Dialog>

            {/* 스낵바 */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbar.message}
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