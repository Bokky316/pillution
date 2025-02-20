import React, { useState, useEffect, useRef } from "react";
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL, SERVER_URL } from "@/utils/constants";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/**
 * 상담 요청 목록을 표시하는 컴포넌트
 * @component
 */
const ConsultationRequestList = () => {
    // 기존 상태 관리 코드 유지
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const stompClientRef = useRef(null);

    // 채팅방 목록 가져오기
    const fetchChatRooms = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/all`);
            if (response.ok) {
                const data = await response.json();
                setChatRooms(data.map(room => ({
                    ...room,
                    statusDisplay: getStatusDisplay(room.status),
                })));
            }
        } catch (error) {
            console.error("🚨 채팅방 목록 조회 실패:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // WebSocket 연결 설정
    const connectWebSocket = () => {
        if (stompClientRef.current) {
            console.log("WebSocket 이미 연결됨");
            return;
        }

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("📡 WebSocket 연결 성공!");
                chatRooms.forEach(room => {
                    client.subscribe(`/topic/chat/${room.id}`, (message) => {
                        const data = JSON.parse(message.body);
                        console.log(`Received message for room ${room.id}:`, data);
                        updateChatRoomStatus(data.chatRoomId, data.content);
                    });
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame);
            },
        });

        client.activate();
        stompClientRef.current = client; // WebSocket 클라이언트를 ref에 저장
    };

    // 채팅방 상태 업데이트
    const updateChatRoomStatus = (roomId, status) => {
        console.log(`Updating status for room ${roomId} to ${status}`);
        setChatRooms(prevRooms =>
            prevRooms.map(room =>
                room.id === roomId ? { ...room, status, statusDisplay: getStatusDisplay(status) } : room
            )
        );
    };

    // 상태 표시 텍스트 변환
    const getStatusDisplay = (status) => {
        switch (status) {
            case "PENDING":
                return "대기중";
            case "IN_PROGRESS":
                return "진행중";
            case "CLOSED":
                return "종료";
            default:
                return status;
        }
    };

    // 상태 표시 색상 변환
    const getStatusColor = (status) => {
        switch (status) {
            case "대기중":
                return "success";
            case "진행중":
                return "primary";
            case "종료":
                return "error";
            default:
                return "default";
        }
    };

    // 상담 수락 요청
    const acceptConsultation = async (roomId) => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/accept`, {
                method: "POST",
            });
            if (response.ok) {
                console.log("상담이 수락되었습니다.");
                return true;
            } else {
                console.error("상담 수락 실패");
                return false;
            }
        } catch (error) {
            console.error("🚨 상담 수락 중 오류 발생:", error.message);
            return false;
        }
    };

    /// 행 클릭 핸들러
    const handleRowClick = async (params) => {
        const roomId = params.id;
        const status = params.row.statusDisplay;

        switch (status) {
            case "대기중":
                const accepted = await acceptConsultation(roomId);
                if (accepted) {
                    navigate(`/chatroom/${roomId}`);
                } else {
                    alert("상담 수락에 실패했습니다. 다시 시도해주세요.");
                }
                break;
            case "진행중":
            case "종료":
                navigate(`/chatroom/${roomId}`);
                break;
            default:
                console.error("알 수 없는 상태:", status);
                alert("알 수 없는 상태입니다. 관리자에게 문의하세요.");
        }
    };

    // 컴포넌트 마운트 시 데이터 및 WebSocket 연결 설정
    useEffect(() => {
        fetchChatRooms();
        if (chatRooms.length > 0) {
            connectWebSocket();
        }

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                console.log("WebSocket 연결 해제");
            }
        };
    }, [chatRooms]);

    /**
     * 상태에 따른 배경색 반환
     * @param {string} status - 상담 상태
     * @returns {string} - 배경색 CSS 값
     */
    const getStatusBackgroundColor = (status) => {
        switch (status) {
            case "대기중":
                return "#e9efff";  // 연한 파란색
            case "진행중":
                return "#f5f5f5";  // 연한 회색
            case "종료":
                return "#FFE6E0";  // 연한 빨간색
            default:
                return "white";
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            {/* 상단 필터 영역 */}
            <Box sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    상담시간: 2022.12.11 ~ 2023.06.09
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        ml: 'auto',
                        backgroundColor: '#4169E1', // 포인트 색상 적용
                        color: 'white', // 텍스트 색상 설정 (선택 사항)
                    }}
                >
                    검색
                </Button>
            </Box>

            {/* 테이블 컨테이너 */}
            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>채팅 ID</TableCell>
                            <TableCell>일임시간</TableCell>
                            <TableCell>담당자</TableCell>
                            <TableCell>유저명</TableCell>
                            <TableCell>상태</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chatRooms.map((room) => (
                            <TableRow
                                key={room.id}
                                onClick={() => handleRowClick({ id: room.id, row: room })}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: getStatusBackgroundColor(room.statusDisplay),
                                    '&:hover': {
                                        backgroundColor: '#fafafa',
                                    }
                                }}
                            >
                                <TableCell>{room.id}</TableCell>
                                <TableCell>{room.createdAt}</TableCell>
                                <TableCell>{room.manager || '-'}</TableCell>
                                <TableCell>{room.userName || '-'}</TableCell>
                                <TableCell>{room.statusDisplay}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 페이지네이션 영역 */}
            <Box sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2
            }}>
                <Typography variant="body2">
                    10/page
                </Typography>
            </Box>
        </Box>
    );
};

export default ConsultationRequestList;
