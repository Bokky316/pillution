// src/hooks/useMessage.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { setUnreadCount } from "@/redux/messageSlice";
import { API_URL } from "@/constant";

const useMessage = (userId) => {
    const dispatch = useDispatch();
    const [delayedUnreadCount, setDelayedUnreadCount] = useState(0);
    const unreadCount = useSelector(state => state.messages.unreadCount || 0);

    useEffect(() => {
        if (userId) {
            fetchUnreadMessagesCount(userId);
        }
    }, [userId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDelayedUnreadCount(unreadCount);
        }, 500);

        return () => clearTimeout(timeout);
    }, [unreadCount]);

    const fetchUnreadMessagesCount = async (userId) => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/unread/${userId}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setUnreadCount(data));
            }
        } catch (error) {
            console.error("🚨 읽지 않은 메시지 조회 실패:", error.message);
        }
    };

    return { delayedUnreadCount };
};

export default useMessage;
