import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';

function NewsBoardPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        setUserRole(userData.authorities?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER');

        const fetchPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/posts/board/1?page=${currentPage}&size=10`);
                console.log('API Response:', response.data);
                setPosts(response.data.dtoList);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (err) {
                setError('게시글을 불러오는데 실패했습니다: ' + err.message);
                setLoading(false);
            }
        };

        fetchPosts();
    }, [currentPage]);

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const handleEditPost = (postId) => {
        navigate(`/post/${postId}/edit`);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(`http://localhost:8080/api/posts/${postId}`);

                if (response.status === 204) {
                    alert("게시글이 삭제되었습니다.");
                    const updatedResponse = await axios.get(`http://localhost:8080/api/posts/board/1?page=${currentPage}&size=10`);
                    setPosts(updatedResponse.data.dtoList);
                    setTotalPages(updatedResponse.data.totalPages);
                }
            } catch (err) {
                console.error('Error deleting post:', err);
                const errorMessage = err.response?.data?.message || "게시글 삭제에 실패했습니다.";
                alert(errorMessage);
            }
        }
    };

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" align="center" gutterBottom>공지사항</Typography>

            {userRole === 'ADMIN' && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="secondary"
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
                                        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
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
                                <TableCell colSpan={userRole === 'ADMIN' ? 4 : 3} align="center">게시글이 없습니다.</TableCell>
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