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
} from '@/store/postDetailSlice';


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

    const auth = useSelector((state) => state.auth); // Redux에서 auth 가져오기

    // Redux 상태에서 userRole 가져오기
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        console.log("📌 fetchPostDetail 호출!");
        dispatch(fetchPostDetail(postId));
    }, [dispatch, postId]);

    // 로그인 시 Redux 상태를 `localStorage`와 동기화
    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    useEffect(() => {
        dispatch(setIsAdmin(userRole === "ADMIN"));
    }, [dispatch, userRole]);

    const handleDeletePost = async () => {
        if (userRole !== "ADMIN") {
            alert('관리자만 삭제할 수 있습니다.');
            return;
        }

        try {
            await dispatch(deletePost({
                postId,
                token: auth.user.token
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
        if (userRole !== "ADMIN") {
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
                                onClick={() => prevPost && navigate(`/post/${prevPost.id}`)}
                                style={{ cursor: prevPost ? 'pointer' : 'default' }}
                            >
                                <TableCell sx={{ pl: 2, fontWeight: 'bold', color: '#555', borderTop: '1px solid #ccc' }}>
                                    ▲ <span style={{ fontWeight: 'bold', color: '#555' }}>이전 글:</span> {prevPost ? prevPost.title : '없음'}
                                </TableCell>
                            </TableRow>
                            <TableRow
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
                        sx={{ mt: 2, px: 4, py: 1 }} // py 값을 1로 줄여서 위아래 크기를 줄임
                    >
                        목록으로 가기
                    </Button>
                </Box>

                {userRole === "ADMIN" && (
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
