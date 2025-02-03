import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";


/**
 * 로그인 컴포넌트
 - 부모로 부터 onLogin 함수를 프롭스로 전달 받음
 */
export default function Login({ onLogin }) {
    // 사용자가 입력하는 아이디와 비밀번호를 저장할 상태 변수
    const [credentials, setCredentials] = useState({ email: "test@example.com", password: "1234" });
    const [errorMessage, setErrorMessage] = useState(""); // ❗ 오류 메시지 상태 추가
    const navigate = useNavigate();
    // useDispatch 훅을 사용하여 디스패치 함수를 가져옴, 디스패치 함수는 액션을 스토어에 전달하는 함수,
    // 액션은 스토어의 상태를 변경하는 객체, 스토어는 액션을 받아 상태를 변경하는 역할
    const dispatch = useDispatch();
    const handleChange = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };


    /**
     * 로그인 요청을 보내는 함수
     * async 키워드 : handleLogin 함수가 비동기 함수임을 선언
     */
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
                // [중요] 로그인 응답(Response)에서 쿠키를 저장하도록 브라우저가 허용하는 역할을 하기 때문입니다.
                // 원래 이 설정은 사용자의 쿠키를 서버로 보내는 역할을 하기 때문에 여기서는 필요하지 않지만,
                // 서버에서 쿠키를 저장할 경우에 웹브라우저에서 쿠키를 저장하도록 허용하는 설정입니다.
                credentials: "include", // 쿠키 포함(쿠키에 토큰이 저장되어 있음)
            });

            const data = await response.json(); // ✅ 항상 JSON 응답을 받음

            // ✅ 상태 값을 기반으로 로그인 성공 여부 확인
            if (data.status === "failed") {
                setErrorMessage(data.message); // ❗ 로그인 실패 메시지 설정
                return;
            }

            // ✅ 로그인 성공 시 사용자 정보를 Redux에 저장
            dispatch(setUser({
                id: data.id,
                name: data.name,
                email: credentials.email,
                roles: data.roles,
            }));

            navigate("/");
        } catch (error) {
            console.error("로그인 요청 실패:", error.message);
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
                error={!!errorMessage} // ❗ 오류 발생 시 필드에 빨간 테두리 적용
                helperText={errorMessage} // ❗ 빨간색 오류 메시지 표시
            />
            <div style={{ display: "flex", justifyContent: "space-between", width: "400px" }}>
                <Button variant="contained" onClick={handleLogin}>
                    로그인
                </Button>

                 {/* ✅ 카카오 로그인 버튼 - href로 Spring Boot OAuth2 엔드포인트 연결 */}
                                <div className="social-login" style={{ width: "100%", textAlign: "center" }}>
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

                <Button variant="outlined" onClick={() => navigate("/registerMember")}>
                    회원가입
                </Button>
            </div>
        </div>
    );
}
