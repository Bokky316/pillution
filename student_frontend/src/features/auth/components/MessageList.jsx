import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Autocomplete } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/constant";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import "./MessageList.css";
import { showSnackbar } from "@/redux/snackbarSlice";
import useWebSocket from "@hook/useWebSocket";
import useDebounce from "@hook/useDebounce";
import { setMessages, markMessageAsRead } from "@/redux/messageSlice";

export default function MessagesList() {
    const { user } = useSelector((state) => state.auth); // Redux에서 사용자 정보 가져오기, 슬라이스 이름이 auth  가져오기
    const dispatch = useDispatch();
    const messages = useSelector(state => state.messages.messages);  // ✅ Redux에서 메시지 가져오기
    const unreadCount = useSelector(state => state.messages.unreadMessages.length);  // ✅ 읽지 않은 메시지 수 Redux에서 가져오기
    const [openSendMessageModal, setOpenSendMessageModal] = useState(false);    // ✅ 메시지 보내기 모달 상태(모달을 띄우고, 닫는 상태)
    const [messageContent, setMessageContent] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300); // 사용자 검색을 위한 디바운스
    const [openReplyModal, setOpenReplyModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    useWebSocket(user); // ✅ 웹소켓 연결 (setMessages 불필요, Redux가 관리)

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

    // 사용자 검색 API 호출, 메시지 전송 모달에서 사용자 검색
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

    const fetchMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setMessages(data));  // ✅ Redux 상태 업데이트
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

            fetchMessages(); // ✅ 즉시 메시지 목록 갱신[미적용?]
        } catch (error) {
            console.error("🚨 메시지 전송 실패:", error.message);
        }
    };

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

            setOpenReplyModal(false);
            setReplyContent("");
            dispatch(showSnackbar("✅ 답장이 전송되었습니다."));

            fetchMessages(); // ✅ 즉시 메시지 목록 갱신[미적용?]
        } catch (error) {
            console.error("🚨 메시지 응답 실패:", error.message);
        }
    };

    const handleOpenMessage = async (message) => {
        setSelectedMessage(message); // ✅ 특정 메시지가 선택되면 그걸 상태로 저장해서 모달에 표시
        setOpenReplyModal(true); // ✅ 답장 모달 열기

        if (!message.read) {    // ✅ 읽지 않은 메시지인 경우
            await fetchWithAuth(`${API_URL}messages/read/${message.id}`, { method: "POST" });

            // ✅ Redux에서 메시지를 읽음 처리
            dispatch(markMessageAsRead(message.id));
        }
    };

    // ✅ DataGrid 행 스타일 동적 적용
    const getRowClassName = (params) => {
        return params.row.read ? "read-message" : "unread-message"; // ✅ 읽지 않은 메시지는 강조
    };

    // ✅ DataGrid 컬럼에서 메시지 클릭 시 `handleOpenMessage` 실행
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
    ];

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="center" width="100%" mb={2}>
                <Typography variant="h4" gutterBottom>
                    받은 메시지 ({unreadCount})
                </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" width="100%" mb={1}>
                <Button variant="contained" color="primary" onClick={() => {
                    console.log("🟢 [메시지 보내기] 버튼 클릭됨!");

                    setOpenSendMessageModal(true)
                    }
                }>
                    메시지 보내기
                </Button>
            </Box>

            <DataGrid
                rows={messages}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                autoHeight
                getRowClassName={getRowClassName}
            />

            {/* ✅ 메시지 보기 및 답장 모달 */}
            <Dialog open={openReplyModal} onClose={() => setOpenReplyModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>메시지 내용</DialogTitle>
                <DialogContent>
                    <Typography>{selectedMessage?.content}</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="답장"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReplyModal(false)}>취소</Button>
                    <Button onClick={handleReply} color="primary">보내기</Button>
                </DialogActions>
            </Dialog>

            {/* ✅ 메시지 보내기 모달 */}
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
        </div>
    );
}
