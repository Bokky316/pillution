import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "@/redux/authSlice";
import { API_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";

const OAuthRedirectHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ URL에서 JWT 토큰 추출
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      // ✅ JWT 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", token);

      // ✅ 사용자 정보 가져오기
      fetchWithAuth(`${API_URL}auth/userInfo`)
        .then(response => {
          if (!response.ok) throw new Error("사용자 정보 가져오기 실패");
          return response.json();
        })
        .then(userData => {
          // ✅ Redux에 사용자 정보 저장
          dispatch(setUser(userData));
          navigate("/"); // ✅ 로그인 후 홈으로 이동
        })
        .catch(error => {
          console.error("OAuth 로그인 후 사용자 정보 가져오기 오류:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthRedirectHandler;
