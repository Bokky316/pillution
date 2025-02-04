import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '@/redux/authSlice';
import { fetchWithAuth } from '@features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}auth/userInfo`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.status === 'success') {
          dispatch(setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            roles: data.roles,
            isSocialLogin: true,
            provider: data.provider || 'kakao' // 백엔드에서 provider 정보를 제공하지 않을 경우 'kakao'로 설정
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
