/*
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    IconButton,
    Badge
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { selectChatRoom, sendMessage, fetchChatRooms, createChatRoom, leaveChatRoom, addMessage } from '@/redux/chat/chatSlice';
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { showSnackbar } from "@/redux/snackbarSlice";
import useDebounce from "@hook/useDebounce";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { styled } from '@mui/system';
import { debounce } from 'lodash';

// 메시지 스타일 컴포넌트
const MessageItem = styled('div')(({ isCurrentUser }) => ({
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '8px',
    backgroundColor: isCurrentUser ? '#DCF8C6' : '#FFFFFF',
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
    wordBreak: 'break-word',
}));

const ChatRoom = ({ onClose }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const chatRooms = useSelector(state => state.chat.chatRooms);
    const selectedRoom = useSelector(state => state.chat.selectedRoom);
    const messages = useSelector(state => state.chat.messages);
    const unreadCounts = useSelector(state => state.chat.unreadCount);

    const [newMessage, setNewMessage] = useState('');
    const [openNewChatModal, setOpenNewChatModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isTyping, setIsTyping] = useState({});
    const [stompClient, setStompClient] = useState(null);
    const [localUnreadCounts, setLocalUnreadCounts] = useState({}); // 로컬 상태로 관리

    const messagesEndRef = useRef(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        dispatch(fetchChatRooms(user.id));
    }, [dispatch, user.id]);

    useEffect(() => {
        if (selectedRoom) {
            dispatch(selectChatRoom(selectedRoom));
            fetchUnreadCount(selectedRoom);
        }
    }, [dispatch, selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!selectedRoom) return;

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = Stomp.over(socket);

        const connectToWebSocket = () => {
            client.connect({},
                () => {
                    setStompClient(client);
                    console.log('WebSocket 연결 성공');

                    const chatSubscription = client.subscribe(`/topic/chat/${selectedRoom}`, (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        if (parsedMessage.senderId !== user.id) {
                            dispatch(addMessage(parsedMessage));
                            fetchUnreadCounts();
                            if (Notification.permission === 'granted' && document.hidden) {
                                new Notification('새 메시지가 도착했습니다', {
                                    body: parsedMessage.content,
                                    icon: '/path/to/icon.png'
                                });
                            }
                        } else {
                            dispatch(addMessage(parsedMessage));
                        }
                        dispatch(fetchChatRooms(user.id));
                        dispatch(selectChatRoom(selectedRoom));
                    });

                    const typingSubscription = client.subscribe(`/topic/chat/${selectedRoom}/typing`, (message) => {
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

                    client.onDisconnect = () => {
                        console.log('WebSocket 연결 끊김, 재연결 시도...');
                        setTimeout(connectToWebSocket, 5000);
                    };

                    return () => {
                        if (chatSubscription) chatSubscription.unsubscribe();
                        if (typingSubscription) typingSubscription.unsubscribe();
                        if (client.connected) client.disconnect();
                    };
                },
                (error) => {
                    console.error("WebSocket 연결 오류:", error);
                    dispatch(showSnackbar("❌ WebSocket 연결에 실패했습니다."));
                    setTimeout(connectToWebSocket, 5000);
                }
            );
        };

        connectToWebSocket();

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [selectedRoom, user.id, dispatch]);

   useEffect(() => {
       if (debouncedSearchQuery) {
           searchUsers(debouncedSearchQuery);
       } else {
           setSearchResults([]);
       }
   }, [debouncedSearchQuery]);

    const searchUsers = async (query) => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/users/search?name=${query}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                console.error("사용자 검색 실패");
                dispatch(showSnackbar("사용자 검색에 실패했습니다."));
            }
        } catch (error) {
            console.error("사용자 검색 오류:", error);
            dispatch(showSnackbar("사용자 검색 중 오류가 발생했습니다."));
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedRoom && stompClient) {
            const message = {
                roomId: selectedRoom,
                senderId: user.id,
                content: newMessage
            };

            dispatch(addMessage(message));
            setNewMessage('');

            try {
                stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
                console.log("메시지 전송 성공:", message);
            } catch (error) {
                console.error("메시지 전송 실패:", error);
                dispatch(showSnackbar("메시지 전송에 실패했습니다."));
            }
        } else {
            dispatch(showSnackbar("채팅방을 선택해주세요."));
        }
    };


    const handleCreateNewChat = async () => {
         if (!selectedUser) {
             dispatch(showSnackbar("대화 상대를 선택해주세요."));
             return;
         }
         try {
             const chatRoomDto = {
                 name: `${user.name}, ${selectedUser.name}`,
                 user1Id: user.id,
                 user2Id: selectedUser.id
             };

             const response = await fetchWithAuth(`${API_URL}chat/rooms`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify(chatRoomDto)
             });

             if (!response.ok) {
                 throw new Error('채팅방 생성 실패');
             }

             const createdRoom = await response.json();
             dispatch(createChatRoom(createdRoom));

             setOpenNewChatModal(false);
             setSelectedUser(null);
             dispatch(showSnackbar("새로운 채팅방이 생성되었습니다."));
         } catch (error) {
             console.error("채팅방 생성 실패:", error.message);
             dispatch(showSnackbar("채팅방 생성에 실패했습니다."));
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

    const sendTypingStatus = useCallback(
        debounce((roomId, typing) => {
            if (stompClient && stompClient.connected) {
                stompClient.send("/app/chat.typing", {}, JSON.stringify({
                    roomId: roomId,
                    senderId: user.id,
                    typing: typing
                }));
            }
        }, 1000),
        [stompClient, user.id]
    );

    const handleTyping = (roomId) => {
        sendTypingStatus(roomId, true);
    };

    const fetchUnreadCount = async (roomId) => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/unread-count?roomId=${roomId}`);
            if (response.ok) {
                const count = await response.json();
                setLocalUnreadCounts(prev => ({ ...prev, [roomId]: count })); // 로컬 상태 업데이트
            } else {
                console.error("읽지 않은 메시지 수 조회 실패");
                dispatch(showSnackbar("❌ 읽지 않은 메시지 수 조회에 실패했습니다."));
            }
        } catch (error) {
            console.error("읽지 않은 메시지 수 조회 실패:", error);
            dispatch(showSnackbar("❌ 읽지 않은 메시지 수 조회에 실패했습니다."));
        }
    };

    const fetchUnreadCounts = useCallback(() => {
        chatRooms.forEach(room => {
            fetchUnreadCount(room.id);
        });
    }, [chatRooms, fetchUnreadCount]);

    useEffect(() => {
        fetchUnreadCounts();
    }, [chatRooms, fetchUnreadCounts]);

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
                            key={room.id} // key prop 추가
                            selected={selectedRoom === room.id}
                            onClick={() => dispatch(selectChatRoom(room.id))}
                        >
                            <ListItemText primary={room.name} />
                            {localUnreadCounts[room.id] > 0 && ( // 로컬 상태 사용
                                <Badge badgeContent={localUnreadCounts[room.id]} color="primary">
                                    <Typography variant="caption" color="white">{localUnreadCounts[room.id]}</Typography>
                                </Badge>
                            )}
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
                                {Array.isArray(messages) && messages.map((message, index) => { // key prop 추가
                                    if (!message) return null;
                                    const isCurrentUser = message.senderId === user.id;
                                    return (
                                        <Box
                                            key={message.id || index}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                                                mb: 1,
                                            }}
                                        >
                                            <MessageItem isCurrentUser={isCurrentUser}>
                                                <Typography variant="body2">{message.content}</Typography>
                                            </MessageItem>
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </Box>
                                    );
                                })}
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

            { */
/* 새 채팅 시작 모달 *//*
}
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
                    {searchResults.length > 0 && (
                        <List>
                            {searchResults.map(user => (
                                <ListItemButton
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <ListItemText primary={user.name} secondary={user.email} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewChatModal(false)}>취소</Button>
                    <Button onClick={handleCreateNewChat} color="primary" disabled={!selectedUser}>
                        새 채팅 시작
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default ChatRoom;
 */
