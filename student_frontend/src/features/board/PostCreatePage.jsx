import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box, Button, TextField, Typography, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, Select,
    MenuItem, InputLabel, FormControl, Snackbar, IconButton,
    FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    createPost, setFormData, setIsAdmin, setAuthorId,
    setOpenCancelDialog, setOpenSubmitDialog, resetForm,
} from '@/store/postCreateSlice';


// FAQ 카테고리 목록 - 전체는 선택하는 카테고리가 아니라 여기에서는 뺌.
const faqCategories = ["제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

// 관리자 권한 확인 헬퍼 함수 - 다른 페이지 방식 적용
const checkIsAdmin = (user) => {
    // 전체 사용자 객체 로깅
    console.log("Complete user object:", user);

    // user가 없는 경우
    if (!user) {
        console.log("User object is missing");
        return false;
    }

    // user.role이 있는 경우 직접 확인
    if (user.role === 'ADMIN') {
        console.log("User has ADMIN role directly");
        return true;
    }

    // 기존 authorities 배열 확인 (좀 더 유연하게)
    if (user.authorities) {
        console.log("User authorities:", user.authorities);

        // 다양한 형태의 authorities 처리
        const isAdmin = user.authorities.some(authority => {
            if (typeof authority === 'string') {
                return authority === 'ROLE_ADMIN' || authority === 'ADMIN';
            } else if (authority && typeof authority === 'object') {
                const authorityValue = authority.authority || authority.role || '';
                return authorityValue === 'ROLE_ADMIN' || authorityValue === 'ADMIN';
            }
            return false;
        });

        console.log("Is admin based on authorities:", isAdmin);
        return isAdmin;
    }

    console.log("No valid authority information found");
    return false;
};

function PostCreatePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn, isLoading } = useSelector(state => state.auth);

    // Redux 상태 가져오기
    const {
        formData,
        isAdmin,
        openCancelDialog,
        openSubmitDialog,
        loading,
        error
    } = useSelector((state) => state.postCreate);

    // Snackbar 상태 추가
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    // 유효성 검사 오류 상태 추가
    const [validationErrors, setValidationErrors] = useState({
        category: false,
        subCategory: false,
    });

    // 컴포넌트 마운트 시 폼 초기화
    useEffect(() => {
        dispatch(resetForm());

        // 초기 카테고리 설정
        const defaultCategory = location.state?.defaultCategory || '공지사항';
        dispatch(setFormData({
            category: defaultCategory,
            boardId: defaultCategory === '공지사항' ? 1 : 2,
        }));


        // 컴포넌트 언마운트 시 폼 초기화
        return () => {
            dispatch(resetForm());
        };
    }, [location.state, dispatch]);


    // 사용자 권한 확인
    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn || !user) {
                console.log("인증 상태 확인 - 로그인:", isLoggedIn, "유저:", user);
                navigate("/login");
                return;
            }

            // 유연한 방식으로 권한 확인
            const isAdminUser = checkIsAdmin(user);
            console.log("권한 확인 결과 - 관리자:", isAdminUser);

            dispatch(setIsAdmin(isAdminUser));
            dispatch(setAuthorId(user.id));
        }
    }, [isLoading, isLoggedIn, user, navigate, dispatch]);


    // 로딩 중일 때
    if (isLoading) {
        return (
            <Box maxWidth="md" mx="auto" p={3}>
                <Typography variant="h6" align="center">
                    로딩 중...
                </Typography>
            </Box>
        );
    }

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사 초기화
        const errors = {
            category: false,
            subCategory: false,
        };

        // 각 필드 유효성 검사
        if (!formData.category) {
            errors.category = true;
        }

        if (formData.category === "자주 묻는 질문" && !formData.subCategory) {
            errors.subCategory = true;
        }

        // 유효성 검사 결과 업데이트
        setValidationErrors(errors);

        // 필수 필드 검사
        if (!formData.title.trim() || !formData.content.trim() || errors.category || errors.subCategory) {
            if (!formData.title.trim() || !formData.content.trim()) {
                alert("제목과 내용을 입력해주세요.");
            } else if (errors.category) {
                alert("게시판을 선택해주세요.");
            } else if (errors.subCategory) {
                alert("FAQ 카테고리를 선택해주세요.");
            }
            return;
        }

        dispatch(setOpenSubmitDialog(true));
    };

    // 게시글 등록 확인
    // createPost 액션이 실행될 때의 실제 에러 내용을 확인
    const handleConfirmSubmit = async () => {
        try {
            // 필수 필드 검증
            if (!formData.title.trim()) {
                alert('제목을 입력해주세요.');
                return;
            }
            if (!formData.content.trim()) {
                alert('내용을 입력해주세요.');
                return;
            }
            if (!formData.category) {
                alert('게시판을 선택해주세요.');
                return;
            }
            if (formData.category === "자주 묻는 질문" && !formData.subCategory) {
                alert('FAQ 카테고리를 선택해주세요.');
                return;
            }

            const finalCategory = formData.category === "자주 묻는 질문"
                ? formData.subCategory
                : formData.category;

            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                boardId: formData.boardId || (finalCategory === '공지사항' ? 1 : 2),
                category: finalCategory,
                authorId: formData.authorId || user.id,
            };

            console.log('전송 데이터:', postData);

            const result = await dispatch(createPost(postData)).unwrap();

            console.log('생성 결과:', result);

            setSnackbarMessage("게시물이 성공적으로 등록되었습니다.");
            setSnackbarOpen(true);

            setTimeout(() => {
                setSnackbarOpen(false);
                navigate("/board");
            }, 1000);

            dispatch(resetForm());
        } catch (error) {
            console.error('게시글 생성 중 에러:', error);

            // 에러 타입에 따른 처리
            if (error.status === 401 || error.status === 403) {
                alert("권한이 없습니다. 다시 로그인해주세요.");
                navigate("/login");
            } else {
                alert(error.message || "게시물 등록에 실패했습니다.");
            }
        } finally {
            dispatch(setOpenSubmitDialog(false));
        }
    };

    // 입력 필드 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFormData({ [name]: value }));

        // 오류 상태 초기화
        if (name === 'category') {
            setValidationErrors(prev => ({
                ...prev,
                category: false,
                // FAQ가 아닌 경우 subCategory 오류 초기화
                subCategory: value !== '자주 묻는 질문' ? false : prev.subCategory
            }));

            dispatch(setFormData({
                [name]: value,
                boardId: value === '공지사항' ? 1 : 2,
                // FAQ가 아닌 경우 subCategory 초기화
                subCategory: value !== '자주 묻는 질문' ? '' : formData.subCategory
            }));
        } else if (name === 'subCategory') {
            setValidationErrors(prev => ({
                ...prev,
                subCategory: false
            }));
        }
    };

    // 취소 버튼 처리
    const handleCancelClick = () => {
        // 제목 또는 내용 둘 다 비어있을 때도 다이얼로그를 띄움
        dispatch(setOpenCancelDialog(true));
    };

    // 취소 확인
    const handleConfirmCancel = () => {
        dispatch(setOpenCancelDialog(false));
        dispatch(resetForm());
        navigate("/board");
    };

    // 다이얼로그 닫기
    const handleCloseDialog = (type) => {
        if (type === 'cancel') {
            dispatch(setOpenCancelDialog(false));
        } else {
            dispatch(setOpenSubmitDialog(false));
        }
    };

    // 관리자가 아닌 경우 표시 - 수정된 유연한 로직 사용
    if (!isLoggedIn || !checkIsAdmin(user)) {
        return (
            <Box maxWidth="md" mx="auto" p={3}>
                <Typography variant="h6" sx={{ color: '#EF5350' }} align="center">
                    관리자만 게시글을 등록할 수 있습니다.
                </Typography>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Button variant="contained" sx={{ backgroundColor: '#4169E1', color: '#fff' }} onClick={() => navigate("/board")}>
                        목록으로 돌아가기
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box maxWidth="md" mx="auto" p={3}>
            <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: 6 }}>
                게시글 등록
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                {/* 게시판 선택 */}
                <Box mb={3}>
                    <FormControl fullWidth variant="outlined" error={validationErrors.category} required>
                        <InputLabel>게시판 선택</InputLabel>
                        <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="게시판 선택"
                            required
                        >
                            <MenuItem value="공지사항">공지사항</MenuItem>
                            <MenuItem value="자주 묻는 질문">자주 묻는 질문</MenuItem>
                        </Select>
                        {validationErrors.category && (
                            <FormHelperText>게시판을 선택해주세요.</FormHelperText>
                        )}
                    </FormControl>
                </Box>

                {/* FAQ 카테고리 선택 */}
                {formData.category === "자주 묻는 질문" && (
                    <Box mb={3}>
                        <FormControl fullWidth variant="outlined" error={validationErrors.subCategory} required>
                            <InputLabel>카테고리 선택</InputLabel>
                            <Select
                                name="subCategory"
                                value={formData.subCategory}
                                onChange={handleChange}
                                label="카테고리 선택"
                                required
                            >
                                {faqCategories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors.subCategory && (
                                <FormHelperText>카테고리를 선택해주세요.</FormHelperText>
                            )}
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
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#29B6F6', color: '#fff' }}
                        type="submit"
                        disabled={loading}
                    >
                        등록
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#EF5350', color: '#fff' }}
                        onClick={handleCancelClick}
                        disabled={loading}
                    >
                        취소
                    </Button>
                </Box>
            </Box>

            {/* 취소 확인 다이얼로그 */}
            <Dialog open={openCancelDialog} onClose={() => handleCloseDialog('cancel')}>
                <DialogTitle>취소 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmCancel} sx={{ color: '#29B6F6' }}>
                        네
                    </Button>
                    <Button onClick={() => handleCloseDialog('cancel')} sx={{ color: '#EF5350' }}>
                        아니요
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 등록 확인 다이얼로그 */}
            <Dialog open={openSubmitDialog} onClose={() => handleCloseDialog('submit')}>
                <DialogTitle>등록 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        게시글을 등록하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmSubmit} sx={{ color: '#29B6F6' }}>
                        네
                    </Button>
                    <Button onClick={() => handleCloseDialog('submit')} sx={{ color: '#EF5350' }}>
                        아니요
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={1000} // 3초 후 자동으로 닫히도록 설정
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        color="inherit"
                        onClick={() => setSnackbarOpen(false)}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
}

export default PostCreatePage;