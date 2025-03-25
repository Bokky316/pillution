import React, { useState, useEffect } from "react";
import { Button, TextField, Snackbar, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // 아이콘 추가
import { useNavigate } from "react-router-dom";
import { SERVER_URL, API_URL } from "@/utils/constants";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import logo from "@/assets/images/logo.png"; // 필루션 로고 추가

export default function Login({ onLogin }) {
    const [credentials, setCredentials] = useState({ email: "test@example.com", password: "1234" });
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 보기 상태 추가
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [showLoginFields, setShowLoginFields] = useState(false); // 이메일/패스워드 입력칸 표시 여부
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL;

    const handleChange = (event) => {
        setCredentials((prev) => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
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
            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("로그인 요청 실패:", error.message);
            setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    const handleKakaoLogin = (e) => {
      e.preventDefault();
      window.location.href = `${PUBLIC_URL}/oauth2/authorization/kakao`;
    };

    // Enter 키로 로그인 실행
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && showLoginFields) {
                event.preventDefault();
                handleLogin();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [credentials, showLoginFields]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
            {/* 로고 및 메인 문구 */}
            <img src={logo} alt="필루션 로고" style={{ width: "180px", marginBottom: "20px" }} />
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px", lineHeight: "1.4" }}>
                <div>내일의 나를 만드는</div>
                <div>
                    <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>[</span>
                    <span style={{ color: "black", fontWeight: "bold" }}>건강메이트</span>
                    <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>]</span> 필루션
                </div>
            </div>



            <p style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>맞춤 영양제 정기구독 서비스</p>

            {/* 카카오 로그인 버튼 */}
            <Button
                onClick={handleKakaoLogin}
                style={{
                    width: "350px",
                    backgroundColor: "#FEE500",
                    color: "#000",
                    padding: "12px 0",
                    marginTop: "30px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                }}
            >
                카카오로 로그인
            </Button>

            {/* 이메일 로그인 버튼 (클릭하면 입력 필드 나타남) */}
            <Button
                variant="contained"
                onClick={() => setShowLoginFields(!showLoginFields)}
                style={{
                    width: "350px",
                    backgroundColor: "#4285F4",
                    color: "#fff",
                    padding: "12px 0",
                    marginTop: "15px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                }}
            >
                이메일로 로그인
            </Button>

            {/* 이메일/패스워드 입력 필드 (버튼 클릭 시 표시) */}
            {showLoginFields && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
                    <TextField
                        label="Email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        style={{ width: "350px", marginBottom: "10px" }}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={handleChange}
                        style={{ width: "350px", marginBottom: "10px" }}
                        error={!!errorMessage}
                        helperText={errorMessage}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "350px", marginTop: "10px" }}>
                        <Button
                            variant="contained"
                            onClick={handleLogin}
                            style={{ width: "48%", padding: "10px 0", fontSize: "14px" }}
                        >
                            로그인
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/registerMember")}
                            style={{ width: "48%", padding: "10px 0", fontSize: "14px" }}
                        >
                            회원가입
                        </Button>
                    </div>
                </div>
            )}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="로그인 성공! 홈페이지로 이동합니다."
            />
        </div>
    );
}
