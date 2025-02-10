import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, TextField, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import useAuth from "@hook/useAuth";

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isCounselorConnected, setIsCounselorConnected] = useState(false);
    const [isChatClosed, setIsChatClosed] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const { roomId } = useParams();
    const { user } = useAuth();
    const stompClientRef = useRef(null);

    // WebSocket 연결 설정
    const connectWebSocket = () => {
        if (!roomId) {
            console.error("🚨 WebSocket 연결 실패: roomId가 없습니다.");
            return;
        }

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`),
            reconnectDelay: 5000,
            connectHeaders: {
                userId: user?.id || "",
            },
            onConnect: () => {
                console.log("📡 WebSocket 연결 성공!");
                client.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    handleNewMessage(data);
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame.headers['message']);
                console.error("Additional details:", frame.body);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.connected) {
                client.deactivate();
                console.log("WebSocket disconnected");
            }
        };
    };

    // WebSocket 메시지 처리
    const handleNewMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        if (data.status === "IN_PROGRESS") {
            setIsCounselorConnected(true);
            setIsChatClosed(false);
        } else if (data.status === "CLOSED") {
            setIsChatClosed(true);
            setIsCounselorConnected(false);
        }
    };

    // 메시지 전송
    const handleSendMessage = () => {
        if (!messageInput.trim() || !stompClientRef.current || !roomId) {
            console.error("🚨 메시지를 전송할 수 없습니다. roomId 또는 messageInput이 비어있습니다.");
            return;
        }

        stompClientRef.current.publish({
            destination: "/app/chat/send",
            body: JSON.stringify({
                chatRoomId: roomId,
                content: messageInput,
                senderId: user?.id || null,
                sentAt: new Date().toISOString(),
                isSystemMessage: false,
                isRead: false,
            }),
        });
        setMessageInput("");
    };

    // 초기 데이터 로드 및 WebSocket 연결 설정
    useEffect(() => {
        const fetchChatRoomDetails = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}chat/rooms/details/${roomId}`);
                if (response.ok) {
                    const data = await response.json();

                    // 초기 상담 상태 설정
                    if (data.status === "IN_PROGRESS") {
                        setIsCounselorConnected(true);
                        setIsChatClosed(false);
                    } else if (data.status === "CLOSED") {
                        setIsChatClosed(true);
                        setIsCounselorConnected(false);
                    }
                }
            } catch (error) {
                console.error("🚨 채팅방 정보 로드 실패:", error.message);
            }
        };

        fetchChatRoomDetails();
        connectWebSocket();

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                console.log("WebSocket 연결 해제");
            }
        };
    }, [roomId]);

    // 상담 상태 메시지 반환
    const getStatusMessage = () => {
        if (isChatClosed) return "상담이 종료되었습니다.";
        if (isCounselorConnected) return "상담사가 연결되었습니다.";
        return "상담사 연결 대기 중입니다...";
    };

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f5f5" }}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: "#4a4a4a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">1:1 채팅 상담</Typography>
                {!isChatClosed && (
                    <Button variant="contained" color="secondary" onClick={() => alert("종료하기 버튼 클릭됨")}>
                        종료하기
                    </Button>
                )}
            </Paper>

            {/* 상담 상태 메시지 */}
            <Typography variant="body1" color={isChatClosed ? "error" : isCounselorConnected ? "primary" : "textSecondary"} sx={{ p: 2 }}>
                {getStatusMessage()}
            </Typography>

            {/* 채팅 내용 */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{ display: "flex", justifyContent: msg.senderId === user?.id ? "flex-end" : "flex-start", mb: 1 }}>
                        <Paper elevation={1} sx={{ p: 1, maxWidth: "70%", bgcolor: msg.senderId === user?.id ? "#dcf8c6" : "#ffffff" }}>
                            <Typography variant="body2">{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {/* 메시지 입력 */}
            {!isChatClosed && (
                <Paper elevation={3} sx={{ p: 2, display: "flex", alignItems: "center" }}>
                    <TextField
                        fullWidth
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="메시지를 입력하세요"
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    <Button onClick={handleSendMessage} variant="contained" color="primary" disabled={!messageInput.trim()}>
                        전송
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

export default ChatRoom;
