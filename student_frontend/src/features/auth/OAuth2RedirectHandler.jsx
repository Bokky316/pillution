import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';

function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("OAuth2RedirectHandler 실행됨");

    const fetchUserInfo = async () => {
      try {
        // 절대 경로 사용
        const response = await fetch('/api/auth/userInfo', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log("OAuth2RedirectHandler - 사용자 정보:", data);

        dispatch(setUser({
          ...data.data,
          isSocialLogin: true,
          isLoggedIn: true,
        }));

        navigate('/');
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [dispatch, navigate]);

  return <div>카카오 로그인 처리 중...</div>;
}

export default OAuth2RedirectHandler;