import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Paper, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material';

function PostDetailPage() {
  const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [prevPostId, setPrevPostId] = useState(null);
    const [prevPostTitle, setPrevPostTitle] = useState('');
    const [nextPostId, setNextPostId] = useState(null);
    const [nextPostTitle, setNextPostTitle] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      // 관리자 권한 체크
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        try {
          const userData = JSON.parse(loggedInUser);
          setIsAdmin(userData.authorities?.includes('ROLE_ADMIN') || false);
        } catch (e) {
          console.error('Error parsing user data:', e);
          setIsAdmin(false);
        }
      }

      const fetchPost = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
          const postResponse = response.data;

          const postsResponse = await axios.get(`http://localhost:8080/api/posts/board/1?page=0&size=100`);
          const posts = postsResponse.data.dtoList;
          const currentIndex = posts.findIndex(post => post.id === parseInt(postId));

          if (currentIndex > 0) {
            setPrevPostId(posts[currentIndex - 1].id);
            setPrevPostTitle(posts[currentIndex - 1].title);
          } else {
            setPrevPostId(null);
            setPrevPostTitle('없음');
          }

          if (currentIndex < posts.length - 1) {
            setNextPostId(posts[currentIndex + 1].id);
            setNextPostTitle(posts[currentIndex + 1].title);
          } else {
            setNextPostId(null);
            setNextPostTitle('없음');
          }

          setPost(postResponse);
        } catch (err) {
          console.error('Error fetching post:', err);
        }
      };

      fetchPost();
    }, [postId]);

    const handleDeletePost = async () => {
      if (!isAdmin) {
        alert('관리자만 삭제할 수 있습니다.');
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem('loggedInUser'));
        const token = userData.token;

        await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('게시물이 삭제되었습니다.');
        navigate('/board');
      } catch (err) {
        console.error('Error deleting post:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
          navigate('/login');
        } else {
          alert('삭제에 실패했습니다.');
        }
      }
    };

    const handleEditPost = () => {
      if (!isAdmin) {
        alert('관리자만 수정할 수 있습니다.');
        return;
      }
      navigate(`/post/${postId}/edit`);
    };


    return (
        <Box maxWidth="md" mx="auto" p={3} mb={30}>
          {post && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">{post.title}</Typography>
                <Typography variant="caption" color="gray" sx={{ ml: 4 }}>
                  작성일: {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', minHeight: '300px', textAlign: 'left' }}>{post.content}</Typography>

              <Box mt={4}>
                <Table sx={{ borderCollapse: 'collapse' }}>
                  <TableBody>
                    <TableRow hover onClick={() => prevPostId && navigate(`/post/${prevPostId}`)} style={{ cursor: prevPostId ? 'pointer' : 'default' }}>
                      <TableCell sx={{ pl: 2, fontWeight: 'bold', color: '#555', borderTop: '1px solid #ccc' }}>
                        ◀ <span style={{ fontWeight: 'bold', color: '#555' }}>이전 글:</span> {prevPostTitle}
                      </TableCell>
                    </TableRow>
                    <TableRow hover onClick={() => nextPostId && navigate(`/post/${nextPostId}`)} style={{ cursor: nextPostId ? 'pointer' : 'default' }}>
                      <TableCell sx={{ pl: 2, fontWeight: 'bold', color: '#555', borderTop: '1px solid #ccc' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>다음 글:</span> {nextPostTitle} ▶
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Box mt={5} display="flex" justifyContent="center">
                <Button variant="contained" color="primary" size="medium" onClick={() => navigate('/board')} sx={{ mt: 2, px: 4, py: 2 }}>
                  목록으로 가기
                </Button>
              </Box>

              {isAdmin && (
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="contained" color="info" onClick={handleEditPost}>수정</Button>
                  <Button variant="contained" color="error" onClick={handleDeletePost}>삭제</Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
    );
}

export default PostDetailPage;