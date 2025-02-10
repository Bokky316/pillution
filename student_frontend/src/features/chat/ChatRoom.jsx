import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { showSnackbar } from "@/redux/snackbarSlice";

export default function ConsultationRequestList() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [consultationRequests, setConsultationRequests] = useState([]); // 상담 요청 목록
    const [openNewRequestModal, setOpenNewRequestModal] = useState(false); // 새 상담 요청 모달
    const [preMessage, setPreMessage] = useState(""); // 사전 메시지
    const [topic, setTopic] = useState("OTHER"); // 상담 주제

    // 상담 요청 목록 가져오기
    const fetchConsultationRequests = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}consultation/requests/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setConsultationRequests(data);
            }
        } catch (error) {
            console.error("🚨 상담 요청 목록 조회 실패:", error.message);
        }
    };

    // 새로고침 함수
    const refreshConsultationRequests = () => {
        fetchConsultationRequests();
        dispatch(showSnackbar("🔄 상담 요청 목록이 업데이트되었습니다."));
    };

    // 새 상담 요청 생성
    const handleCreateConsultationRequest = async () => {
        if (!preMessage.trim()) {
            dispatch(showSnackbar("❌ 사전 메시지를 입력하세요."));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}consultation/requests/create`, {
                method: "POST",
                body: JSON.stringify({
                    customerId: user.id,
                    topic,
                    preMessage,
                }),
            });

            if (response.ok) {
                setOpenNewRequestModal(false);
                setPreMessage("");
                setTopic("OTHER");
                fetchConsultationRequests();
                dispatch(showSnackbar("✅ 새로운 상담 요청이 생성되었습니다."));
            }
        } catch (error) {
            console.error("🚨 상담 요청 생성 실패:", error.message);
        }
    };

    // 컴포넌트 로드 시 데이터 가져오기
    useEffect(() => {
        if (user) {
            fetchConsultationRequests();
        }
    }, [user]);

    // DataGrid 컬럼 정의
    const columns = [
        { field: "topic", headerName: "주제", flex: 2 },
        { field: "preMessage", headerName: "사전 메시지", flex: 3 },
        { field: "status", headerName: "상태", flex: 1 },
        {
            field: "actions",
            headerName: "액션",
            flex: 1,
            renderCell: (params) => (
                <Button color="primary">
                    상세 보기
                </Button>
            ),
        },
    ];

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="space-between" width="100%" mb={2}>
                <Typography variant="h4">상담 요청 목록</Typography>
                <Button variant="contained" color="warning" onClick={refreshConsultationRequests} startIcon={<RefreshIcon />}>
                    새로고침
                </Button>
                <Button variant="contained" color="primary" onClick={() => setOpenNewRequestModal(true)}>
                    새 상담 요청
                </Button>
            </Box>

            <DataGrid rows={consultationRequests} columns={columns} pageSizeOptions={[5, 10, 20]} autoHeight disableRowSelectionOnClick getRowId={(row) => row.id} />

            {/* 새 상담 요청 생성 모달 */}
            <Dialog open={openNewRequestModal} onClose={() => setOpenNewRequestModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>새 상담 요청</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="사전 메시지"
                        value={preMessage}
                        onChange={(e) => setPreMessage(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="주제"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewRequestModal(false)}>취소</Button>
                    <Button onClick={handleCreateConsultationRequest} color="primary">
                        생성하기
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
