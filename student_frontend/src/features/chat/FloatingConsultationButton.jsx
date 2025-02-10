import React from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

const FloatingConsultationButton = () => {
    const navigate = useNavigate();

    const handleStartChat = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topic: null, // 초기에는 주제 없이 생성
                    preMessage: "", // 초기에는 사전 메시지 없이 생성
                }),
            });

            if (response.ok) {
                const chatRoom = await response.json();
                navigate(`/chatroom/${chatRoom.id}`); // 생성된 채팅방으로 이동
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
