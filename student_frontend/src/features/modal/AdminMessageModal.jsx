import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { showSnackbar } from "@/store/snackbarSlice";

const AdminMessageModal = ({ open, onClose, onSend }) => {
    const [adminMessageContent, setAdminMessageContent] = useState("");
    const [receiverType, setReceiverType] = useState("ALL");
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const receiverOptions = [
        { value: 'ALL', label: '모든 사용자' },
        { value: 'ROLE', label: '역할별 사용자' },
        { value: 'USER', label: '특정 사용자' }
    ];

    const handleSendAdminMessage = async () => {
        if (!adminMessageContent) {
            dispatch(showSnackbar("메시지를 입력해주세요."));
            return;
        }

        let receiverId = "0";

        if (receiverType === 'ROLE' || receiverType === 'USER') {
            if (!selectedReceiver) {
                dispatch(showSnackbar("수신자를 선택해주세요."));
                return;
            }
            receiverId = selectedReceiver;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}messages/admin/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    content: adminMessageContent,
                    receiverType: receiverType,
                    receiverId: receiverId,
                    isNotice: true
                }),
            });

            if (response.ok) {
                dispatch(showSnackbar("관리자 메시지가 성공적으로 전송되었습니다."));
                onClose();
                onSend();
            } else {
                dispatch(showSnackbar("관리자 메시지 전송 실패"));
            }
        } catch (error) {
            console.error("관리자 메시지 전송 실패:", error.message);
            dispatch(showSnackbar("관리자 메시지 전송 실패"));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>관리자 공지 보내기</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>수신자 유형</InputLabel>
                    <Select
                        value={receiverType}
                        onChange={(e) => {
                            setReceiverType(e.target.value);
                            setSelectedReceiver(null);
                        }}
                    >
                        {receiverOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {receiverType === 'ROLE' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>역할 선택</InputLabel>
                        <Select
                            value={selectedReceiver ? selectedReceiver : ''}
                            onChange={(e) => setSelectedReceiver(e.target.value)}
                        >
                            <MenuItem value="USER">일반 사용자</MenuItem>
                            <MenuItem value="ADMIN">관리자</MenuItem>
                            <MenuItem value="CS_AGENT">상담원</MenuItem>
                        </Select>
                    </FormControl>
                )}

                {receiverType === 'USER' && (
                    <TextField
                        fullWidth
                        label="사용자 ID"
                        value={selectedReceiver || ''}
                        onChange={(e) => setSelectedReceiver(e.target.value)}
                        margin="normal"
                    />
                )}

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="공지 내용"
                    value={adminMessageContent}
                    onChange={(e) => setAdminMessageContent(e.target.value)}
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSendAdminMessage} color="primary">보내기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminMessageModal;
