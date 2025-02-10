import React, { useState, useEffect } from "react"; // React 라이브러리에서 useState, useEffect 훅을 가져옴
import { useSelector } from "react-redux"; // Redux의 상태(state)를 가져오는 useSelector 훅을 가져옴
import { DataGrid } from "@mui/x-data-grid"; // Material-UI의 DataGrid 컴포넌트 (표 형태의 데이터 출력)
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Autocomplete } from "@mui/material"; // Material-UI에서 UI 컴포넌트들을 가져옴
import { API_URL } from "../../constant"; // API 주소가 정의된 상수 파일을 가져옴
import { fetchWithAuth } from "../common/fetchWithAuth"; // 인증이 포함된 fetch 요청을 실행하는 함수
import useDebounce from "../hooks/useDebounce"; // 입력값 변경 시 특정 시간 후 실행되도록 하는 커스텀 훅
import { showSnackbar } from "../../redux/snackbarSlice"; // Redux에서 Snackbar 메시지를 관리하는 액션을 가져옴
import { useDispatch } from "react-redux"; // Redux의 액션을 실행하는 useDispatch 훅을 가져옴

/**
 * 채팅방 목록을 보여주는 컴포넌트
 * - 채팅방 목록을 조회하고 새 채팅방을 생성할 수 있음
 */
export default function ChatRoomList() {
    const { user } = useSelector((state) => state.auth); // Redux의 auth 상태에서 현재 로그인한 사용자 정보를 가져옴
    const dispatch = useDispatch(); // Redux 액션을 실행하기 위한 dispatch 함수
    const [chatRooms, setChatRooms] = useState([]); // 채팅방 목록을 저장하는 상태 (배열)
    const [openCreateChatModal, setOpenCreateChatModal] = useState(false); // 채팅방 생성 모달의 열림/닫힘 상태
    const [searchQuery, setSearchQuery] = useState(""); // 사용자 검색 입력값
    const [users, setUsers] = useState([]); // 검색된 사용자 목록을 저장하는 상태
    const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 정보를 저장하는 상태
    const debouncedQuery = useDebounce(searchQuery, 300); // 검색 입력값을 300ms 동안 지연(debounce)하여 변경

    // 컴포넌트가 처음 렌더링될 때 채팅방 목록을 불러오는 효과(useEffect)
    useEffect(() => {
        fetchChatRooms(); // 채팅방 목록을 불러오는 함수 실행
    }, []); // 의존성 배열([])이 비어 있어 최초 렌더링 시에만 실행됨

    // 검색어가 변경될 때마다 사용자 목록을 불러오는 효과
    useEffect(() => {
        if (debouncedQuery.length >= 2) { // 검색어가 2글자 이상일 경우 실행
            fetchUsers(debouncedQuery); // 사용자 목록 조회 함수 실행
        } else {
            setUsers([]); // 검색어가 너무 짧으면 사용자 목록 초기화
        }
    }, [debouncedQuery]); // debouncedQuery 값이 변경될 때 실행됨

    // 채팅방 목록을 불러오는 비동기 함수
    const fetchChatRooms = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${user.id}`); // API 요청 실행
            if (response.ok) {
                const data = await response.json(); // 응답 데이터를 JSON으로 변환
                setChatRooms(data); // 채팅방 목록 상태 업데이트
            }
        } catch (error) {
            console.error("🚨 채팅방 목록 조회 실패:", error.message); // 오류 발생 시 콘솔에 출력
        }
    };

    // 사용자를 검색하는 비동기 함수
    const fetchUsers = async (query) => {
        try {
            const response = await fetchWithAuth(`${API_URL}members/search?query=${query}`); // API 요청 실행
            if (response.ok) {
                const data = await response.json(); // 응답 데이터를 JSON으로 변환
                setUsers(data.data || []); // 사용자 목록 상태 업데이트 (데이터가 없으면 빈 배열)
            }
        } catch (error) {
            console.error("🚨 사용자 검색 실패:", error.message); // 오류 발생 시 콘솔에 출력
            setUsers([]); // 오류 발생 시 사용자 목록 초기화
        }
    };

    // 채팅방을 생성하는 비동기 함수
    const handleCreateChatRoom = async () => {
        if (!selectedUser) return; // 선택된 사용자가 없으면 함수 종료
        try {
            const response = await fetchWithAuth(`${API_URL}chat/create`, {
                method: "POST", // HTTP POST 요청 (새 데이터 생성)
                body: JSON.stringify({
                    creatorId: user.id, // 현재 로그인한 사용자의 ID
                    participantId: selectedUser.id, // 선택된 사용자 ID
                }),
            });
            if (response.ok) {
                dispatch(showSnackbar("✅ 채팅방이 성공적으로 생성되었습니다.")); // 성공 메시지 표시
                fetchChatRooms(); // 채팅방 목록 새로고침
                setOpenCreateChatModal(false); // 채팅방 생성 모달 닫기
            }
        } catch (error) {
            console.error("🚨 채팅방 생성 실패:", error.message); // 오류 발생 시 콘솔에 출력
        }
    };

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">채팅방 목록</Typography> {/* 타이틀 출력 */}
                <Button variant="contained" color="primary" onClick={() => setOpenCreateChatModal(true)}>새 채팅방</Button> {/* 새 채팅방 생성 버튼 */}
            </Box>
            <DataGrid
                rows={chatRooms} // 데이터 목록 (채팅방 목록)
                columns={[
                    { field: "name", headerName: "채팅방 이름", flex: 3 }, // 채팅방 이름 컬럼
                    { field: "createdAt", headerName: "생성 날짜", flex: 2 }, // 생성 날짜 컬럼
                ]}
                pageSizeOptions={[5, 10, 20]} // 페이지 크기 옵션
                autoHeight // 표 크기 자동 조정
            />

            {/* 새 채팅방 생성 모달 창 */}
            <Dialog open={openCreateChatModal} onClose={() => setOpenCreateChatModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>새 채팅방 만들기</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={users} // 자동완성할 사용자 목록
                        getOptionLabel={(option) => option.name} // 목록에서 표시할 이름
                        onChange={(event, value) => setSelectedUser(value)} // 사용자 선택 시 상태 업데이트
                        onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)} // 입력값 변경 시 상태 업데이트
                        renderInput={(params) => <TextField {...params} label="사용자 검색" fullWidth />} // 입력 필드
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateChatModal(false)}>취소</Button> {/* 취소 버튼 */}
                    <Button onClick={handleCreateChatRoom} color="primary">채팅 시작</Button> {/* 채팅방 생성 버튼 */}
                </DialogActions>
            </Dialog>
        </div>
    );
}
