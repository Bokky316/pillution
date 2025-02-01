import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const categories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function FAQBoardPage() {
    const [posts, setPosts] = useState([]);  // 전체 게시글 목록
    const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시글 목록
    const [selectedCategory, setSelectedCategory] = useState("전체"); // 선택된 카테고리
    const [expandedPosts, setExpandedPosts] = useState({}); // 확장된 게시글 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

            {/* 게시글 목록 */}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>분류</TableCell>
                            <TableCell align="left" style={{ fontWeight: 'bold' }}>제목</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <TableRow key={post.id} hover>
                                    <TableCell>{post.category}</TableCell> {/* 카테고리 표시 */}
                                    <TableCell>
                                        <Button
                                            variant="text"
                                            onClick={() => handlePostClick(post.id)}
                                        >
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
                                                - {post.content}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} align="center">게시글이 없습니다.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default FAQBoardPage;
