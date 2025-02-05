import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Typography, Box
} from '@mui/material';
import {
    fetchNewsPosts,
    setCurrentPage,
    deleteNewsPost
} from '../../redux/newsSlice';

function NewsBoardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages
    } = useSelector(state => state.news);

    const auth = useSelector((state) => state.auth); // Redux에서 auth 가져오기

    // Redux 상태에서 userRole 가져오기
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        dispatch(fetchNewsPosts({ page: currentPage }));
    }, [dispatch, currentPage]);

    // 로그인 시 Redux 상태를 `localStorage`와 동기화
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

    const handleDeletePost = (postId) => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            dispatch(deleteNewsPost(postId));
        }
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
                        onClick={() => navigate('/post/create', {
                            state: { defaultCategory: '공지사항' }
                        })}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>제목</TableCell>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>작성일</TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>관리</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <TableRow key={post.id} hover>
                                    <TableCell>{post.category}</TableCell>
                                    <TableCell>
                                        <Link
                                            to={`/post/${post.id}`}
                                            style={{ textDecoration: 'none', color: 'black' }}
                                        >
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(post.createdAt).toLocaleDateString()}
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
                                                onClick={() => handleDeletePost(post.id)}
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
        </Box>
    );
}

export default NewsBoardPage;
