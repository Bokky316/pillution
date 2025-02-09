import React, { useState, useEffect, useRef } from 'react';
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
    wordBreak: 'break-word', // 긴 텍스트 줄바꿈 처리
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
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isTyping, setIsTyping] = useState({});
    const [stompClient, setStompClient] = useState(null);

    const messagesEndRef = useRef(null);
    const debouncedQuery = useDebounce(searchQuery, 500);

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
        if (!selectedRoom) return; // selectedRoom이 없으면 연결하지 않음

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = Stomp.over(socket);

        client.connect({},
            () => {
                setStompClient(client);
                console.log('WebSocket 연결 성공');

                // 채팅방 메시지 구독
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

                // 타이핑 상태 구독
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

                return () => {
                    if (chatSubscription) chatSubscription.unsubscribe();
                    if (typingSubscription) typingSubscription.unsubscribe();
                    if (client.connected) client.disconnect();
                };
            },
            (error) => {
                console.error("WebSocket 연결 오류:", error);
                dispatch(showSnackbar("❌ WebSocket 연결에 실패했습니다."));
            }
        );

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [selectedRoom, user.id, dispatch]);


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

 // 메시지 전송 함수
 const handleSendMessage = () => {
     if (newMessage.trim() && selectedRoom && stompClient) {
         const message = {
             roomId: selectedRoom,
             senderId: user.id,
             content: newMessage
         };

         // Redux store에 메시지 추가 (즉시 UI 업데이트)
         dispatch(addMessage(message));
         setNewMessage(''); // 입력 필드 초기화

         // WebSocket을 통해 서버로 메시지 전송
         stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
     } else {
         // 채팅방이 선택되지 않았을 때 알림
         dispatch(showSnackbar("채팅방을 선택해주세요."));
     }
 };

 // 새 채팅방 생성 함수
 const handleCreateNewChat = async () => {
     if (!selectedUser) {
         dispatch(showSnackbar("대화 상대를 선택해주세요."));
         return;
     }
     try {
         // Redux thunk를 사용하여 채팅방 생성 요청
         await dispatch(createChatRoom({
             name: `${user.name}, ${selectedUser.name}`,
             participantIds: [user.id, selectedUser.id]
         })).unwrap();

         setOpenNewChatModal(false); // 모달 닫기
         setSelectedUser(null); // 선택된 사용자 초기화
         dispatch(showSnackbar("새로운 채팅방이 생성되었습니다."));
     } catch (error) {
         console.error("채팅방 생성 실패:", error.message);
         dispatch(showSnackbar("채팅방 생성에 실패했습니다."));
     }
 };

 // 채팅방 나가기 함수
 const handleLeaveChatRoom = async (roomId) => {
     try {
         // Redux thunk를 사용하여 채팅방 나가기 요청
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
         // 타이핑 시작 상태 전송
         stompClient.send("/app/chat.typing", {}, JSON.stringify({
             roomId: roomId,
             senderId: user.id,
             typing: true
         }));

         // 3초 후에 타이핑 종료 상태 전송
         setTimeout(() => {
             stompClient.send("/app/chat.typing", {}, JSON.stringify({
                 roomId: roomId,
                 senderId: user.id,
                 typing: false
             }));
         }, 3000);
     }
 };

 // 특정 채팅방의 읽지 않은 메시지 수를 가져오는 함수
 const fetchUnreadCount = async (roomId) => {
     try {
         const response = await fetchWithAuth(`${API_URL}chat/unread-count?roomId=${roomId}`);
         if (response.ok) {
             const count = await response.json();
             setUnreadCounts(prev => ({ ...prev, [roomId]: count }));
         } else {
             console.error("읽지 않은 메시지 수 조회 실패");
         }
     } catch (error) {
         console.error("읽지 않은 메시지 수 조회 실패:", error);
     }
 };

 // 모든 채팅방에 대해 읽지 않은 메시지 수를 가져오는 함수
 const fetchUnreadCounts = () => {
     chatRooms.forEach(room => {
         fetchUnreadCount(room.id);
     });
 };

    useEffect(() => {
        // 컴포넌트가 마운트될 때와 채팅방 목록이 변경될 때 읽지 않은 메시지 수를 가져옴
        fetchUnreadCounts();
    }, [chatRooms]);

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
                                {unreadCounts[room.id] > 0 && (
                                    <Badge badgeContent={unreadCounts[room.id]} color="primary">
                                        <Typography variant="caption" color="white">{unreadCounts[room.id]}</Typography>
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
                                    {Array.isArray(messages) && messages.map(message => {
                                        if (!message) return null; // 메시지가 null이면 렌더링하지 않음
                                        const isCurrentUser = message.senderId === user.id;
                                        return (
                                            <Box
                                                key={message.id}
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
                            생성
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        );
    }
;

export default ChatRoom;
