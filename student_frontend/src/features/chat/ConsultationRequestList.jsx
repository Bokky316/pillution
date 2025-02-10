import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Typography, Box } from "@mui/material";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

const ConsultationRequestList = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChatRooms = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/all`);
            if (response.ok) {
                const data = await response.json();
                setChatRooms(data);
            }
        } catch (error) {
            console.error("🚨 채팅방 목록 조회 실패:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>상담 요청 목록</Typography>
            <DataGrid
                rows={chatRooms}
                columns={[
                    { field: "id", headerName: "ID", flex: 1 },
                    { field: "name", headerName: "채팅방 이름", flex: 2 },
                    { field: "status", headerName: "상태", flex: 1 },
                    { field: "createdAt", headerName: "생성 날짜", flex: 2 },
                ]}
                pageSizeOptions={[5]}
                autoHeight
                loading={loading}
                getRowId={(row) => row.id}
            />
        </Box>
    );
};

export default ConsultationRequestList;
