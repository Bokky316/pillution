import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import {
    fetchPost,
    updatePost,
    setFormData,
    setOpenCancelDialog,
    setOpenEditDialog
} from '../../redux/postEditSlice';

const faqCategories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        formData,
        loading,
        error,
        openCancelDialog,
        openEditDialog
    } = useSelector((state) => state.postEdit);
    const auth = useSelector((state) => state.auth); // Redux에서 auth 가져오기

    // Redux 상태에서 userRole 가져오기
    const userRole = auth?.user?.authorities?.some(auth => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

    useEffect(() => {
        console.log("📌 fetchPost 호출!");
        dispatch(fetchPost(postId));
    }, [dispatch, postId]);

    // 로그인 시 Redux 상태를 `localStorage`와 동기화
    useEffect(() => {
        if (auth?.user) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    // 관리자 권한 체크
    useEffect(() => {
        if (userRole !== "ADMIN") {
            alert('관리자만 접근할 수 있습니다.');
            navigate('/board');
        }
    }, [userRole, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFormData({ [name]: value }));
    };

    const handleCancelClick = () => {
        dispatch(setOpenCancelDialog(true));
    };

    const handleCloseCancelDialog = () => {
        dispatch(setOpenCancelDialog(false));
    };

    const handleConfirmCancel = () => {
        dispatch(setOpenCancelDialog(false));
        navigate(-1);
    };

    const handleCloseEditDialog = () => {
        dispatch(setOpenEditDialog(false));
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

        dispatch(setOpenEditDialog(true));
    };

    const handleConfirmEdit = async () => {
        try {
            const boardId = formData.category === '공지사항' ? 1 : 2;
            const finalCategory = formData.category === '자주 묻는 질문'
                ? formData.subCategory
                : formData.category;

            const updateData = {
                id: postId,
                title: formData.title,
                content: formData.content,
                boardId: boardId,
                category: finalCategory,
                authorId: auth.user.id // 작성자 ID 추가
            };

            const token = auth.user.token; // 토큰 가져오기

            console.log("Updating post with data:", updateData); // 디버깅용 로그
            await dispatch(updatePost({ postId, updateData, token })).unwrap();
            alert('게시물이 수정되었습니다.');
            navigate('/board');
        } catch (err) {
            console.error("Error updating post:", err); // 상세한 오류 로깅
            if (err.status === 401 || err.status === 403) {
                alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
                navigate('/login');
            } else {
                alert(`수정에 실패했습니다. 오류: ${err.message || '알 수 없는 오류'}`);
            }
        }
        dispatch(setOpenEditDialog(false));
    };

    if (loading) return <Typography align="center" variant="h6">로딩 중...</Typography>;
    if (error) return <Typography align="center" color="error" variant="h6">{error}</Typography>;

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
                    <Button variant="contained" color="error" onClick={handleCancelClick}>
                        취소
                    </Button>
                </Box>
            </Box>

            <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
                <DialogTitle>취소 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmCancel} color="primary">
                        네
                    </Button>
                    <Button onClick={handleCloseCancelDialog} color="error">
                        아니요
                    </Button>
                </DialogActions>
            </Dialog>

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
