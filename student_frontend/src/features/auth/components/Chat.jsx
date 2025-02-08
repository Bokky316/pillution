import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Fab, Autocomplete } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { API_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { setChatRooms, setSelectedRoom, setMessages, addMessage } from '@/redux/chatSlice';
import { showSnackbar } from "@/redux/snackbarSlice";
import useDebounce from '@hook/useDebounce';


/**
 * Chat 컴포넌트
 * 실시간 채팅 기능을 제공하는 컴포넌트입니다.
 */
const Chat = () => {
    const [open, setOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { chatRooms, selectedRoom, messages } = useSelector((state) => state.chat);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const { stompClient } = useContext(WebSocketContext);

    useEffect(() => {
        if (user) {
            fetchChatRooms();
        }
    }, [user]);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchUsers(debouncedQuery);
        } else {
            setUsers([]);
        }
    }, [debouncedQuery]);

    /**
     * 사용자 검색 API를 호출하는 함수
     * @param {string} query - 검색어
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
            console.error("사용자 검색 실패:", error.message);
            setUsers([]);
        }
    };

    /**
     * 채팅방 목록을 가져오는 함수
     */
    const fetchChatRooms = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setChatRooms(data));
            }
        } catch (error) {
            console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
            dispatch(showSnackbar("채팅방 목록을 가져오는데 실패했습니다."));
        }
    };

    /**
     * 특정 채팅방을 선택하는 함수
     * @param {number} roomId - 선택한 채팅방 ID
     */
    const selectRoom = async (roomId) => {
        dispatch(setSelectedRoom(roomId));
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setMessages(data));
            }
        } catch (error) {
            console.error('채팅 메시지를 가져오는데 실패했습니다:', error);
            dispatch(showSnackbar("채팅 메시지를 가져오는데 실패했습니다."));
        }
    };

    /**
     * 메시지를 전송하는 함수
     */
    const sendMessage = () => {
        if (!stompClient || !stompClient.connected) {
            console.error("WebSocket 연결이 없습니다.");
            dispatch(showSnackbar("메시지 전송에 실패했습니다. 연결을 확인해주세요."));
            return;
        }

        if (selectedRoom && user && inputMessage) {
            const chatMessage = {
                roomId: selectedRoom,
                senderId: user.id,
                content: inputMessage
            };
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            setInputMessage("");
        } else {
            console.error("채팅방 ID, 사용자 ID 또는 메시지 내용이 없습니다.");
            dispatch(showSnackbar("메시지 전송에 실패했습니다."));
        }
    };

    /**
     * 새로운 채팅방을 생성하는 함수
     */
    const createNewChatRoom = async () => {
        if (!selectedUser) {
            dispatch(showSnackbar("채팅 상대를 선택해주세요."));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: `Chat with ${selectedUser.name}`, participantIds: [user.id, selectedUser.id] })
            });
            if (response.ok) {
                const newRoom = await response.json();
                dispatch(setChatRooms([...chatRooms, newRoom]));
                selectRoom(newRoom.id);
                dispatch(showSnackbar("새 채팅방이 생성되었습니다."));
            } else {
                const errorData = await response.json();
                console.error('새 채팅방 생성 실패:', errorData);
                dispatch(showSnackbar(`새 채팅방 생성에 실패했습니다: ${errorData.message || '알 수 없는 오류'}`));
            }
        } catch (error) {
            console.error('새 채팅방 생성 실패:', error.message);
            dispatch(showSnackbar("새 채팅방 생성에 실패했습니다."));
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSearchChange = (event, newInputValue) => {
        setSearchQuery(newInputValue);
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="chat"
                style={{ position: 'fixed', bottom: 20, right: 20 }}
                onClick={() => setOpen(true)}
            >
                <ChatIcon />
            </Fab>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>실시간 채팅</DialogTitle>
                <DialogContent style={{ display: 'flex', height: '500px', padding: 0 }}>
                    <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
                        <Autocomplete
                            options={users}
                            getOptionLabel={(option) => option.name}
                            onChange={(event, value) => setSelectedUser(value)}
                            onInputChange={handleSearchChange}
                            renderInput={(params) => <TextField {...params} label="사용자 검색" fullWidth />}
                            style={{ margin: '10px' }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={createNewChatRoom}
                            style={{ margin: '10px' }}
                        >
                            새 채팅방 생성
                        </Button>
                        <List style={{ overflowY: 'auto', height: 'calc(100% - 120px)' }}>
                            {chatRooms.map(room => (
                                <ListItem
                                    button
                                    key={room.id}
                                    onClick={() => selectRoom(room.id)}
                                    selected={selectedRoom === room.id}
                                >
                                    <ListItemText primary={room.name} />
                                </ListItem>
                            ))}
                        </List>
                    </div>
                    <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
                            {messages.map((msg, index) => (
                                <div key={index} style={{ marginBottom: '10px' }}>
                                    <strong>{msg.senderName}: </strong>
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div style={{ display: 'flex', padding: '10px' }}>
                            <TextField
                                fullWidth
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                variant="outlined"
                                size="small"
                            />
                            <Button
                                variant="contained"
                                onClick={sendMessage}
                                style={{ marginLeft: '10px' }}
                            >
                                전송
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Chat;
