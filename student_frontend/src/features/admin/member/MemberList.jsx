import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';
import { API_URL } from "../../../constant";
import { useNavigate } from "react-router-dom";
import './MemberList.css';

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchType, setSearchType] = useState('name'); // 검색 분류 (기본값: 이름)
    const [searchInput, setSearchInput] = useState(''); // 검색 입력값
    const [totalRows, setTotalRows] = useState(0); // 총 회원 수
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembersData();
    }, [statusFilter, paginationModel]); //


    const fetchMembersData = () => {
        const { page, pageSize } = paginationModel;
        const statusQuery = statusFilter ? `&status=${statusFilter}` : '';
        // 검색어가 비어있으면 검색 API 호출 안함
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
            });
            return; // 검색어가 없으면 여기서 종료
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
        });
    };


    // 검색 버튼 클릭 또는 엔터 키 입력 시 호출
    const handleSearch = () => {
        setPaginationModel({ ...paginationModel, page: 0 }); // 검색 시 첫 페이지로 이동
        fetchMembersData();
    };

      const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const changeMemberStatus = (memberId, status) => {
        fetch(`${API_URL}members/${memberId}/status?status=${status}`, {
            method: 'PATCH',
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    fetchMembersData();
                    setSnackbarMessage('회원 상태가 변경되었습니다.');
                    setSnackbarOpen(true);
                }
            })
            .catch((error) => console.error(error));
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'name', headerName: '이름', flex: 2 },
        { field: 'email', headerName: '이메일', flex: 2 },
        { field: 'birthDate', headerName: '생년월일', flex: 2 },
        { field: 'gender', headerName: '성별', flex: 1 },
        { field: 'phone', headerName: '휴대폰번호', flex: 2 },
        {
            field: 'activate',
            headerName: '활성상태',
            flex: 2,
            renderCell: (params) => (
                <span style={{ color: params.row.activate ? 'green' : 'red' }}>
                    {params.row.activate ? '활성회원' : '탈퇴회원'}
                </span>
            ),
        },
        { field: 'subscription', headerName: '구독여부', flex: 2 }, //구현x
        {
            field: 'edit',
            headerName: '관리',
            flex: 2,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/adminpage/members/${params.row.id}/edit`)}
                >
                    수정
                </Button>

            ),
        },
    ];


    return (
        <div className="member-list-container">
            <div className="member-list-header">
                <h3>회원 관리</h3>
                <span className="total-members">총 회원수 : {totalRows}</span>
            </div>

            <div className="search-container">
                <select
                    className="status-filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                >
                    <option value="">전체</option>
                    <option value="ACTIVE">활성회원</option>
                    <option value="DELETED">탈퇴회원</option>
                </select>

                <select className="search-type" onChange={(e) => setSearchType(e.target.value)} value={searchType}>
                    <option value="name">이름</option>
                    <option value="email">이메일</option>
                </select>
                <input
                    className="search-input"
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown} // 엔터키 이벤트 핸들러
                />
                {/* 검색 버튼 부활 */}
                <button className="search-button" onClick={handleSearch}>
                    검색
                </button>
            </div>

            <DataGrid
                autoHeight
                rows={members}
                columns={columns}
                rowCount={totalRows}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                sx={{ minHeight: '400px' }}
            />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default MemberList;