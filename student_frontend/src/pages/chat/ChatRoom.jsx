import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, List, ListItemButton, ListItemText, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { selectChatRoom, sendMessage, fetchChatRooms, createChatRoom, leaveChatRoom, addMessage } from '@/redux/chat/chatSlice';
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { showSnackbar } from "@/redux/snackbarSlice";
import useDebounce from "@hook/useDebounce";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ChatRoom = ({ onClose }) => {
    const dispatch = useDispatch();
    const { chatRooms, selectedRoom, messages } = useSelector(state => state.chat);
    const { user } = useSelector(state => state.auth);
    const [newMessage, setNewMessage] = useState('');
    const [openNewChatModal, setOpenNewChatModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState({});
    const [stompClient, setStompClient] = useState(null);

    // 채팅방 목록을 가져오는 useEffect
    useEffect(() => {
        dispatch(fetchChatRooms());
    }, [dispatch]);

    // 선택된 채팅방의 메시지를 가져오는 useEffect
    useEffect(() => {
        if (selectedRoom) {
            dispatch(selectChatRoom(selectedRoom));
        }
    }, [dispatch, selectedRoom]);

    // 메시지 목록이 업데이트될 때 스크롤을 맨 아래로 이동시키는 useEffect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 사용자 검색을 위한 useEffect
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchUsers(debouncedQuery);
        } else {
            setUsers([]);
        }
    }, [debouncedQuery]);

    // WebSocket 연결 설정을 위한 useEffect
    useEffect(() => {
        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('WebSocket 연결 성공');
            setStompClient(client);

            // 전체 채팅 메시지 구독
            client.subscribe('/topic/chat', (message) => {
                const receivedMessage = JSON.parse(message.body);
                dispatch(addMessage(receivedMessage));
            });

            // 개인 채팅 메시지 구독
            client.subscribe(`/topic/chat/${user.id}`, async (message) => {
                console.log("새로운 메시지 도착:", message.body);
                const parsedMessage = JSON.parse(message.body);
                dispatch(addMessage(parsedMessage));
                await fetchMessages(user.id, dispatch);
            });

            // 타이핑 상태 구독
            client.subscribe('/topic/chat.typing', (message) => {
                const typingInfo = JSON.parse(message.body);
                if (typingInfo.senderId !== user.id) {
                    setIsTyping(prev => ({
                        ...prev,
                        [typingInfo.roomId]: typingInfo.senderId
                    }));
                    setTimeout(() => {
                        setIsTyping(prev => {
                            const newState = { ...prev };
                            delete newState[typingInfo.roomId];
                            return newState;
                        });
                    }, 3000);
                }
            });
        }, (error) => {
            console.error('WebSocket 연결 오류:', error);
        });

        return () => {
            if (client.connected) {
                client.disconnect();
            }
        };
    }, [dispatch, user.id]);

    // 사용자 검색 함수
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

    // 메시지 전송 함수
    const handleSendMessage = () => {
        if (newMessage.trim() && selectedRoom && stompClient) {
            const message = {
                roomId: selectedRoom,
                senderId: user.id,
                content: newMessage
            };
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
            setNewMessage('');
        } else {
            dispatch(showSnackbar("채팅방을 선택해주세요."));
        }
    };

    // 새 채팅방 생성 함수
    const handleCreateNewChat = async () => {
        if (!selectedUser) {
            dispatch(showSnackbar("❌ 대화 상대를 선택해주세요."));
            return;
        }
        try {
            await dispatch(createChatRoom({
                name: `${user.name}, ${selectedUser.name}`,
                participantIds: [user.id, selectedUser.id]
            })).unwrap();

            setOpenNewChatModal(false);
            setSelectedUser(null);
            dispatch(showSnackbar("✅ 새로운 채팅방이 생성되었습니다."));
        } catch (error) {
            console.error("🚨 채팅방 생성 실패:", error.message);
            dispatch(showSnackbar("❌ 채팅방 생성에 실패했습니다."));
        }
    };

    // 채팅방 나가기 함수
    const handleLeaveChatRoom = async (roomId) => {
        try {
            await dispatch(leaveChatRoom(roomId)).unwrap();
            dispatch(showSnackbar("✅ 채팅방에서 나갔습니다."));
        } catch (error) {
            console.error('채팅방 나가기 오류:', error);
            dispatch(showSnackbar("❌ 채팅방 나가기에 실패했습니다."));
        }
    };

    // 타이핑 상태 전송 함수
    const handleTyping = (roomId) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/chat.typing", {}, JSON.stringify({
                roomId: roomId,
                senderId: user.id,
                typing: true
            }));
        }
    };

    return (
        <Dialog onClose={onClose} open={true} maxWidth="md" fullWidth>
            <DialogTitle>채팅</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', height: 400, p: 0 }}>
                <Box sx={{ width: '30%', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenNewChatModal(true)}
                        sx={{ mb: 1 }}
                    >
                        새 채팅 시작
                    </Button>
                    {chatRooms.map(room => (
                        <ListItemButton
                            key={room.id}
                            selected={selectedRoom === room.id}
                            onClick={() => dispatch(selectChatRoom(room.id))}
                        >
                            <ListItemText primary={room.name} />
                            {selectedRoom === room.id && (
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeaveChatRoom(room.id);
                                }}>
                                    <CloseIcon />
                                </IconButton>
                            )}
                        </ListItemButton>
                    ))}
                </Box>
                <Box sx={{ width: '70%', p: 2, display: 'flex', flexDirection: 'column' }}>
                    {selectedRoom ? (
                        <>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1 }}>
                                {messages.map(message => (
                                    <Box key={message.id} sx={{mb: 1}}>
                                        <Typography variant="subtitle2">{message.senderName}</Typography>
                                        <Typography>{message.content}</Typography>
                                        <Typography variant="caption">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                ))}
                                <div ref={messagesEndRef} />
                            </Box>
                            {isTyping[selectedRoom] && (
                                <Typography variant="subtitle2" color="textSecondary">
                                    {isTyping[selectedRoom]}님이 입력 중입니다...
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    placeholder="메시지를 입력하세요."
                                    variant="outlined"
                                    size="small"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping(selectedRoom);
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 1 }}>
                                    보내기
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Typography variant="subtitle1">채팅방을 선택해주세요.</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
            {/* New Chat Modal */}
            <Dialog open={openNewChatModal} onClose={() => setOpenNewChatModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>새 채팅 시작</DialogTitle>
                <DialogContent>
                    <TextField
                        label="사용자 검색"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {users.length > 0 && (
                        <List>
                            {users.map(user => (
                                <ListItemButton key={user.id} onClick={() => setSelectedUser(user)}>
                                    <ListItemText primary={user.name} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewChatModal(false)}>취소</Button>
                    <Button variant="contained" color="primary" onClick={handleCreateNewChat}>
                        채팅 시작
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default ChatRoom;
