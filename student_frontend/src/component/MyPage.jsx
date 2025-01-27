import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../redux/userSlice";

export default function MyPage() {
    const student = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        console.log("로그아웃");
        dispatch(clearUser());
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1>My Page</h1>
            <p>{student.name}님, 안녕하세요!</p>
            <button onClick={handleLogout}>로그아웃</button>
        </div>
    );
}
