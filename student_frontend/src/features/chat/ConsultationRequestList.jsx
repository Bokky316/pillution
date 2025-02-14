import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL, SERVER_URL } from "@/constant";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ConsultationRequestList = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const stompClientRef = useRef(null); // WebSocket 클라이언트를 관리하기 위한 ref

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
    }, []);

    useEffect(() => {
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

    // DataGrid 컬럼 정의
    const columns = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "name", headerName: "채팅방 이름", flex: 2 },
        {
            field: "statusDisplay",
            headerName: "상태",
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    style={params.value === "대기중" ? { backgroundColor: "#4caf50", color: "white" } : {}}
                />
            ),
        },
        { field: "createdAt", headerName: "생성 날짜", flex: 2 },
    ];

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                상담 요청 목록
            </Typography>
            <DataGrid
                rows={chatRooms}
                columns={columns}
                pageSizeOptions={[5]}
                autoHeight
                loading={loading}
                getRowId={(row) => row.id}
                onRowClick={handleRowClick}
                sx={{
                    "& .MuiDataGrid-row": {
                        cursor: "pointer",
                    },
                }}
            />
        </Box>
    );
};

export default ConsultationRequestList;
