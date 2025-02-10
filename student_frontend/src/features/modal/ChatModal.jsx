import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function ChatModal({ open, onClose, chatRoom }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!chatRoom) return;

        fetchChatMessages();
        connectWebSocket();

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [chatRoom]);

    const fetchChatMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/messages/${chatRoom.id}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("🚨 채팅 메시지 로드 실패:", error.message);
        }
    };

    const connectWebSocket = () => {
        const socket = new SockJS(`${API_URL}ws`);
        const stomp = Stomp.over(socket);

        stomp.connect({}, () => {
            stomp.subscribe(`/topic/chat/${chatRoom.id}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
        });

        setStompClient(stomp);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !stompClient) return;

        const message = {
            chatRoomId: chatRoom.id,
            content: messageInput,
        };

        stompClient.send("/app/chat/send", {}, JSON.stringify(message));
        setMessageInput("");
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{chatRoom?.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ height: 300, overflowY: "auto", mb: 2 }}>
                    {messages.map((msg, index) => (
                        <Typography key={index} sx={{ mb: 1 }}>
                            {msg.content}
                        </Typography>
                    ))}
                </Box>
                <TextField
                    fullWidth
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSendMessage} color="primary">
                    전송
                </Button>
                <Button onClick={onClose} color="secondary">
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
}
