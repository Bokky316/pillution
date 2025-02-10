import React, { useState } from "react";
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

const FloatingConsultationButton = () => {
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState("OTHER");
    const [preMessage, setPreMessage] = useState("");
    const navigate = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleStartChat = async () => {
        if (!topic) {
            alert("주제를 선택해주세요.");
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topic,
                    preMessage,
                }),
            });

            if (response.ok) {
                const chatRoom = await response.json();
                handleClose();
                navigate(`/chatroom/${chatRoom.id}`);
            }
        } catch (error) {
            console.error("🚨 채팅방 생성 실패:", error.message);
        }
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="chat"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                }}
                onClick={handleOpen}
            >
                <ChatIcon />
            </Fab>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>새로운 상담 시작</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        label="상담 주제"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        margin="normal"
                    >
                        <option value="ORDER_ISSUE">주문 문제</option>
                        <option value="REFUND_REQUEST">환불 요청</option>
                        <option value="PRODUCT_INQUIRY">상품 문의</option>
                        <option value="OTHER">기타</option>
                    </TextField>
                    <TextField
                        fullWidth
                        label="사전 질문 (선택 사항)"
                        value={preMessage}
                        onChange={(e) => setPreMessage(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button onClick={handleStartChat} color="primary">
                        시작하기
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FloatingConsultationButton;
