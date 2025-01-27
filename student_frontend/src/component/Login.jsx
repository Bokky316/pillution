import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constant";
import { fetchWithAuth } from "../common/fetchWithAuth";

/**
 * 로그인 컴포넌트
 * 부모로 부터 onLogin 함수를 프롭스로 전달 받음
 */
export default function Login({ onLogin }) {
    // 사용자가 입력하는 아이디와 비밀번호를 저장할 상태 변수
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };


    /**
     * 로그인 요청을 보내는 함수
     * async 키워드 : handleLogin 함수가 비동기 함수임을 선언
     */
    const handleLogin = async () => {
        try {
            /*
            [1] 타임리프와 같은 템플릿 엔진을 사용하는 경우
            const response = await fetch(API_URL + "auth/login", {
                method: "POST",
                //headers: { "Content-Type": "application/json" },
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                //body: JSON.stringify(credentials),
                body: JSON.stringify({
                    username: credentials.email, // email을 username으로 매핑
                    password: credentials.password,
                }),
            });
            */

            // [2] 리액트 등의 프론트엔드 라이브러리를 사용하는 경우
            // Spring Security의 기본 폼 로그인 처리는 일반적으로 application/x-www-form-urlencoded 형식의 데이터를 기대함
            // await : async 함수 내에서만 사용 가능, 비동기 처리가 완료될 때까지 기다림
            const formData = new URLSearchParams(); // 사용자가 입력한 값을 객체 형태로 변환
            formData.append('username', credentials.email); // email을 username으로 매핑(시큐리티 username이 id와 같을 역할)
            formData.append('password', credentials.password);

            // fetch API를 사용하여 서버에 로그인 요청을 보냄, 결과는 response에 저장
            // await : 비동기 처리 할 때 await라는 키워드를 사용하여 해당 비동기 처리가 완료될 때까지 기다림
            // fetch : 네트워크 요청을 보내는 함수, 첫 번째 인자로 URL을 받고, 두 번째 인자로 옵션 객체를 받음
            //          옵션 객체에는 요청 방식(method), 헤더(headers), 바디(body) 등을 설정할 수 있음
            const response = await fetch(API_URL + "auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData,
            });

            // fetch API의 응답이 성공이 아닌 경우, 에러 메시지를 던짐
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "로그인 실패");
            }

            console.log("Login 컴포넌트 handleLogin 로그인 성공 response: ", response);

            const data = await response.json(); // 응답에서 JSON 데이터를 추출, await : 추출하는 동안 기다림(비동기)

            console.log("Login 컴포넌트 handleLogin 로그인 성공 response.json(): ", data);

            // 권한 정보를 포함하여 부모 컴포넌트로 전달
            onLogin(
                { name: data.name, email: credentials.email, authorities: data.authorities },
                data.token
            );

            // 로그인 성공 시, 메인 페이지로 이동
            navigate("/");
        } catch (error) {
            console.error("로그인 실패:", error.message);
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
            />
            <div style={{ display: "flex", justifyContent: "space-between", width: "400px" }}>
                <Button variant="contained" onClick={handleLogin}>
                    로그인
                </Button>
                <Button variant="outlined" onClick={() => navigate("/registerMember")}>
                    회원가입
                </Button>
            </div>
        </div>
    );
}
