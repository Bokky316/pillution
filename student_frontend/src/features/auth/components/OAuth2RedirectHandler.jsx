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

        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        console.log("OAuth2RedirectHandler - Full response data:", data);

        if (data.status === 'success') {
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

  return <div>Loading...</div>;
}

export default OAuth2RedirectHandler;
