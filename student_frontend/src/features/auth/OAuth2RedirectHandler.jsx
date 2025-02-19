import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { API_URL } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { fetchWithoutAuth } from '@features/auth/fetchWithAuth';

function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // fetchWithoutAuth 함수를 사용하여 사용자 정보를 가져옵니다.
        const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
          method: 'GET',
          credentials: 'include', // 쿠키를 포함하여 요청을 보냅니다.
        });

        const data = await response.json();
        console.log("OAuth2RedirectHandler - Full response data:", data);

        if (data.status === 'success') {
          // 사용자 정보를 Redux store에 저장합니다.
          dispatch(setUser({
            ...data.data,
            isSocialLogin: true,
            isLoggedIn: true,
            provider: data.data.provider || 'kakao' // 기본값으로 'kakao'를 사용합니다.
          }));

          // 사용자 정보 저장 후 홈페이지로 이동합니다.
          navigate('/');
        } else {
          throw new Error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // 에러 발생 시 로그인 페이지로 이동합니다.
        navigate('/login');
      }
    };

    // 컴포넌트가 마운트되면 사용자 정보를 가져옵니다.
    fetchUserInfo();
  }, [dispatch, navigate]);

  // 데이터를 가져오는 동안 로딩 메시지를 표시합니다.
  return <div>Loading...</div>;
}

export default OAuth2RedirectHandler;
