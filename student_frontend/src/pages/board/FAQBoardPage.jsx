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
    Paper
} from '@mui/material';

const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const [posts, setPosts] = useState([]);  // 전체 게시글 목록
    const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시글 목록
    const [selectedCategory, setSelectedCategory] = useState("전체"); // 선택된 카테고리
    const [expandedPosts, setExpandedPosts] = useState({}); // 확장된 게시글 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        setUserRole(userData.authorities?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER');

        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/posts/faq");

                console.log("API 응답 데이터:", response.data);

                setPosts(response.data);
                setFilteredPosts(response.data); // 처음엔 전체 게시물 보여줌
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
        console.log(`현재 선택된 카테고리: ${category}`);
        setSelectedCategory(category);
        if (category === "전체") {
            setFilteredPosts(posts); // 전체 게시물 표시
        } else {
            const filtered = posts.filter(post => post.category === category);
            console.log(`필터링된 ${category} 게시글:`, filtered);
            setFilteredPosts(filtered); // 선택된 카테고리에 해당하는 게시물만 표시
        }
    };

    const handlePostClick = (postId) => {
        setExpandedPosts(prevState => ({
            ...prevState,
            [postId]: !prevState[postId]
        }));
    };

    const handleEditPost = (postId) => {
        navigate(`/faq/post/${postId}/edit`); // 수정 페이지로 이동
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try {
                // URL을 /api/posts/{id}로 변경
                const response = await axios.delete(`http://localhost:8080/api/posts/${postId}`);

                if (response.status === 204) { // 204 No Content 상태코드 체크
                    alert("게시글이 삭제되었습니다.");
                    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                    setFilteredPosts(prevFilteredPosts =>
                        prevFilteredPosts.filter(post => post.id !== postId)
                    );
                }
            } catch (err) {
                console.error('Error deleting post:', err);
                const errorMessage = err.response?.data?.message || "게시글 삭제에 실패했습니다.";
                alert(errorMessage);
            }
        }
    };

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" align="center" gutterBottom>자주 묻는 질문</Typography>

            {/* 카테고리 버튼 */}
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
                        onClick={() => navigate('/post/create')}
                    >
                        게시글 등록
                    </Button>
                </Box>
            )}

            {/* 게시글 목록 */}
            <TableContainer component={Paper} elevation={3} sx={{ marginBottom: '120px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>제목</TableCell>
                            {userRole === 'ADMIN' && (
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>관리</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <TableRow key={post.id} hover>
                                    <TableCell>{post.category}</TableCell>
                                    <TableCell>
                                        <Button variant="text" onClick={() => handlePostClick(post.id)}>
                                            {post.title}
                                        </Button>
                                        {expandedPosts[post.id] && (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    marginTop: "10px",
                                                    marginLeft: "20px",
                                                    paddingTop: "10px",
                                                    whiteSpace: "pre-wrap"
                                                }}
                                            >
                                                {post.content}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {userRole === 'ADMIN' && (
                                        <TableCell align="center">
                                            {/* 수정 버튼 */}
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleEditPost(post.id)}
                                                sx={{ marginRight: 1 }}
                                            >
                                                수정
                                            </Button>

                                            {/* 삭제 버튼 */}
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
                                <TableCell colSpan={userRole === 'ADMIN' ? 3 : 2} align="center">
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

export default FAQBoardPage;
