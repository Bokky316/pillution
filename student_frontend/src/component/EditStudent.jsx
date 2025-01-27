import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../constant';
import { fetchWithAuth } from '../common/fetchWithAuth';
import { getUserFromLocalStorage } from '../common/authUtil';

export default function EditStudent({ studentData = null, updateStudent, onClose }) {
    const { id } = useParams(); // 학생 정보 조회 화면에서 수정버튼 클릭 시 navigate("/editStudent/109"),  -> 이 말은 곧 웹 브라우저의 주소창에 "/editStudent/109"이 요청이 간다는 것. 그러면 EditStudent 컴포넌트에서는 주소창의 /:id 로 되어있는 값을 추출한다. (URL에서 학생 ID 추출)
    const [student, setStudent] = useState(studentData); // 학생 정보 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [isAuthorized, setIsAuthorized] = useState(false); // 권한 확인 상태
    const navigate = useNavigate();


    // [수정] useEffect() 함수를 수정하여 권한 확인과 학생 데이터 로드를 분리
    /**
        * useEffect() 함수
        * [studentData, id, navigate] : 의존성 배열이 변경될 때마다 usedEffect() 함수가 실행\
        * id는 useParams()를 사용하여 주소창의 /:id값을 가져오는데 이 값이 변경되어도 usedEffect() 함수가 다시 실행된다.
        *    즉, 웹브라우저의 주소창에서 수동으로 id를 변경해도 usedEffect() 함수가 실행된다.
     */
    useEffect(() => {
        // 1. 로컬 스토리지에서 사용자 정보 가져오기
        const user = getUserFromLocalStorage();
        console.log("로컬 스토리지에서 가져온 사용자:", user);

        // 2. 사용자 정보가 있고, 권한이 있고 그 권한이 ROLE_ADMIN 이면 setIsAuthorized(true)로 설정
        if (user && Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN")) {
            setIsAuthorized(true); // 권한 있음으로 상태 변경
        } else {
            alert("권한이 없습니다.");
            navigate("/"); // 권한이 없으면 목록 페이지로 이동
        }
        // 3. studentData가 없고, id가 있으면 학생 정보를 불러옴, 학생 목록에서 수정을 눌러서 온게 아니고  학생 정보보기 화면에서 [수정]을 눌러서 온 경우
        if (!studentData && id) {
            // 1. 로딩 상태를 변경
            setLoading(true);
            // 2. fetchWithAuth() 함수를 사용하여 서버에서 학생 정보를 가져옴(요청시 토큰 포함)
            // fetchWithAuth(`${API_URL}students/${id}`)
            fetchWithAuth(`${API_URL}students/${id}`, {
                    method: 'GET', // GET 요청 명시
                })
                .then((data) => setStudent(data)) // 3. 학생 정보를 상태 변수에 저장 -> 학생정보가 화면 상에 출력됨
                .catch((error) => console.error("학생 데이터 로드 실패:", error))
                .finally(() => setLoading(false)); // 4. 로딩 상태를 false로 변경
        }
    }, [studentData, id, navigate]);


    const handleInputChange = (event) => {
        setStudent({ ...student, [event.target.name]: event.target.value });
    };

    /**
     * 학생 정보 저장 함수[PUT요청]
     */
    const handleSave = async () => {
        try {
            await fetchWithAuth(`${API_URL}students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student),
            });

            alert('학생 정보가 수정되었습니다.');
            if (updateStudent) { // 학생 목록에서 모달 사용 시 부모 컴포넌트로 데이터 전달
                updateStudent(student); // 모달 사용 시 부모 컴포넌트로 데이터 전달
            } else {
                navigate(`/viewStudent/${id}`); // 일반 화면일 경우 상세 페이지로 이동
            }
        } catch (error) {
            console.error('학생 수정 중 오류 발생:', error);
            alert('수정 실패');
        }

        if (onClose) onClose(); // 모달 닫기 처리
    };

    if (!isAuthorized) {
        return null; // 권한이 없으면 아무것도 렌더링하지 않음
    }

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!student) {
        return <div>학생 정보를 로드할 수 없습니다.</div>;
    }

    // 모달일 경우
    if (onClose) {
        return (
            <Dialog open={Boolean(student)} onClose={onClose}>
                <DialogTitle>학생 정보 수정</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        name="name"
                        value={student?.name || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={student?.email || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Age"
                        name="age"
                        value={student?.age || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Phone"
                        name="phone"
                        value={student?.phone || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={student?.address || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>취소</Button>
                    <Button onClick={handleSave} color="primary">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // 일반 화면일 경우
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>학생 정보 수정</h2>
            <TextField
                label="Name"
                name="name"
                value={student?.name || ''}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
            />
            <TextField
                label="Email"
                name="email"
                value={student?.email || ''}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
            />
            <TextField
                label="Age"
                name="age"
                value={student?.age || ''}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
            />
            <TextField
                label="Phone"
                name="phone"
                value={student?.phone || ''}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
            />
            <TextField
                label="Address"
                name="address"
                value={student?.address || ''}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    목록
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    저장
                </Button>
            </div>
        </div>
    );
}
