import React from "react";
import { Paper, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";
import useAuth from "@/hooks/useAuth";

const ConsultationOptions = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleFAQ = () => {
        navigate("/faq"); // FAQ 페이지로 이동
        onClose();
    };

    const handleStartChat = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: user.id,
                }),
            });

            if (response.ok) {
                const chatRoom = await response.json();
                if (chatRoom && chatRoom.id) {
                    navigate(`/chatroom/${chatRoom.id}`);
                } else {
                    console.error("🚨 채팅방 생성 실패: 응답 데이터에 ID가 없습니다.");
                }
            } else {
                console.error("🚨 채팅방 생성 실패:", response.statusText);
            }
        } catch (error) {
            console.error("🚨 네트워크 오류:", error.message);
        }
        onClose();
    };

    return (
        <Paper
            elevation={3}
            style={{
                position: "fixed",
                bottom: "80px",
                right: "20px",
                padding: "16px",
                maxWidth: "300px",
            }}
        >
            <Typography variant="h6" gutterBottom>
                무엇을 도와드릴까요?
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <Button
                    variant="outlined"
                    onClick={handleFAQ}
                    sx={{
                        color: '#4169E1',
                        borderColor: '#4169E1',
                        '&:hover': {
                            borderColor: '#3a5fcf',
                            backgroundColor: 'rgba(65, 105, 225, 0.04)'
                        }
                    }}
                >
                    FAQ 보기
                </Button>
                <Button
                    variant="contained"
                    onClick={handleStartChat}
                    sx={{
                        backgroundColor: '#4169E1',
                        '&:hover': {
                            backgroundColor: '#3a5fcf'
                        }
                    }}
                >
                    상담원과 채팅하기
                </Button>
            </Box>
        </Paper>
    );
};

export default ConsultationOptions;
