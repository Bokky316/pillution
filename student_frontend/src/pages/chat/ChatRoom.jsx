import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, List, ListItemButton, ListItemText, Typography, Autocomplete, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { selectChatRoom, sendMessage, fetchChatRooms, createChatRoom, leaveChatRoom } from '@/redux/chat/chatSlice';
import { API_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { showSnackbar } from "@/redux/snackbarSlice";
import useDebounce from "@hook/useDebounce";
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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

    useEffect(() => {
        dispatch(fetchChatRooms());
    }, [dispatch]);

    useEffect(() => {
        if (selectedRoom) {
            dispatch(selectChatRoom(selectedRoom));
        }
    }, [dispatch, selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchUsers(debouncedQuery);
        } else {
            setUsers([]);
        }
    }, [debouncedQuery]);

    // WebSocket 연결 설정
    useEffect(() => {
        const socket = new SockJS(`${API_URL}ws`);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('WebSocket 연결 성공');
            setStompClient(client);

            if (selectedRoom) {
                subscribeTyping(client, selectedRoom);
            }
        }, (error) => {
            console.error('WebSocket 연결 오류:', error);
        });

        return () => {
            if (client) {
                client.disconnect(() => {
                    console.log('WebSocket 연결 해제');
                });
            }
        };
    }, [selectedRoom]);

    useEffect(() => {
        if (stompClient) {
            stompClient.unsubscribe(`/topic/chat.typing`);
            subscribeTyping(stompClient, selectedRoom);
        }
    }, [selectedRoom, stompClient]);

    const subscribeTyping = (client, roomId) => {
        if (roomId) {
            client.subscribe(`/topic/chat.typing`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                if (receivedMessage.senderId !== user.id) {
                    setIsTyping(prev => ({
                        ...prev,
                        [roomId]: receivedMessage.senderId
                    }));
                }
                setTimeout(() => {
                    setIsTyping(prev => {
                        const newState = { ...prev };
                        delete newState[roomId];
                        return newState;
                    });
                }, 3000);
            });
        }
    };

    const sendTyping = (roomId) => {
        if (stompClient) {
            const message = {
                roomId: roomId,
                senderId: user.id,
                typing: true
            };
            stompClient.send("/app/chat.typing", {}, JSON.stringify(message));
        }
    };

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

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedRoom) {
            dispatch(sendMessage({
                roomId: selectedRoom,
                content: newMessage
            }));
            setNewMessage('');
        } else {
            dispatch(showSnackbar("❌ 채팅방을 선택해주세요."));
        }
    };

    const handleCreateNewChat = async () => {
        if (!selectedUser) {
            dispatch(showSnackbar("❌ 대화 상대를 선택해주세요."));
            return;
        }
        try {
            await dispatch(createChatRoom({
                name: `${user.name}, ${selectedUser.name}`,
                participantIds: [selectedUser.id]
            })).unwrap();

            setOpenNewChatModal(false);
            setSelectedUser(null);
            dispatch(showSnackbar("✅ 새로운 채팅방이 생성되었습니다."));
        } catch (error) {
            console.error("🚨 채팅방 생성 실패:", error.message);
            dispatch(showSnackbar("❌ 채팅방 생성에 실패했습니다."));
        }
    };

    const handleLeaveChatRoom = async (roomId) => {
        try {
            await dispatch(leaveChatRoom(roomId)).unwrap();
            dispatch(showSnackbar("✅ 채팅방에서 나갔습니다."));
        } catch (error) {
            console.error('채팅방 나가기 오류:', error);
            dispatch(showSnackbar("❌ 채팅방 나가기에 실패했습니다."));
        }
    };

    const handleTyping = (roomId) => {
        sendTyping(roomId);
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
                                        <Typography variant="caption">{new Date(message.timestamp).toLocaleTimeString()}</Typography>
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
