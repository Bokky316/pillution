import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Autocomplete } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "../../constant";
import { fetchWithAuth } from "../../common/fetchWithAuth";
import { showSnackbar } from "../../redux/snackbarSlice";
import useDebounce from "../../hooks/useDebounce";
import ChatModal from "../modal/ChatModal";
import "./ChatRoomList.css";
/**
 목록 컴포넌트
  * - 채팅방 목록을 조회하고, 새 채팅방을 만들 수 있음
  * - 채팅방 목록은 DataGrid 컴포넌트로 표시
  * - 조회된 채팅방의 "입장" 버튼을 클릭하면 ChatModal 컴포넌트가 열림
 */
export default function ChatRoomList() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [chatRooms, setChatRooms] = useState([]);
    const [openNewChatModal, setOpenNewChatModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [chatRoomName, setChatRoomName] = useState(""); // ✅ 채팅방 이름 추가
    const [openChatModal, setOpenChatModal] = useState(false);
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);

    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (user) {
            fetchChatRooms();
        }
        if (debouncedQuery.length >= 2) {
            fetchUsers(debouncedQuery);
        } else {
            setUsers([]);
        }
    }, [user, debouncedQuery]);

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

    const fetchChatRooms = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setChatRooms(data);
            }
        } catch (error) {
            console.error("🚨 채팅방 목록 조회 실패:", error.message);
        }
    };

    const refreshChatRooms = () => {
        fetchChatRooms();
        dispatch(showSnackbar("🔄 채팅방 목록이 업데이트되었습니다."));
    };

    // ✅ 채팅방 생성 요청
    const handleCreateChatRoom = async () => {
        if (!chatRoomName.trim() || !selectedUser) {
            dispatch(showSnackbar("❌ 채팅방 이름과 초대할 사용자를 선택하세요."));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: chatRoomName,
                    ownerId: user.id,
                    inviteeId: selectedUser.id,
                }),
            });

            if (response.ok) {
                setOpenNewChatModal(false);
                setChatRoomName("");
                setSelectedUser(null);
                fetchChatRooms(); // ✅ 채팅방 목록 갱신
                dispatch(showSnackbar("✅ 새로운 채팅방이 생성되었습니다."));
            }
        } catch (error) {
            console.error("🚨 채팅방 생성 실패:", error.message);
        }
    };

    const handleEnterChatRoom = (chatRoom) => {
        setSelectedChatRoom(chatRoom);
        setOpenChatModal(true);
    };

    const columns = [
        { field: "name", headerName: "채팅방", flex: 2 },
        { field: "createdAt", headerName: "개설일자", flex: 1 },
        { field: "ownerName", headerName: "방장", flex: 1 },
        { field: "status", headerName: "상태", flex: 1 },
        {
            field: "actions",
            headerName: "액션",
            flex: 1,
            renderCell: (params) => (
                <Button color="primary" onClick={() => handleEnterChatRoom(params.row)}>
                    입장
                </Button>
            ),
        },
    ];

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="space-between" width="100%" mb={2}>
                <Typography variant="h4">채팅방 목록</Typography>
                <Button variant="contained" color="warning" onClick={refreshChatRooms} startIcon={<RefreshIcon />}>
                    새로고침
                </Button>
                <Button variant="contained" color="primary" onClick={() => setOpenNewChatModal(true)}>
                    새 채팅방
                </Button>
            </Box>

            <DataGrid rows={chatRooms} columns={columns} pageSizeOptions={[5, 10, 20]} autoHeight disableRowSelectionOnClick getRowId={(row) => row.id} />

            <ChatModal open={openChatModal} onClose={() => setOpenChatModal(false)} chatRoom={selectedChatRoom} />

            {/* ✅ 채팅방 생성 모달 */}
            <Dialog open={openNewChatModal} onClose={() => setOpenNewChatModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>새 채팅방 만들기</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="채팅방 이름"
                        value={chatRoomName}
                        onChange={(e) => setChatRoomName(e.target.value)}
                        margin="normal"
                    />
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => setSelectedUser(value)}
                        onInputChange={(event, newInputValue) => fetchUsers(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="초대할 사용자" fullWidth />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewChatModal(false)}>취소</Button>
                    <Button onClick={handleCreateChatRoom} color="primary">
                        생성하기
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
