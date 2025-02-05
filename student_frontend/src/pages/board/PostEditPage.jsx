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
    setIsAdmin,
    setOpenCancelDialog,
    setOpenEditDialog
} from '../../redux/postEditSlice';

// FAQ 카테고리 목록 상수
const faqCategories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux 상태 가져오기
    const {
        formData,
        isAdmin,
        loading,
        error,
        openCancelDialog,
        openEditDialog
    } = useSelector((state) => state.postEdit);

    // 초기 데이터 로드
    useEffect(() => {
        // 관리자 권한 체크
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                const userData = JSON.parse(loggedInUser);
                const isAdminUser = userData.authorities?.includes('ROLE_ADMIN') || false;
                dispatch(setIsAdmin(isAdminUser));

                if (!isAdminUser) {
                    alert('관리자만 접근할 수 있습니다.');
                    navigate('/board');
                    return;
                }
            } catch (e) {
                console.error('사용자 데이터 파싱 오류:', e);
                navigate('/board');
                return;
            }
        } else {
            navigate('/login');
            return;
        }

        // 게시글 데이터 가져오기
        dispatch(fetchPost(postId));
    }, [postId, navigate, dispatch]);

    // 입력 필드 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFormData({ [name]: value }));
    };

    // 취소 버튼 처리
    const handleCancelClick = () => {
        dispatch(setOpenCancelDialog(true));
    };

    // 취소 다이얼로그 닫기
    const handleCloseCancelDialog = () => {
        dispatch(setOpenCancelDialog(false));
    };

    // 취소 확인
    const handleConfirmCancel = () => {
        dispatch(setOpenCancelDialog(false));
        navigate(-1);
    };

    // 수정 다이얼로그 닫기
    const handleCloseEditDialog = () => {
        dispatch(setOpenEditDialog(false));
    };

    // 폼 제출 처리
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

    // 수정 확인
    const handleConfirmEdit = async () => {
        try {
            const boardId = formData.category === '공지사항' ? 1 : 2;
            const finalCategory = formData.category === '자주 묻는 질문'
                ? formData.subCategory
                : formData.category;

            const updateData = {
                title: formData.title,
                content: formData.content,
                boardId: boardId,
                category: finalCategory
            };

            // 게시글 수정 요청
            await dispatch(updatePost({ postId, updateData })).unwrap();
            alert('게시물이 수정되었습니다.');
            navigate('/board');
        } catch (err) {
            if (err.status === 401 || err.status === 403) {
                alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
                navigate('/login');
            } else {
                alert('수정에 실패했습니다.');
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
                {/* 게시판 선택 (비활성화) */}
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

                {/* FAQ 카테고리 선택 */}
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

                {/* 제목 입력 */}
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

                {/* 내용 입력 */}
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

                {/* 버튼 그룹 */}
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