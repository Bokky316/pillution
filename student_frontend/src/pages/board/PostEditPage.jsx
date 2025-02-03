import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        subCategory: '전체'
    });
    const [isAdmin, setIsAdmin] = useState(false);

    const faqCategories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

    useEffect(() => {
        // 관리자 권한 체크
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                const userData = JSON.parse(loggedInUser);
                setIsAdmin(userData.authorities?.includes('ROLE_ADMIN') || false);
                if (!userData.authorities?.includes('ROLE_ADMIN')) {
                    alert('관리자만 접근할 수 있습니다.');
                    navigate('/board');
                    return;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
                navigate('/board');
            }
        } else {
            navigate('/login');
        }

        // 게시물 데이터 가져오기
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
                const post = response.data;
                const category = post.boardId === 1 ? '공지사항' : '자주 묻는 질문';
                setFormData({
                    title: post.title,
                    content: post.content,
                    category: category,
                    subCategory: post.category || '전체',
                    boardId: post.boardId
                });
            } catch (err) {
                console.error('Error fetching post:', err);
                alert('게시물을 불러오는데 실패했습니다.');
                navigate('/board');
            }
        };

        fetchPost();
    }, [postId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancelClick = () => {
        setOpenCancelDialog(true);
    };

    const handleCloseCancelDialog = () => {
        setOpenCancelDialog(false);
    };

    const handleConfirmCancel = () => {
        setOpenCancelDialog(false);
        navigate(-1);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (formData.category === '자주 묻는 질문' && !formData.subCategory) {
            alert('FAQ 카테고리를 선택해주세요.');
            return;
        }

        setOpenEditDialog(true);
    };

    const handleConfirmEdit = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('loggedInUser'));
            const token = userData.token;

            const currentPost = await axios.get(`http://localhost:8080/api/posts/${postId}`);
            const originalAuthorId = currentPost.data.authorId;

            const boardId = formData.category === '공지사항' ? 1 : 2;
            const finalCategory = formData.category === '자주 묻는 질문' ? formData.subCategory : formData.category;

            const updateData = {
                title: formData.title,
                content: formData.content,
                boardId: boardId,
                category: finalCategory,
                authorId: originalAuthorId
            };

            await axios.put(
                `http://localhost:8080/api/posts/${postId}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert('게시물이 수정되었습니다.');
            navigate('/board');
        } catch (err) {
            console.error('Error updating post:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
                navigate('/login');
            } else {
                alert('수정에 실패했습니다. 에러: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setOpenEditDialog(false);
        }
    };

    return (
        <Box maxWidth="md" mx="auto" p={3}>
            <Typography variant="h4" align="center" gutterBottom>
                게시글 수정
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <Box mb={3}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>게시판</InputLabel>
                        <Select
                            name="category"
                            value={formData.category}
                            disabled={true}
                            label="게시판"
                        >
                            <MenuItem value="공지사항">공지사항</MenuItem>
                            <MenuItem value="자주 묻는 질문">자주 묻는 질문</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {formData.category === "자주 묻는 질문" && (
                    <Box mb={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>카테고리 선택</InputLabel>
                            <Select
                                name="subCategory"
                                value={formData.subCategory}
                                onChange={handleChange}
                                label="카테고리 선택"
                            >
                                {faqCategories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                <Box mb={3}>
                    <TextField
                        fullWidth
                        label="제목"
                        name="title"
                        variant="outlined"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </Box>

                <Box mb={3}>
                    <TextField
                        fullWidth
                        label="내용"
                        name="content"
                        variant="outlined"
                        multiline
                        rows={6}
                        value={formData.content}
                        onChange={handleChange}
                        required
                    />
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="contained" color="primary" type="submit">
                        수정하기
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
                        취소
                    </Button>
                </Box>
            </Box>

            {/* 취소 확인 다이얼로그 */}
            <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
                <DialogTitle>취소 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmCancel} color="secondary">
                        네
                    </Button>
                    <Button onClick={handleCloseCancelDialog} color="primary">
                        아니요
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 수정 확인 다이얼로그 */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>수정 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        게시글을 수정하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmEdit} color="primary">
                        네
                    </Button>
                    <Button onClick={handleCloseEditDialog} color="secondary">
                        아니요
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PostEditPage;