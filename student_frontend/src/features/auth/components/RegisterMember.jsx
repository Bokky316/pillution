import { Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { API_URL } from "../../../constant";
import { useNavigate } from "react-router-dom";
import useDebounce from '../../../hook/useDebounce';


export default function RegisterMember() {
    const [member, setMember] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
    });
    const [email, setEmail] = useState("");
    const debouncedEmail = useDebounce(email, 500); // 500ms 디바운스 적용

    const [emailError, setEmailError] = useState(""); // 이메일 중복 메시지
    const navigate = useNavigate();

    // debounce된 이메일 값이 변경될 때마다 실행, 사용자가 입력할 때마다 실행되지 않고 500ms 후에 실행됩니다
    // 즉, 사용자가 입력을 멈추고 500ms 후에 실행됩니다
    useEffect(() => {
        if (debouncedEmail) {
            checkEmail(debouncedEmail);
        }
    }, [debouncedEmail]);

    // 입력 필드 변경 처리
    // const onMemberChange = (event) => {
    //     const { name, value } = event.target;
    //     setMember({ ...member, [name]: value });
    //
    //     if (name === "email") {
    //         checkEmail(value);
    //     }
    // };
    // 입력 필드 변경 처리
    const onMemberChange = (event) => {
        const { name, value } = event.target;
        setMember({ ...member, [name]: value }); // 입력 필드 값 업데이트
        if (name === "email") {
            setEmail(value); // 이 부분을 추가
        }
    };

    // 이메일 중복 체크
    const checkEmail = (email) => {
        fetch(`${API_URL}members/checkEmail?email=${email}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "duplicate") {
                    setEmailError(data.message);
                } else {
                    setEmailError("");
                }
            })
            .catch((error) => {
                console.error("이메일 중복 체크 중 오류 발생:", error);
                setEmailError("이메일 확인 중 오류가 발생했습니다.");
            });
    };

    // 회원가입 처리
    const handleOnSubmit = () => {
        fetch(API_URL + "members/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(member),
        })
            .then((response) => {
                if (response.ok) {
                    alert("회원가입이 완료되었습니다.");
                    navigate("/login");
                } else {
                    return response.text().then((text) => {
                        alert("회원가입 실패: " + text);
                    });
                }
            })
            .catch((error) => console.error("회원가입 중 오류 발생:", error));
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
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
                error={!!emailError}
                helperText={emailError}
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
                label="Address"
                name="address"
                value={member.address}
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
            <Button variant="contained" onClick={handleOnSubmit}>
                회원가입
            </Button>
        </div>
    );
}
