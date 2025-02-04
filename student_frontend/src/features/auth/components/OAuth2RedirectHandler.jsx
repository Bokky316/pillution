import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '@/redux/authSlice';
import { fetchWithoutAuth } from '@features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 토큰을 localStorage에 저장
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          dispatch(setUser({
            ...data.user,
            isSocialLogin: true,
            provider: 'kakao'
          }));
          navigate('/');
        } else {
          console.error('Failed to fetch user info');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [dispatch, navigate]);

  return <div>Loading...</div>;
}

export default OAuth2RedirectHandler;
