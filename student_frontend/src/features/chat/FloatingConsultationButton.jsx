import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useDispatch } from 'react-redux';
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";
import { showSnackbar } from "@/redux/snackbarSlice";

const FloatingConsultationButton = () => {
    const [open, setOpen] = useState(false);
    const [preMessage, setPreMessage] = useState("");
    const [topic, setTopic] = useState("OTHER");
    const dispatch = useDispatch();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreateConsultationRequest = async () => {
            if (!preMessage.trim()) {
                dispatch(showSnackbar("❌ 사전 메시지를 입력하세요."));
                return;
            }

            try {
                console.log("API 호출 시작: /api/consultation/request");
                console.log("보내는 데이터:", { topic, preMessage });

                const response = await fetchWithAuth(`${API_URL}consultation/request`, {
                    method: "POST",
                    body: JSON.stringify({
                        topic,
                        preMessage,
                    }),
                });

                if (response.ok) {
                    console.log("API 호출 성공");
                    handleClose();
                    setPreMessage("");
                    setTopic("OTHER");
                    dispatch(showSnackbar("✅ 새로운 상담 요청이 생성되었습니다."));
                } else {
                    console.error("🚨 API 호출 실패: ${response.status} ${response.statusText}");
                }
            } catch (error) {
                console.error("🚨 네트워크 오류:", error.message);
            }
        };

    return (
        <>
            <Fab
                color="primary"
                aria-label="chat"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                }}
                onClick={handleOpen}
            >
                <ChatIcon />
            </Fab>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>새 상담 요청</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="사전 메시지"
                        value={preMessage}
                        onChange={(e) => setPreMessage(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="주제"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button onClick={handleCreateConsultationRequest} color="primary">
                        상담 요청하기
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FloatingConsultationButton;
