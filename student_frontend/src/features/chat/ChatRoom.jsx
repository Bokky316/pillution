import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, TextField, Button, Paper, MenuItem, Select, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import useAuth from "@hook/useAuth";

const ChatRoom = () => {
    // 상태 변수 정의
    const [messages, setMessages] = useState([]); // 채팅 메시지 목록
    const [messageInput, setMessageInput] = useState(""); // 메시지 입력 필드 값
    const [isCounselorConnected, setIsCounselorConnected] = useState(false); // 상담사 연결 여부
    const [isChatClosed, setIsChatClosed] = useState(false); // 채팅 종료 여부
    const [topic, setTopic] = useState(""); // 상담 주제
    const { roomId } = useParams(); // URL 파라미터에서 채팅방 ID 가져오기
    const { user } = useAuth(); // 사용자 인증 정보 가져오기
    const stompClientRef = useRef(null); // Stomp 클라이언트 참조
    const isSubscribedRef = useRef(false); // Stomp 구독 여부 참조
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false); // 종료 확인 다이얼로그 상태

    // 상담 주제 옵션
    const topicOptions = {
        "PRODUCT_INQUIRY": "상품 문의",
        "ORDER_ISSUE": "주문 문제",
        "DELIVERY_TRACKING": "배송 조회",
        "OTHER": "기타"
    };

    // WebSocket 연결 설정 (useCallback으로 메모이제이션)
    const connectWebSocket = useCallback(() => {
        // 이미 연결되었거나 roomId가 없으면 연결하지 않음
        if (!roomId || stompClientRef.current) return;

        const socket = new SockJS(`${SERVER_URL}ws`); // SockJS를 사용하여 WebSocket 연결
        const client = new Client({
            webSocketFactory: () => socket, // WebSocket 팩토리 설정
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`), // 디버깅 메시지 출력
            reconnectDelay: 5000, // 재연결 시도 간격 (5초)
            connectHeaders: {
                userId: user?.id || "", // 연결 헤더에 사용자 ID 추가
            },
            onConnect: () => {
                console.log("📡 WebSocket 연결 성공!");
                if (!isSubscribedRef.current) {
                    // "/topic/chat/{roomId}"를 구독하여 메시지 수신
                    client.subscribe(`/topic/chat/${roomId}`, (message) => {
                        const data = JSON.parse(message.body); // 메시지 파싱
                        handleNewMessage(data); // 새 메시지 처리
                    });
                    isSubscribedRef.current = true; // 구독 상태로 설정
                }
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame.headers["message"]);
                console.error("Additional details:", frame.body);
            },
        });

        client.activate(); // 클라이언트 활성화
        stompClientRef.current = client; // 클라이언트 참조 저장

        return () => {
            if (client.connected) {
                client.deactivate(); // 연결 해제
                console.log("WebSocket disconnected");
                isSubscribedRef.current = false; // 구독 상태 초기화
            }
        };
    }, [roomId, user]); // roomId 또는 user가 변경될 때만 함수 재생성

    // 이전 메시지를 불러오는 함수 (useCallback으로 메모이제이션)
    const fetchPreviousMessages = useCallback(async () => {
        // roomId가 없으면 중단
        if (!roomId) {
            console.error("Room ID is missing");
            return;
        }
        try {
            // "/api/chat/rooms/{roomId}/messages" 엔드포인트로 GET 요청
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/messages`);
            if (response.ok) {
                const data = await response.json(); // 응답 데이터 파싱
                console.log("Fetched previous messages:", data); // 디버깅용 로그
                setMessages(data); // 메시지 목록 상태 업데이트
            } else {
                // 오류 응답에 대한 추가 정보 로깅
                console.error("Failed to fetch messages. Status:", response.status, "Text:", response.statusText);
                try {
                    // 응답이 JSON 형식이 아닐 경우를 대비하여 확인
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        console.error("Error Data:", errorData);
                    } else {
                        const errorText = await response.text();
                        console.error("Error Text:", errorText);
                    }
                } catch (e) {
                    console.error("Failed to parse error response:", e);
                }
            }
        } catch (error) {
            console.error("🚨 이전 메시지 로드 실패:", error.message);
        }
    }, [roomId]); // roomId가 변경될 때만 함수 재생성

     // 상담 종료 요청 (useCallback으로 메모이제이션)
    const handleCloseChat = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/close`, { method: "POST" });
            if (response.ok) {
                setIsChatClosed(true); // 채팅 종료 상태로 설정
                setIsCounselorConnected(false); // 상담사 연결 해제
                console.log("상담 종료 성공");
            } else {
                console.error("🚨 상담 종료 실패:", response.statusText);
                alert("상담 종료 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("🚨 상담 종료 실패:", error.message);
        }
    }, [roomId]);

    // WebSocket 메시지 처리
    const handleNewMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, data]); // 메시지 목록에 새 메시지 추가
        if (data.status === "IN_PROGRESS") {
            setIsCounselorConnected(true); // 상담사 연결 상태로 설정
            setIsChatClosed(false); // 채팅 종료 상태 해제
        } else if (data.status === "CLOSED") {
            setIsChatClosed(true); // 채팅 종료 상태로 설정
            setIsCounselorConnected(false); // 상담사 연결 해제
        }
    };

    // 메시지 전송
    const handleSendMessage = () => {
        if (!messageInput.trim() || !stompClientRef.current || !roomId) return;

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

    // 상담 상태 메시지 반환
    const getStatusMessage = () => {
        if (isChatClosed) return "상담이 종료되었습니다.";
        if (isCounselorConnected) return "상담사가 연결되었습니다.";
        return "상담사 연결 대기 중입니다...";
    };

    // 토픽 선택 핸들러
    const handleTopicChange = (event) => {
        setTopic(event.target.value);
    };

    // 초기 데이터 로드 및 WebSocket 연결 설정 (useEffect 훅 사용)
    useEffect(() => {

        // WebSocket 연결 (가장 먼저 실행)
        connectWebSocket();

        // 채팅방 상세 정보 가져오기 (useEffect 내부에 정의)
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

        fetchChatRoomDetails(); // 채팅방 상세 정보 가져오기
        fetchPreviousMessages(); // 이전 메시지 불러오기


        // 컴포넌트 언마운트 시 실행될 cleanup 함수 반환
        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate(); // 연결 해제
                stompClientRef.current = null; // 참조 해제
                console.log("WebSocket 연결 해제");
            }
        };
    }, [roomId, fetchPreviousMessages, connectWebSocket, handleCloseChat]);

    // 종료하기 버튼 클릭 핸들러
    const handleCloseClick = () => {
        setIsCloseDialogOpen(true); // 종료 확인 다이얼로그 표시
    };

    // 종료 확인 다이얼로그 닫기 핸들러
    const handleCloseDialogClose = () => {
        setIsCloseDialogOpen(false); // 종료 확인 다이얼로그 닫기
    };

    // 종료 확인 다이얼로그 종료 핸들러
    const handleCloseDialogConfirm = () => {
        handleCloseChat(); // 상담 종료 API 호출
        setIsCloseDialogOpen(false); // 종료 확인 다이얼로그 닫기
    };

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f5f5" }}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: "#4a4a4a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">
                    {topic ? `1:1 채팅 상담 - ${topicOptions[topic]}` : "1:1 채팅 상담"}
                </Typography>
                {!isChatClosed && (
                    <Button variant="contained" color="secondary" onClick={handleCloseClick}>
                        종료하기
                    </Button>
                )}
            </Paper>

            <Typography variant="body1" color={isChatClosed ? "error" : isCounselorConnected ? "primary" : "textSecondary"} sx={{ p: 2 }}>
                {getStatusMessage()}
            </Typography>

            {!topic && !isChatClosed && (
                <Box sx={{ p: 2 }}>
                    <Select
                        value={topic}
                        onChange={handleTopicChange}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="" disabled>상담 주제를 선택하세요</MenuItem>
                        {Object.entries(topicOptions).map(([key, value]) => (
                            <MenuItem key={key} value={key}>{value}</MenuItem>
                        ))}
                    </Select>
                </Box>
            )}

            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{ display: "flex", justifyContent: msg.senderId === user?.id ? "flex-end" : "flex-start", mb: 1 }}>
                        <Paper elevation={1} sx={{ p: 1, maxWidth: "70%", bgcolor: msg.senderId === user?.id ? "#dcf8c6" : "#ffffff" }}>
                            <Typography variant="body2">{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {!isChatClosed && topic && (
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
                        disabled={isChatClosed}
                    />
                    <Button
                        onClick={handleSendMessage}
                        variant="contained"
                        color="primary"
                        disabled={!messageInput.trim() || isChatClosed}
                    >
                        전송
                    </Button>
                </Paper>
            )}

            {/* 종료 확인 다이얼로그 */}
            <Dialog
                open={isCloseDialogOpen}
                onClose={handleCloseDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"상담 종료"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        상담을 종료하시겠습니까? 종료 후에는 메시지를 보낼 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogClose}>취소</Button>
                    <Button onClick={handleCloseDialogConfirm} autoFocus>
                        종료
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatRoom;
