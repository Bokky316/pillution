import React from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";
import useAuth from "@/hooks/useAuth";

const FloatingConsultationButton = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // 현재 로그인한 사용자 정보 가져오기

    const handleStartChat = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: user.id, // 로그인한 사용자 ID
                }),
            });

            if (response.ok) {
                const chatRoom = await response.json();

                // 응답 데이터에 id가 있는지 확인
                if (chatRoom && chatRoom.id) {
                    navigate(`/chatroom/${chatRoom.id}`); // 생성된 채팅방으로 이동
                } else {
                    console.error("🚨 채팅방 생성 실패: 응답 데이터에 ID가 없습니다.");
                }
            } else {
                console.error("🚨 채팅방 생성 실패:", response.statusText);
            }
        } catch (error) {
            console.error("🚨 네트워크 오류:", error.message);
        }
    };

    return (
        <Fab
            color="primary"
            aria-label="chat"
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
            }}
            onClick={handleStartChat}
        >
            <ChatIcon />
        </Fab>
    );
};

export default FloatingConsultationButton;
