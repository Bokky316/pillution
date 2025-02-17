import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { fetchSentMessages } from "@/store/messageSlice";

const SentMessages = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const sentMessages = useSelector((state) => state.messages.sentMessages);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      dispatch(fetchSentMessages(user.id));
    }
  }, [dispatch, user]);

  const columns = [
    { field: 'receiverName', headerName: '수신자', flex: 1 },
    { field: 'content', headerName: '내용', flex: 2 },
    {
      field: 'regTime',
      headerName: '전송 시간',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'isNotice',
      headerName: '공지 여부',
      flex: 1,
      valueFormatter: (params) => params.value ? '공지' : '일반'
    },
  ];

  const filteredMessages = sentMessages.filter(message => {
    if (filter === "ALL") return true;
    if (filter === "NOTICE") return message.isNotice;
    if (filter === "NORMAL") return !message.isNotice;
    return message.receiverName.toLowerCase().includes(filter.toLowerCase());
  }).filter(message =>
    message.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <FormControl fullWidth margin="normal">
        <InputLabel>필터</InputLabel>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="ALL">전체</MenuItem>
          <MenuItem value="NOTICE">공지</MenuItem>
          <MenuItem value="NORMAL">일반</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        margin="normal"
        label="검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <DataGrid
        rows={filteredMessages}
        columns={columns}
        pageSize={10}
        autoHeight
      />
    </div>
  );
};

export default SentMessages;
