import React, { useState } from "react";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

/**
 * SentMessages 컴포넌트
 * 보낸 메시지 목록을 표시하는 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onOpenMessage - 메시지 상세 보기 함수
 * @returns {JSX.Element} SentMessages 컴포넌트
 */
const SentMessages = ({ onOpenMessage }) => {
    const sentMessages = useSelector(state => state.messages.sentMessages);
    const [sentMessageFilter, setSentMessageFilter] = useState("ALL");

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
        { field: "receiverName", headerName: "받는 사람", flex: 1 },
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

    const filteredSentMessages = sentMessages.filter(message => {
        if (sentMessageFilter === "ALL") return true;
        return message.receiverName.toLowerCase().includes(sentMessageFilter.toLowerCase());
    });

    return (
        <>
            <FormControl fullWidth margin="normal">
                <InputLabel>수신자 필터</InputLabel>
                <Select
                    value={sentMessageFilter}
                    onChange={(e) => setSentMessageFilter(e.target.value)}
                >
                    <MenuItem value="ALL">모든 수신자</MenuItem>
                    <MenuItem value="USER">일반 사용자</MenuItem>
                    <MenuItem value="ADMIN">관리자</MenuItem>
                    <MenuItem value="CS_AGENT">상담원</MenuItem>
                </Select>
            </FormControl>

            <DataGrid
                rows={filteredSentMessages}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                autoHeight
            />
        </>
    );
};

export default SentMessages;
