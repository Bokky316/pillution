import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { API_URL } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';

function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 쿠키는 자동으로 포함되므로 credentials: 'include'만 설정
        const response = await fetch(`${API_URL}auth/userInfo`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log("OAuth2RedirectHandler - Full response data:", data);

        if (data.status === 'success') {
          // 사용자 정보를 Redux store에 저장
          dispatch(setUser({
            ...data.data,
            isSocialLogin: true,
            isLoggedIn: true,
            provider: data.data.provider || 'kakao'
          }));

          navigate('/');
        } else {
          throw new Error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [dispatch, navigate]);

  return <div>로그인 처리 중...</div>;
}

export default OAuth2RedirectHandler;