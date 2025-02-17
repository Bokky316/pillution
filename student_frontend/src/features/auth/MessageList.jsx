import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Box,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import "@/styles/MessageList.css";
import { showSnackbar } from "@/store/snackbarSlice";
import useWebSocket from "@/hooks/useWebSocket";
import useDebounce from "@/hooks/useDebounce";
import { setMessages, markMessageAsRead } from "@/store/messageSlice";

/**
 * 메시지 목록 컴포넌트
 * - 사용자의 메시지 목록을 표시하고, 메시지 전송, 답장 기능을 제공합니다.
 * - 관리자 권한이 있는 경우, 관리자 공지 전송 기능도 제공합니다.
 * @returns {JSX.Element} 메시지 목록 컴포넌트
 */
export default function MessagesList() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const messages = useSelector(state => state.messages.messages);
    const unreadCount = useSelector(state => state.messages.unreadMessages.length);

    const [openSendMessageModal, setOpenSendMessageModal] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [openMessageDetailModal, setOpenMessageDetailModal] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    useWebSocket(user);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
        if (debouncedQuery.length >= 2) {
            fetchUsers(debouncedQuery);
        } else {
            setUsers([]);
        }
    }, [user, debouncedQuery]);

    /**
     * 사용자 검색 API 호출
     * @param {string} query 검색어
     */
    const fetchUsers = async (query) => {
        if (!query) return;
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
     * 메시지 목록 조회 API 호출
     */
    const fetchMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setMessages(data));
            }
        } catch (error) {
            console.error("🚨 메시지 목록 조회 실패:", error.message);
        }
    };

    /**
     * 메시지 전송 함수
     */
    const handleSendMessage = async () => {
        if (!selectedUser || !messageContent) {
            dispatch(showSnackbar("❌ 수신자와 메시지를 입력해주세요."));
            return;
        }
        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: selectedUser.id,
                    content: messageContent,
                }),
            });
            setOpenSendMessageModal(false);
            setMessageContent("");
            setSelectedUser(null);
            dispatch(showSnackbar("✅ 메시지가 성공적으로 전송되었습니다."));
            fetchMessages();
        } catch (error) {
            console.error("🚨 메시지 전송 실패:", error.message);
        }
    };

    /**
     * 메시지 열기 함수
     * @param {Object} message 선택한 메시지 객체
     */
    const handleOpenMessage = async (message) => {
        setSelectedMessage(message);
        setOpenMessageDetailModal(true);
        if (!message.read) {
            await fetchWithAuth(`${API_URL}messages/read/${message.id}`, { method: "POST" });
            dispatch(markMessageAsRead(message.id));
        }
    };

    /**
     * 답장 전송 함수 (관리자 전용)
     */
    const handleReply = async () => {
        if (!selectedMessage || !replyContent) return;

        try {
            await fetchWithAuth(`${API_URL}messages/send`, {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: selectedMessage.senderId,
                    content: replyContent,
                }),
            });

            setOpenMessageDetailModal(false);
            setReplyContent("");
            dispatch(showSnackbar("✅ 답장이 전송되었습니다."));

            fetchMessages();
        } catch (error) {
            console.error("🚨 답장 전송 실패:", error.message);
        }
    };

    /**
     * DataGrid 행 스타일 동적 적용
     * @param {Object} params DataGrid 행 파라미터
     * @returns {string} 행 스타일 클래스 이름
     */
    const getRowClassName = (params) => {
        return params.row.read ? "read-message" : "unread-message";
    };

    /**
     * DataGrid 컬럼 정의
     */
    const columns = [
        {
            field: "content",
            headerName: "메시지 내용",
            flex: 3,
            renderCell: (params) => (
                <Button color="primary" onClick={() => handleOpenMessage(params.row)}>
                    {params.value.slice(0, 30) + "..."}
                </Button>
            ),
        },
        { field: "senderName", headerName: "보낸 사람", flex: 1 },
        {
            field: "regTime",
            headerName: "보낸 날짜",
            flex: 2,
            renderCell: (params) =>
                new Date(params.value).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }).replace(/\. /g, "-").replace(" ", " "),
        },
        {
            field: "isNotice",
            headerName: "공지여부",
            flex: 1,
            renderCell: (params) => params.value ? "공지" : "-"
        }
    ];

    /**
     * 관리자 권한 확인
     */
    const isAdmin = user && user.authorities && user.authorities.some(auth => auth.authority === 'ROLE_ADMIN');

    /**
     * 관리자 메시지 전송 관련 상태
     */
    const [openAdminMessageModal, setOpenAdminMessageModal] = useState(false);
    const [adminMessageContent, setAdminMessageContent] = useState("");
    const [selectedReceivers, setSelectedReceivers] = useState([]);

    /**
     * 수신자 옵션 정의
     */
    const receiverOptions = [
        { value: 'all', label: '모든 사용자' },
        { value: 'user', label: '일반 사용자' },
        { value: 'marketing', label: '마케팅 알림 동의 사용자' }
    ];

    /**
     * 관리자 메시지 전송 모달 열기
     */
    const handleOpenAdminMessageModal = () => {
        setOpenAdminMessageModal(true);
    };

    /**
     * 관리자 메시지 전송 모달 닫기
     */
    const handleCloseAdminMessageModal = () => {
        setOpenAdminMessageModal(false);
        setAdminMessageContent("");
        setSelectedReceivers([]);
    };

    /**
     * 관리자 메시지 전송
     */
    const handleSendAdminMessage = async () => {
        if (!adminMessageContent) {
            dispatch(showSnackbar("메시지를 입력해주세요."));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}messages/admin/send`, {
                method: "POST",
                body: JSON.stringify({
                    content: adminMessageContent,
                    receiverId: 0  // 전체 사용자에게 전송
                }),
            });

            if (response.ok) {
                dispatch(showSnackbar("관리자 메시지가 성공적으로 전송되었습니다."));
                handleCloseAdminMessageModal();
                fetchMessages();
            } else {
                dispatch(showSnackbar("관리자 메시지 전송 실패"));
            }
        } catch (error) {
            console.error("관리자 메시지 전송 실패:", error.message);
            dispatch(showSnackbar("관리자 메시지 전송 실패"));
        }
    };

    /**
     * 메시지 필터링
     */
    const filteredMessages = messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="center" width="100%" mb={2}>
                <Typography variant="h4" gutterBottom>
                    받은 메시지 ({unreadCount})
                </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" width="100%" mb={1}>
                <Button variant="contained" color="primary" onClick={() => setOpenSendMessageModal(true)}>
                    메시지 보내기
                </Button>

                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleOpenAdminMessageModal}
                        style={{ marginLeft: "10px" }}
                    >
                        관리자 공지 보내기
                    </Button>
                )}
            </Box>

            <TextField
                label="메시지 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="normal"
            />

            <DataGrid
                rows={filteredMessages}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                autoHeight
                getRowClassName={getRowClassName}
            />

            {/* 메시지 상세 보기 모달 */}
            <Dialog open={openMessageDetailModal} onClose={() => setOpenMessageDetailModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>메시지 내용</DialogTitle>
                <DialogContent>
                    <Typography>{selectedMessage?.content}</Typography>
                    {/* 관리자 권한이 있는 경우에만 답장 기능을 활성화 */}
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
                    <Button onClick={() => setOpenMessageDetailModal(false)}>닫기</Button>
                    {/* 관리자 권한이 있는 경우에만 답장 버튼을 활성화 */}
                    {isAdmin && (
                        <Button onClick={handleReply} color="primary">답장</Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* 메시지 보내기 모달 */}
            <Dialog open={openSendMessageModal} onClose={() => setOpenSendMessageModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>메시지 보내기</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => setSelectedUser(value)}
                        onInputChange={(event, newInputValue) => fetchUsers(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="받는 사람" fullWidth />}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="메시지 내용"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSendMessageModal(false)}>취소</Button>
                    <Button onClick={handleSendMessage} color="primary">보내기</Button>
                </DialogActions>
            </Dialog>

            {/* 관리자 공지 보내기 모달 */}
            <Dialog open={openAdminMessageModal} onClose={handleCloseAdminMessageModal} fullWidth maxWidth="sm">
                <DialogTitle>관리자 공지 보내기</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>수신자 선택</InputLabel>
                        <Select
                            multiple
                            value={selectedReceivers}
                            onChange={(e) => setSelectedReceivers(e.target.value)}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {receiverOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Checkbox checked={selectedReceivers.indexOf(option.value) > -1} />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                    <Button onClick={handleCloseAdminMessageModal}>취소</Button>
                    <Button onClick={handleSendAdminMessage} color="primary">보내기</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
