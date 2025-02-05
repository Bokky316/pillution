import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Typography, Button, Box, Paper, Divider,
    Table, TableBody, TableCell, TableRow
} from '@mui/material';
import {
    fetchPostDetail,
    deletePost,
    setIsAdmin
} from '../../redux/postDetailSlice';

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        post,
        prevPost,
        nextPost,
        loading,
        error,
        isAdmin
    } = useSelector(state => state.postDetail);

    useEffect(() => {
        // 관리자 권한 체크
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                const userData = JSON.parse(loggedInUser);
                dispatch(setIsAdmin(
                    userData.authorities?.includes('ROLE_ADMIN') || false
                ));
            } catch (e) {
                console.error('Error parsing user data:', e);
                dispatch(setIsAdmin(false));
            }
        } // ✅ 이 부분이 빠져있었어요!

        // 게시물 상세 정보 가져오기
        dispatch(fetchPostDetail(postId));
    }, [dispatch, postId]);

    const handleDeletePost = async () => {
        if (!isAdmin) {
            alert('관리자만 삭제할 수 있습니다.');
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('loggedInUser'));
            await dispatch(deletePost({
                postId,
                token: userData.token
            })).unwrap();

            alert('게시물이 삭제되었습니다.');
            navigate('/board');
        } catch (err) {
            console.error('Error deleting post:', err);
            if (err.status === 401 || err.status === 403) {
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

    if (loading) return <Typography>로딩 중...</Typography>;
    if (error) return <Typography color="error">오류 발생: {error.message}</Typography>;
    if (!post) return null;

    return (
        <Box maxWidth="md" mx="auto" p={3} mb={30}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="h2">{post.title}</Typography>
                    <Typography variant="caption" color="gray" sx={{ ml: 4 }}>
                        작성일: {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', minHeight: '300px', textAlign: 'left' }}>
                    {post.content}
                </Typography>

                <Box mt={4}>
                    <Table sx={{ borderCollapse: 'collapse' }}>
                        <TableBody>
                            <TableRow
                                hover
                                onClick={() => prevPost && navigate(`/post/${prevPost.id}`)}
                                style={{ cursor: prevPost ? 'pointer' : 'default' }}
                            >
                                <TableCell sx={{ pl: 2, fontWeight: 'bold', color: '#555', borderTop: '1px solid #ccc' }}>
                                    ▲ <span style={{ fontWeight: 'bold', color: '#555' }}>이전 글:</span> {prevPost ? prevPost.title : '없음'}
                                </TableCell>
                            </TableRow>
                            <TableRow
                                hover
                                onClick={() => nextPost && navigate(`/post/${nextPost.id}`)}
                                style={{ cursor: nextPost ? 'pointer' : 'default' }}
                            >
                                <TableCell sx={{ pl: 2, fontWeight: 'bold', color: '#555', borderTop: '1px solid #ccc' }}>
                                    ▼ <span style={{ fontWeight: 'bold', color: '#555' }}>다음 글:</span> {nextPost ? nextPost.title : '없음'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>

                <Box mt={5} display="flex" justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => navigate('/board')}
                        sx={{ mt: 2, px: 4, py: 2 }}
                    >
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
        </Box>
    );
}

export default PostDetailPage;