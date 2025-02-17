import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Autocomplete, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { showSnackbar } from "@/store/snackbarSlice";
import useDebounce from "@/hooks/useDebounce";

/**
 * AdminMessageModal 컴포넌트
 * 관리자가 공지 메시지를 작성하고 전송하는 모달
 * 관리자만 사용 가능
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 open 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Function} props.onSend - 메시지 전송 완료 후 실행할 함수
 * @returns {JSX.Element} AdminMessageModal 컴포넌트
 */
const AdminMessageModal = ({ open, onClose, onSend }) => {
    const [messageContent, setMessageContent] = useState("");
    const [selectedReceiverType, setSelectedReceiverType] = useState("ALL");
    const [selectedReceiverId, setSelectedReceiverId] = useState("");
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const receiverOptions = [
        { value: "ALL", label: "모든 사용자" },
        { value: "ROLE", label: "역할별 사용자" },
        { value: "USER", label: "특정 사용자" },
    ];

    useEffect(() => {
        if (debouncedQuery && selectedReceiverType === "USER") {
            fetchUsers(debouncedQuery);
        }
    }, [debouncedQuery, selectedReceiverType]);

    /**
     * 사용자 검색 함수
     * @param {string} query - 검색어
     */
    // AdminMessageModal.jsx

    const fetchUsers = async (query) => {
        try {
            const response = await fetchWithAuth(`${API_URL}members/search?query=${query}`);
            if (response.ok) {
                const data = await response.json();
                const formattedUsers = Array.isArray(data) ? data.map(user => ({
                    id: user.id,
                    name: `${user.name} (${user.email}) - ID: ${user.id}`,
                    email: user.email
                })) : [];
                setUsers(formattedUsers);
            } else {
                console.error("🚨 사용자 검색 API 응답 실패:", response.status, response.statusText);
                setUsers([]);
            }
        } catch (error) {
            console.error("🚨 사용자 검색 실패:", error.message);
            setUsers([]);
        }
    };

    /**
     * 관리자 메시지 전송 함수
     */
    const handleSendAdminMessage = async () => {
        if (!messageContent) {
            dispatch(showSnackbar("❌ 메시지를 입력해주세요."));
            return;
        }

        if (!selectedReceiverType) {
            dispatch(showSnackbar("❌ 수신자 유형을 선택해주세요."));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}messages/admin/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverType: selectedReceiverType,
                    receiverId: selectedReceiverType === 'USER' ? Number(selectedReceiverId) : null,
                    content: messageContent,
                }),
            });

            if (response.ok) {
                dispatch(showSnackbar("✅ 관리자 메시지가 성공적으로 전송되었습니다."));
                onClose();
                setMessageContent("");
                setSelectedReceiverType("ALL");
                setSelectedReceiverId("");
                onSend();
            } else {
                dispatch(showSnackbar("❌ 관리자 메시지 전송 실패"));
            }
        } catch (error) {
            console.error("🚨 관리자 메시지 전송 실패:", error.message);
            dispatch(showSnackbar("❌ 관리자 메시지 전송 실패"));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>관리자 공지 보내기</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>수신자 유형</InputLabel>
                    <Select
                        value={selectedReceiverType}
                        onChange={(e) => {
                            setSelectedReceiverType(e.target.value);
                            setSelectedReceiverId(""); // Select value가 바뀌면 초기화
                        }}
                    >
                        {receiverOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedReceiverType === "USER" && (
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.name}`}
                        onChange={(event, value) => setSelectedReceiverId(value ? value.id : "")}
                        onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="특정 사용자 선택" fullWidth />}
                    />
                )}

                {selectedReceiverType === "ROLE" && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>역할 선택</InputLabel>
                        <Select
                            value={selectedReceiverId}
                            onChange={(e) => setSelectedReceiverId(e.target.value)}
                        >
                            <MenuItem value="USER">일반 사용자</MenuItem>
                            <MenuItem value="ADMIN">관리자</MenuItem>
                            <MenuItem value="CS_AGENT">상담원</MenuItem>
                        </Select>
                    </FormControl>
                )}

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="공지 내용"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
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
