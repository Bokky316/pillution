import React, { useState } from "react";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Button } from "@mui/material";

/**
 * ReceivedMessages 컴포넌트
 * 받은 메시지 목록을 표시하는 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onOpenMessage - 메시지 상세 보기 함수
 * @returns {JSX.Element} ReceivedMessages 컴포넌트
 */
const ReceivedMessages = ({ onOpenMessage }) => {
    const messages = useSelector(state => state.messages.messages);
    const [searchTerm, setSearchTerm] = useState("");

    const columns = [
        {
            field: "content",
            headerName: "메시지 내용",
            flex: 3,
            renderCell: (params) => (
                <Button color="primary" onClick={() => onOpenMessage(params.row)}>
                    {params.value.slice(0, 30) + "..."}
                </Button>
            ),
        },
        { field: "senderName", headerName: "보낸 사람", flex: 1 },
        {
            field: "regTime",
            headerName: "보낸 날짜",
            flex: 2,
            renderCell: (params) =>
                new Date(params.value).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }).replace(/\. /g, "-").replace(" ", " "),
        },
        {
            field: "isNotice",
            headerName: "공지여부",
            flex: 1,
            renderCell: (params) => params.value ? "공지" : "-"
        }
    ];

    const filteredMessages = messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <TextField
                label="메시지 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="normal"
            />

            <DataGrid
                rows={filteredMessages}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                autoHeight
                getRowClassName={(params) => params.row.read ? "read-message" : "unread-message"}
            />
        </>
    );
};

export default ReceivedMessages;
