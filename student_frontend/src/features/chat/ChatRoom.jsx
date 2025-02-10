import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem } from "@mui/material";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_URL } from "@/constant";

const ChatRoom = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [topic, setTopic] = useState(""); // 선택된 주제
    const [stompClient, setStompClient] = useState(null);
    const [isCounselorRequested, setIsCounselorRequested] = useState(false);

    useEffect(() => {
        const socket = new SockJS(`${API_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            },
        });

        client.activate();
        setStompClient(client);

        return () => client.deactivate();
    }, [roomId]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !stompClient) return;

        stompClient.send("/app/chat/send", {}, JSON.stringify({
            chatRoomId: roomId,
            content: messageInput,
        }));

        setMessageInput("");
    };

    const handleTopicSelection = async (selectedTopic) => {
        setTopic(selectedTopic);

        // 자동 응답 메시지 출력
        let autoResponse;
        switch (selectedTopic) {
            case "DELIVERY_TRACKING":
                autoResponse = "배송 조회는 여기를 클릭하세요: [배송 조회 링크]";
                break;
            case "FAQ":
                autoResponse = "자주 묻는 질문은 여기를 참고하세요: [FAQ 링크]";
                break;
            default:
                autoResponse = "상담사를 연결하려면 '상담사 연결하기' 버튼을 눌러주세요.";
        }

        setMessages((prevMessages) => [...prevMessages, { sender: "system", content: autoResponse }]);
    };

    const handleRequestCounselor = async () => {
        try {
            await fetchWithAuth(`${API_URL}chat/rooms/request-counselor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId }),
            });
            setIsCounselorRequested(true);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "system", content: "상담사가 요청되었습니다. 잠시만 기다려주세요." },
            ]);
        } catch (error) {
            console.error("🚨 상담사 요청 실패:", error.message);
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>채팅방</Typography>

            {/* 주제 선택 */}
            {!topic && (
                <Box sx={{ mb: 2 }}>
                    <Typography>상담 주제를 선택해주세요:</Typography>
                    <TextField
                        select
                        fullWidth
                        label="상담 주제"
                        value={topic}
                        onChange={(e) => handleTopicSelection(e.target.value)}
                        margin="normal"
                    >
                        <MenuItem value="DELIVERY_TRACKING">배송 조회</MenuItem>
                        <MenuItem value="FAQ">FAQ</MenuItem>
                        <MenuItem value="ORDER_ISSUE">주문 문제</MenuItem>
                        <MenuItem value="OTHER">기타</MenuItem>
                    </TextField>
                </Box>
            )}

            {/* 메시지 목록 */}
            <Box sx={{ height: 300, overflowY: "auto", mb: 2 }}>
                {messages.map((msg, index) => (
                    <Typography key={index}>{msg.content}</Typography>
                ))}
            </Box>

            {/* 상담사 연결 버튼 */}
            {!isCounselorRequested && topic && (
                <Button variant="contained" color="secondary" onClick={handleRequestCounselor}>
                    상담사 연결하기
                </Button>
            )}

            {/* 메시지 입력 */}
            <TextField
                fullWidth
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="메시지를 입력하세요"
            />
        </Box>
    );
};

export default ChatRoom;
