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
    CircularProgress
} from '@mui/material';
import { API_URL } from "@/utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import KakaoAddressSearch from "@/features/auth/KakaoAddressSearch"; // KakaoAddressSearch 컴포넌트 import


const EditMember = () => {
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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
                        postalCode: memberData.postalCode || '',       // 우편번호 추가
                        roadAddress: memberData.roadAddress || '',     // 도로명 주소 추가
                        detailAddress: memberData.detailAddress || '', // 상세 주소 추가
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
                alert("회원 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMember();
    }, [memberId]);


    // 카카오 주소 검색 후 선택한 주소를 상태에 저장
    const handleAddressSelect = (data) => {
        console.log("[DEBUG] 선택된 주소 데이터:", data);

        setMember({
            ...member,
            postalCode: data.zonecode,  // 우편번호
            roadAddress: data.roadAddress,  // 도로명 주소
        });
    };



    const handleUpdate = async () => {
        const updateData = {
            name: member.name,
            email: member.email,
            phone: member.phone,
            postalCode: member.postalCode,     // 우편번호 추가
            roadAddress: member.roadAddress,   // 도로명 주소 추가
            detailAddress: member.detailAddress, // 상세 주소 추가
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
                alert('수정이 완료되었습니다.');
                navigate('/adminPage/members');
            } else {
                alert(data.message || '업데이트 실패');
            }
        } catch (error) {
            console.error("Error updating member:", error);
            alert("업데이트 중 오류가 발생했습니다.");
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!member) {
        return (
            <Paper
                elevation={2}
                sx={{
                    padding: '24px',
                    borderRadius: '12px',
                    maxWidth: '600px',
                    margin: '24px auto'
                }}
            >
                <Typography variant="h6" color="error">
                    회원 정보를 불러올 수 없습니다.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={2}
            sx={{
                padding: '24px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                maxWidth: '600px',
                margin: '24px auto'
            }}
        >
            <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}
            >
                회원 수정
            </Typography>
            <Box
                component="form"
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <TextField
                    label="ID"
                    value={member.id || ""}
                    InputProps={{ readOnly: true }}
                    fullWidth
                />
                <TextField
                    label="이름"
                    value={member.name || ""}
                    onChange={(e) => setMember({ ...member, name: e.target.value })}
                    fullWidth
                />
                <TextField
                    label="이메일"
                    value={member.email || ""}
                    onChange={(e) => setMember({ ...member, email: e.target.value })}
                    fullWidth
                />

                {/* 카카오 주소 검색 컴포넌트 */}
                <div style={{ display: "flex", width: "400px", marginBottom: "10px" }}>
                    <TextField label="우편번호" name="postalCode" value={member.postalCode} style={{ flex: 1, marginRight: "10px" }} disabled />
                    <KakaoAddressSearch onAddressSelect={handleAddressSelect} />
                </div>
                <TextField
                    label="도로명 주소"
                    name="roadAddress"
                    value={member.roadAddress}
                    onChange={(e) => setMember({ ...member, roadAddress: e.target.value })}
                    fullWidth
                />
                <TextField
                    label="상세 주소"
                    name="detailAddress"
                    value={member.detailAddress}
                    onChange={(e) => setMember({ ...member, detailAddress: e.target.value })}
                    fullWidth
                />

                <TextField
                    label="생년월일"
                    type="date"
                    value={member.birthDate || ""}
                    onChange={(e) =>
                        setMember({ ...member, birthDate: e.target.value })
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                    <InputLabel>성별</InputLabel>
                    <Select
                        value={member.gender || ""}
                        label="성별"
                        onChange={(e) =>
                            setMember({ ...member, gender: e.target.value })
                        }
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
                        onChange={(e) =>
                            setMember({ ...member, activate: e.target.value === "활성" })
                        }
                    >
                        <MenuItem value="활성">활성회원</MenuItem>
                        <MenuItem value="탈퇴">탈퇴회원</MenuItem>
                    </Select>
                </FormControl>
                <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
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
        </Paper>
    );
};

export default EditMember;