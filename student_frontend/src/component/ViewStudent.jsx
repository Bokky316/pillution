import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from "../constant";
import { Button, TextField, Typography, Box } from '@mui/material';

export default function ViewStudent() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}students/${id}`)
            .then(response => response.json())
            .then(data => setStudent(data))
            .catch(error => console.error(error));
    }, [id]);

    const handleDelete = () => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            fetch(`${API_URL}students/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        alert('학생이 삭제되었습니다.');
                        navigate('/');
                    } else {
                        alert('삭제 실패');
                    }
                })
                .catch(error => console.error(error));
        }
    };

    if (!student) return <div>로딩 중...</div>;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 2,
                margin: '0 auto',
                maxWidth: 600,
                gap: 2,
            }}
        >
            <Typography variant="h4" gutterBottom>
                {student.name}님의 상세 정보
            </Typography>
            <TextField
                label="이메일"
                value={student.email}
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />
            <TextField
                label="나이"
                value={student.age}
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />
            <TextField
                label="연락처"
                value={student.phone}
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />
            <TextField
                label="주소"
                value={student.address}
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" onClick={() => navigate('/editStudent/' + id)}>
                    수정
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete}>
                    삭제
                </Button>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    목록
                </Button>
            </Box>
        </Box>
    );
}
