import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo, setUser } from "@/store/authSlice";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

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
