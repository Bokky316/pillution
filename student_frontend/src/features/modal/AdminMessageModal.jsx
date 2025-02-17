import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [receiverType, setReceiverType] = useState("ALL");
    const receiverOptions = [
        { value: 'ALL', label: '모든 사용자' },
        { value: 'ROLE', label: '역할별 사용자' },
        { value: 'USER', label: '특정 사용자' }
    ];

    useEffect(() => {
        if (debouncedQuery && receiverType === 'USER') {
            fetchUsers(debouncedQuery);
        }
    }, [debouncedQuery, receiverType]);

    /**
     * 사용자 검색 함수
     * @param {string} query - 검색어
     */
    const fetchUsers = async (query) => {
        try {
            const response = await fetchWithAuth(`${API_URL}members/search?query=${query}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            } else {
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
        if ((!selectedUser && receiverType !== 'ALL') || !messageContent) {
            dispatch(showSnackbar("❌ 수신자와 메시지를 입력해주세요."));
            return;
        }
        try {
            await fetchWithAuth(`${API_URL}messages/admin/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverType: receiverType,
                    receiverId: receiverType === 'ALL' ? '0' : selectedUser?.id || selectedUser,
                    content: messageContent,
                    isNotice: true
                }),
            });
            onClose();
            setMessageContent("");
            setSelectedUser(null);
            dispatch(showSnackbar("✅ 관리자 메시지가 성공적으로 전송되었습니다."));
            onSend();
        } catch (error) {
            console.error("🚨 관리자 메시지 전송 실패:", error.message);
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
                            setSelectedUser(null);
                        }}
                    >
                        {receiverOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {receiverType === 'USER' && (
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.name} (${option.email}) - ID: ${option.id}`}
                        onChange={(event, value) => setSelectedUser(value)}
                        onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="받는 사람 (이름, 이메일 또는 ID로 검색)" fullWidth />}
                    />
                )}

                {receiverType === 'ROLE' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>역할 선택</InputLabel>
                        <Select
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value)}
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
