import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Box,
    Typography,
    CircularProgress,
    Snackbar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URL } from "@/utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import KakaoAddressSearch from "@/features/auth/KakaoAddressSearch";

const EditMember = () => {
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { memberId } = useParams();

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`${API_URL}members/${memberId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    const memberData = data.data;
                    setMember({
                        id: memberData.id,
                        name: memberData.name || '',
                        email: memberData.email || '',
                        phone: memberData.phone || '',
                        postalCode: memberData.postalCode || '',
                        roadAddress: memberData.roadAddress || '',
                        detailAddress: memberData.detailAddress || '',
                        birthDate: memberData.birthDate || '',
                        gender: memberData.gender || '',
                        activate: memberData.activate || false,
                        role: memberData.role || ''
                    });
                } else {
                    throw new Error(data.message || '회원 정보를 불러오지 못했습니다.');
                }
            } catch (error) {
                console.error("Error fetching member data:", error);
                setSnackbarMessage("회원 정보를 불러오는 중 오류가 발생했습니다.");
                setSnackbarOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMember();
    }, [memberId]);

    const handleAddressSelect = (data) => {
        setMember({
            ...member,
            postalCode: data.zonecode,
            roadAddress: data.roadAddress,
        });
    };

    const handleUpdateConfirm = () => {
        setDialogOpen(false);
        handleUpdate();
    };

    const handleUpdate = async () => {
        const updateData = {
            name: member.name,
            email: member.email,
            phone: member.phone,
            postalCode: member.postalCode,
            roadAddress: member.roadAddress,
            detailAddress: member.detailAddress,
            birthDate: member.birthDate || null,
            gender: member.gender,
            activate: member.activate
        };

        try {
            const response = await fetch(`${API_URL}members/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '업데이트 실패');
            }
            const data = await response.json();
            if (data.status === 'success') {
                setSnackbarMessage('수정이 완료되었습니다.');
                setSnackbarOpen(true);
                setTimeout(() => {
                    navigate('/adminPage/members');
                }, 1000);
            } else {
                throw new Error(data.message || '업데이트 실패');
            }
        } catch (error) {
            console.error("Error updating member:", error);
            setSnackbarMessage("업데이트 중 오류가 발생했습니다.");
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!member) {
        return (
            <Paper elevation={2} sx={{ padding: '24px', borderRadius: '12px', maxWidth: '600px', margin: '24px auto' }}>
                <Typography variant="h6" color="error">
                    회원 정보를 불러올 수 없습니다.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', maxWidth: '600px', margin: '24px auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
                회원 수정
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 기존 폼 필드들 */}
                <TextField label="ID" value={member.id || ""} InputProps={{ readOnly: true }} fullWidth />
                <TextField label="이름" value={member.name || ""} onChange={(e) => setMember({ ...member, name: e.target.value })} fullWidth />
                <TextField label="이메일" value={member.email || ""} onChange={(e) => setMember({ ...member, email: e.target.value })} fullWidth />

                <div style={{ display: "flex", width: "400px", marginBottom: "10px" }}>
                    <TextField label="우편번호" name="postalCode" value={member.postalCode} style={{ flex: 1, marginRight: "10px" }} disabled />
                    <KakaoAddressSearch onAddressSelect={handleAddressSelect} />
                </div>
                <TextField label="도로명 주소" name="roadAddress" value={member.roadAddress} onChange={(e) => setMember({ ...member, roadAddress: e.target.value })} fullWidth />
                <TextField label="상세 주소" name="detailAddress" value={member.detailAddress} onChange={(e) => setMember({ ...member, detailAddress: e.target.value })} fullWidth />

                <TextField
                    label="생년월일"
                    type="date"
                    value={member.birthDate || ""}
                    onChange={(e) => setMember({ ...member, birthDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                    <InputLabel>성별</InputLabel>
                    <Select
                        value={member.gender || ""}
                        label="성별"
                        onChange={(e) => setMember({ ...member, gender: e.target.value })}
                    >
                        <MenuItem value="남성">남성</MenuItem>
                        <MenuItem value="여성">여성</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="휴대폰번호"
                    value={member.phone || ""}
                    onChange={(e) => setMember({ ...member, phone: e.target.value })}
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>계정 상태</InputLabel>
                    <Select
                        value={member.activate ? "활성" : "탈퇴"}
                        label="계정 상태"
                        onChange={(e) => setMember({ ...member, activate: e.target.value === "활성" })}
                    >
                        <MenuItem value="활성">활성회원</MenuItem>
                        <MenuItem value="탈퇴">탈퇴회원</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setDialogOpen(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        수정
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/adminPage/members')}
                        sx={{ textTransform: 'none' }}
                    >
                        취소
                    </Button>
                </Box>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleCloseSnackbar}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    회원 정보 수정
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        회원 정보를 수정하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUpdateConfirm} sx={{ color: '#29B6F6' }} autoFocus>
                        확인
                    </Button>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#EF5350' }}>
                        취소
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default EditMember;