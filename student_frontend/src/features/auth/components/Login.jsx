import React, { useState } from "react";
import { Button, TextField, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL, SERVER_URL } from "@/constant";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

export default function Login({ onLogin }) {
    const [credentials, setCredentials] = useState({ email: "test@example.com", password: "1234" });
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };

    const handleLogin = async () => {
        try {
            const formData = new URLSearchParams();
            formData.append("username", credentials.email);
            formData.append("password", credentials.password);

            const response = await fetch(API_URL + "auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {  // 🔥 HTTP 상태 코드 체크 (401 에러 시 실행됨)
                setErrorMessage("로그인 실패: 아이디 또는 비밀번호가 틀립니다.");
                return;
            }

            const data = await response.json();

            if (data.status === "failed") {
                setErrorMessage(data.message);
                return;
            }

            dispatch(setUser({
                id: data.id,
                name: data.name,
                email: credentials.email,
                roles: data.roles,
            }));

            setOpenSnackbar(true);
            setTimeout(() => navigate("/"), 1000);
        } catch (error) {
            console.error("로그인 요청 실패:", error.message);
            setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    const handleKakaoLogin = (e) => {
        e.preventDefault();
        if (window.Kakao) {
            window.Kakao.Auth.logout(() => {
                window.location.href = `${SERVER_URL}oauth2/authorization/kakao`;
            });
        } else {
            window.location.href = `${SERVER_URL}oauth2/authorization/kakao`;
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
            <TextField
                label="Email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                style={{ width: "400px", marginBottom: "10px" }}
            />
            <TextField
                label="Password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                style={{ width: "400px", marginBottom: "10px" }}
                error={!!errorMessage}
                helperText={errorMessage}
            />
            <div style={{ display: "flex", justifyContent: "space-between", width: "400px", marginBottom: "20px" }}>
                <Button variant="contained" onClick={handleLogin}>
                    로그인
                </Button>
                <Button variant="outlined" onClick={() => navigate("/registerMember")}>
                    회원가입
                </Button>
            </div>
            <div className="social-login" style={{ width: "400px", textAlign: "center" }}>
                <p>소셜 계정으로 로그인</p>
                <a
                    href={`${SERVER_URL}oauth2/authorization/kakao`}
                    style={{
                        display: "inline-block",
                        backgroundColor: "#FEE500",
                        color: "#000",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    카카오로 로그인
                </a>
            </div>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="로그인 성공! 홈페이지로 이동합니다."
            />
        </div>
    );
}
