import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@mui/material';

const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [expandedPosts, setExpandedPosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        setUserRole(userData.authorities?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER');

        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/posts/faq");
                console.log("API 응답 데이터:", response.data);
                setPosts(response.data);
                setFilteredPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching FAQ posts:', err);
                setError('게시글을 불러오는데 실패했습니다: ' + err.message);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

    const filterPostsByCategory = (category) => {
        setSelectedCategory(category);
        if (category === "전체") {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post => post.category === category);
            setFilteredPosts(filtered);
        }
    };

    const handlePostClick = (postId) => {
        setExpandedPosts(prevState => ({
            ...prevState,
            [postId]: !prevState[postId]
        }));
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
                const response = await axios.delete(`http://localhost:8080/api/posts/${postToDelete}`);
                if (response.status === 204) {
                    alert("게시글이 삭제되었습니다.");
                    setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
                    setFilteredPosts(prevFilteredPosts =>
                        prevFilteredPosts.filter(post => post.id !== postToDelete)
                    );
                }
            } catch (err) {
                console.error('Error deleting post:', err);
                const errorMessage = err.response?.data?.message || "게시글 삭제에 실패했습니다.";
                alert(errorMessage);
            }
        }
        setOpenDeleteDialog(false);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setPostToDelete(null);
    };

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" align="center" gutterBottom>자주 묻는 질문</Typography>

            <Box display="flex" justifyContent="center" mb={3}>
                {categories.map(category => (
                    <Button
                        key={category}
                        onClick={() => filterPostsByCategory(category)}
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
                        color="secondary"
                        onClick={() => navigate('/post/create', {
                            state: { defaultCategory: '자주 묻는 질문' }
                        })}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper} elevation={3} sx={{ marginBottom: '120px' }}>
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
                            filteredPosts.map(post => (
                                <React.Fragment key={post.id}>
                                    <TableRow hover>
                                        <TableCell align="center" style={{ width: '15%' }}>{post.category}</TableCell>
                                        <TableCell style={{ width: '65%' }}>
                                            <Button
                                                variant="text"
                                                onClick={() => handlePostClick(post.id)}
                                                sx={{ textAlign: 'left', display: 'block', width: '100%' }}
                                            >
                                                {post.title}
                                            </Button>
                                        </TableCell>
                                        {userRole === 'ADMIN' && (
                                            <TableCell align="center" style={{ width: '20%' }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    gap: 1,
                                                    minWidth: '160px'
                                                }}>
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
                                            <TableCell colSpan={userRole === 'ADMIN' ? 3 : 2} sx={{
                                                backgroundColor: '#f5f5f5',
                                                padding: '20px 40px'
                                            }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        whiteSpace: "pre-wrap"
                                                    }}
                                                >
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
                <DialogTitle id="alert-dialog-title">{"삭제 확인"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        정말로 이 게시글을 삭제하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FAQBoardPage;
