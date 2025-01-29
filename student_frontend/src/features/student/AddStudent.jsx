import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { API_URL } from '../../constant';


/**
    * 학생 정보 등록 컴포넌트
 */
export default function AddStudent() {
    // 입력된 학생 정보를 저장할 상태 변수
    const [student, setStudent] = useState({
        name: '',
        email: '',
        age: '',
        phone: '',
        address: '',
    });

    const navigate = useNavigate();

    // 학생 정보 입력 시 상태 변경 /학생객체를 스프레드 연산자로 복사하는 이유는 학생객체가 통째로 바껴야만 변경된 것을 인식하기 때문(즉, 참조주소가 변경이 되어야 인식)
    const onStudentChange = (event) => {
        setStudent({ ...student, [event.target.name]: event.target.value });
    };
    // 학생 정보 등록
    const handleOnSubmit = () => {
        // [개선] fetchWithAuth() 함수를 사용하여 서버에 학생 정보를 등록하는 요청을 보냄
        //      async/await 문법을 사용하여 비동기 처리로 변경
        fetch(API_URL + 'students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        })
            .then((response) => {
                if (response.ok) {
                    navigate('/'); // 우리 앱으로 "/" 요청이 온다. App 컴포넌트에서 Route에 의해서 "/" 매핑되어있는 StudentList 컴포넌트가 매핑된다.
                } else {
                    alert('학생 등록 실패');
                }
            })
            .catch((error) => console.error(error));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <TextField label="Name" name="name" value={student.name} onChange={onStudentChange} style={{ width: '400px', marginBottom: '10px' }} />
            <TextField label="Email" name="email" value={student.email} onChange={onStudentChange} style={{ width: '400px', marginBottom: '10px' }} />
            <TextField label="Age" name="age" value={student.age} onChange={onStudentChange} style={{ width: '400px', marginBottom: '10px' }} />
            <TextField label="Phone" name="phone" value={student.phone} onChange={onStudentChange} style={{ width: '400px', marginBottom: '10px' }} />
            <TextField label="Address" name="address" value={student.address} onChange={onStudentChange} style={{ width: '400px', marginBottom: '10px' }} />
            <Button variant="contained" onClick={handleOnSubmit}>
                등록
            </Button>
        </div>
    );
}
