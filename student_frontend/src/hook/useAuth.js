// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, clearUser } from "@/redux/authSlice";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

const useAuth = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, user } = useSelector(state => state.auth);

    useEffect(() => {
        const checkLoginStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithoutAuth(`${API_URL}auth/userInfo`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && data.status === "success") {
                    dispatch(fetchUserInfo(data.data));
                } else {
                    dispatch(clearUser());
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                dispatch(clearUser());
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [dispatch]);

    return { isLoading, isLoggedIn, user };
};

export default useAuth;
