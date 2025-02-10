import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { fetchWithAuth } from "../../common/fetchWithAuth";
import { API_URL, SERVER_URL } from "../../constant";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function ChatModal({ open, onClose, chatRoom }) {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!chatRoom) return;

        fetchChatMessages();

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log("🔍 WebSocket Debug:", str),

            onConnect: () => {
                console.log("📡 WebSocket 연결됨 - 채팅방 ID:", chatRoom.id);

                client.subscribe(`/topic/chat/${chatRoom.id}`, (message) => {
                    console.log("📨 새로운 메시지 도착!", message.body);
                    const receivedMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMessage]);
                    scrollToBottom();
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [chatRoom]);

    const fetchChatMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/messages/${chatRoom.id}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error("🚨 채팅 메시지 로드 실패:", error.message);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;

        const newMessage = {
            chatRoomId: chatRoom.id,
            senderId: user.id,
            content: messageInput,
        };

        try {
            const response = await fetchWithAuth(`${API_URL}chat/send`, {
                method: "POST",
                body: JSON.stringify(newMessage),
            });

            if (response.ok) {
                setMessageInput("");
            }
        } catch (error) {
            console.error("🚨 메시지 전송 실패:", error.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{chatRoom?.name} 채팅</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        height: "300px",
                        overflowY: "auto",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {messages.map((msg, index) => (
                        <Typography
                            key={index}
                            sx={{
                                padding: "5px 10px",
                                backgroundColor: msg.senderId === user.id ? "#DCF8C6" : "#FFF",
                                alignSelf: msg.senderId === user.id ? "flex-end" : "flex-start",
                                borderRadius: "5px",
                                marginBottom: "5px",
                            }}
                        >
                            {msg.content}
                        </Typography>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
            </DialogContent>
            <DialogActions>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="메시지를 입력하세요..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    sx={{ marginBottom: "10px" }}
                />
                <Button color="primary" onClick={handleSendMessage}>
                    전송
                </Button>
                <Button color="secondary" onClick={onClose}>
                    취소
                </Button>
            </DialogActions>
        </Dialog>
    );
}
