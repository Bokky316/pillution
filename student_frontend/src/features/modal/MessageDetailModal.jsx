import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { showSnackbar } from "@/store/snackbarSlice";
import { markMessageAsRead } from "@/store/messageSlice";

/**
 * MessageDetailModal 컴포넌트
 * 메시지 상세 내용을 표시하고 답장 기능을 제공하는 모달
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 open 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Object} props.message - 표시할 메시지 객체
 * @param {boolean} props.isAdmin - 관리자 여부
 * @param {Function} props.onReply - 답장 완료 후 실행할 함수
 * @returns {JSX.Element} MessageDetailModal 컴포넌트
 */
const MessageDetailModal = ({ open, onClose, message, isAdmin, onReply }) => {
    const [replyContent, setReplyContent] = useState("");
    const dispatch = useDispatch();

    const handleReply = async () => {
        if (!message || !replyContent) return;
        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: message.receiverId,
                    receiverId: message.senderId,
                    content: replyContent,
                }),
            });

            onClose();
            setReplyContent("");
            dispatch(showSnackbar("✅ 답장이 전송되었습니다."));
            onReply();
        } catch (error) {
            console.error("🚨 답장 전송 실패:", error.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>메시지 내용</DialogTitle>
            <DialogContent>
                <Typography>{message?.content}</Typography>
                {isAdmin && (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="답장"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        margin="normal"
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
                {isAdmin && (
                    <Button onClick={handleReply} color="primary">답장</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default MessageDetailModal;
