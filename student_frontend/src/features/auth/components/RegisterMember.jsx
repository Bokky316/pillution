import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { API_URL } from "@/constant";
import { useNavigate } from "react-router-dom";
import { fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import axios from "axios";


/**
 * 회원가입 컴포넌트
 */
export default function RegisterMember() {
    // 입력된 회원 정보를 저장할 상태 변수
    const [member, setMember] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });

    // 이메일 중복 체크 오류 메시지 상태
    const [emailError, setEmailError] = useState(""); // 이메일 중복 체크 메시지 상태

    const navigate = useNavigate();

    // 회원 정보 입력 시 상태 변경
    const onMemberChange = (event) => {
        const { name, value } = event.target;
        setMember({ ...member, [name]: value });

        if (name === "email") {
            checkEmailDuplicate(value); // 이메일 입력 시 중복 체크 실행
        }
    };

    // 이메일 중복 체크 함수(fetch 대신 axios 사용)
    const checkEmailDuplicate = async (email) => {
        if (!email.includes("@")) return;

        try {
            // 🔹 `await`를 사용하여 서버 응답을 기다림
            const response = await axios.get(`${API_URL}members/checkEmail`, { params: { email } });

            // 🔹 응답에서 JSON 데이터 추출 (가독성 향상)
            const result = await response.data;

            // 🔹 상태 값 확인 후 처리
            if (result.status === "available") {
                setEmailError(""); // 사용 가능한 이메일이면 오류 메시지 초기화
            } else if (result.status === "duplicate") {
                setEmailError(result.message); // "이미 존재하는 이메일입니다."
            }
        } catch (error) {
            console.error("이메일 중복 체크 실패:", error.message);
        }
    };




    // 회원가입 처리
    const handleOnSubmit = async () => {
        if (emailError) {
            alert("이메일을 확인해 주세요."); // 이메일 오류가 있으면 진행하지 않음
            return;
        }

        try {
            console.log("회원가입 시작");

            const requestOptions = {
                method: "POST",
                body: JSON.stringify(member),
            };

            const response = await fetchWithoutAuth(`${API_URL}members/register`, requestOptions);

            if (response.ok) {
                alert("회원가입이 완료되었습니다.");
                navigate("/login");
            } else {
                const errorData = await response.json();
                alert(`회원가입 실패: ${errorData.message || "오류 발생"}`);
            }
        } catch (error) {
            console.error("회원가입 중 오류 발생:", error.message);
            alert("회원가입 실패: 네트워크 또는 서버 오류");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
            <Typography variant="h4" style={{ marginBottom: "20px", fontWeight: "bold" }}>
                회원가입
            </Typography>
            <TextField
                label="Name"
                name="name"
                value={member.name}
                onChange={onMemberChange}
                style={{ width: "400px", marginBottom: "10px" }}
            />
            <TextField
                label="Email"
                name="email"
                value={member.email}
                onChange={onMemberChange}
                style={{ width: "400px", marginBottom: "10px" }}
                error={!!emailError} // 에러 여부 표시
                helperText={emailError} // 오류 메시지 표시
            />
            <TextField
                label="Password"
                name="password"
                type="password"
                value={member.password}
                onChange={onMemberChange}
                style={{ width: "400px", marginBottom: "10px" }}
            />
            <TextField
                label="Phone"
                name="phone"
                value={member.phone}
                onChange={onMemberChange}
                style={{ width: "400px", marginBottom: "10px" }}
            />
            <TextField
                label="Address"
                name="address"
                value={member.address}
                onChange={onMemberChange}
                style={{ width: "400px", marginBottom: "10px" }}
            />
            <Button variant="contained" onClick={handleOnSubmit} disabled={!!emailError}>
                회원가입
            </Button>
        </div>
    );
}
