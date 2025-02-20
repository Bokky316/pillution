import { DataGrid } from '@mui/x-data-grid';
import {
  Button, Snackbar, Alert, Card, CardContent, Box, Typography,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Paper, Chip, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import { API_URL } from "@/utils/constants";
import { useNavigate } from "react-router-dom";

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [searchInput, setSearchInput] = useState('');
    const [totalRows, setTotalRows] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembersData();
    }, [statusFilter, paginationModel]);

    const fetchMembersData = () => {
        setLoading(true);
        const { page, pageSize } = paginationModel;
        const statusQuery = statusFilter ? `&status=${statusFilter}` : '';

        if (!searchInput) {
            fetch(`${API_URL}members?page=${page}&size=${pageSize}${statusQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accToken")}`,
                },
                credentials: 'include',
            })
            .then((response) => response.json())
            .then((data) => {
                setMembers(data.dtoList || []);
                setTotalRows(data.total || 0);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setSnackbarMessage('회원 정보를 가져오는 데 실패했습니다.');
                setSnackbarOpen(true);
            })
            .finally(() => setLoading(false));
            return;
        }

        const encodedSearchInput = encodeURIComponent(searchInput);
        const searchQuery = `&searchType=${searchType}&keyword=${encodedSearchInput}`;

        fetch(`${API_URL}members?page=${page}&size=${pageSize}${statusQuery}${searchQuery}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("accToken")}`,
            },
            credentials: 'include',
        })
        .then((response) => response.json())
        .then((data) => {
            setMembers(data.dtoList || []);
            setTotalRows(data.total || 0);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            setSnackbarMessage('회원 정보를 가져오는 데 실패했습니다.');
            setSnackbarOpen(true);
        })
        .finally(() => setLoading(false));
    };

    const handleSearch = () => {
        setPaginationModel({ ...paginationModel, page: 0 });
        fetchMembersData();
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, minWidth: 50 },
        {
            field: 'name',
            headerName: '이름',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <Typography
                    sx={{
                        color: '#4169E1',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => navigate(`/adminpage/members/${params.row.id}/edit`)}
                >
                    {params.value}
                </Typography>
            )
        },
        { field: 'email', headerName: '이메일', flex: 1.5, minWidth: 180 },
        { field: 'birthDate', headerName: '생년월일', flex: 1, minWidth: 100 },
        { field: 'gender', headerName: '성별', flex: 0.5, minWidth: 60 },
        { field: 'phone', headerName: '휴대폰번호', flex: 1.2, minWidth: 120 },
        {
            field: 'activate',
            headerName: '활성상태',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <Chip
                    label={params.row.activate ? '활성회원' : '탈퇴회원'}
                    color={params.row.activate ? 'success' : 'error'}
                    size="small"
                    sx={{ width: '80px' }}
                />
            ),
        },
        {
            field: 'isSubscribing',
            headerName: '구독 여부',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <Chip
                    label={params.row.isSubscribing ? '구독 중' : '미구독'}
                    color={params.row.isSubscribing ? 'primary' : 'default'}
                    size="small"
                    sx={{ width: '80px' }}
                />
            ),
        },
        {
            field: 'edit',
            headerName: '관리',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: '#3f51b5',
                        color: '#3f51b5',
                        '&:hover': {
                            backgroundColor: 'rgba(63, 81, 181, 0.08)',
                            borderColor: '#3f51b5',
                        },
                    }}
                    onClick={() => navigate(`/adminpage/members/${params.row.id}/edit`)}
                >
                    수정
                </Button>
            ),
        },
    ];

    return (
        <Paper
            elevation={2}
            sx={{
                padding: '24px',
                backgroundColor: '#ffffff',
                width: '100%',
                maxWidth: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            {/* 헤더 섹션 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#1a237e', fontSize: 28 }} />
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            color: '#1a237e',
                        }}
                    >
                        회원 관리
                    </Typography>
                </Box>
                <Chip
                    label={`총 회원수: ${totalRows.toLocaleString()}명`}
                    color="primary"
                    sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#4169E1',
                        fontWeight: 500,
                        px: 1,
                    }}
                />
            </Box>

            {/* 필터 및 검색 카드 */}
            <Card
                variant="outlined"
                sx={{
                    mb: 3,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FilterListIcon sx={{ mr: 1, color: '#3f51b5' }}/>
                        <Typography variant="subtitle1" fontWeight={500}>필터 및 검색</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <FormControl
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <InputLabel>회원 상태</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="회원 상태"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="ACTIVE">활성회원</MenuItem>
                                <MenuItem value="DELETED">탈퇴회원</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <InputLabel>검색 유형</InputLabel>
                            <Select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                label="검색 유형"
                            >
                                <MenuItem value="name">이름</MenuItem>
                                <MenuItem value="email">이메일</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            variant="outlined"
                            size="small"
                            label="검색어"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                            sx={{ flex: 1 }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={handleSearch}
                                        edge="end"
                                        sx={{ color: '#3f51b5' }}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* 데이터 그리드 */}
            <DataGrid
                rows={members}
                columns={columns}
                rowCount={totalRows}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={loading}
                disableRowSelectionOnClick
                sx={{
                    borderRadius: '8px',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px 8px 0 0',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f9f9f9',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: '0 0 8px 8px'
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: '#fff'
                    },
                }}
            />

            {/* 스낵바 알림 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    sx={{
                        width: '100%',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default MemberList;