import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils/constants';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Tooltip, TextField, Box } from '@mui/material'; // Box 컴포넌트 import

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchOrders(); // 컴포넌트가 처음 나타날 때 주문 목록 불러오기
  }, []); // 빈 배열을 넣어 의존성 목록을 비워서, 처음 한 번만 실행되도록 함

  const fetchOrders = () => {
      let apiUrl = `${API_URL}admin/orders?page=0&size=10`;
          if (searchKeyword) { // 검색어가 있으면 파라미터 추가
            apiUrl += `&memberName=${searchKeyword}`;
          }
    fetch(apiUrl, { // 수정된 apiUrl 사용
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("accToken")}`
      },
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) throw new Error('데이터 가져오기 실패');
        return response.json();
      })
      .then(data => {
        setOrders(data.content);
      })
      .catch(error => console.error('에러 발생:', error));
  };

  // 주문 상태를 한국어로 변환하는 함수 (기존과 동일)
  const getOrderStatusKorean = (status) => {
    const statusMap = {
      'ORDERED': '주문',
      'PAYMENT_PENDING': '입금대기',
      'PAYMENT_COMPLETED': '결제완료',
      'PREPARING_SHIPMENT': '배송준비',
      'IN_TRANSIT': '배송중',
      'DELIVERED': '배송완료',
      'RETURN_REQUESTED': '반품요청',
      'CANCELED': '주문취소',
      'ORDER_COMPLETED': '주문완료'
    };
    return statusMap[status] || status;
  };

  const handleSearchChange = (event) => { // 검색어 입력 칸 내용 변경 시 호출되는 함수 (기존과 동일)
      setSearchKeyword(event.target.value); // 검색어 상태 업데이트만 함
    };

  const handleSearchButtonClick = () => { // "검색" 버튼 클릭 시 호출되는 함수 (새로 추가)
      fetchOrders(); // 주문 목록 불러오는 함수 호출
  };

  const handleCancelClick = (order) => { // 주문 취소 버튼 클릭 시 (기존과 동일)
    setSelectedOrder(order);
    setErrorMessage("");
    setDialogOpen(true);
  };

  const handleCancelConfirm = () => { // 주문 취소 확인 다이얼로그에서 "확인" 버튼 클릭 시 (기존과 동일)
    if (!selectedOrder) return;

    fetch(`${API_URL}admin/orders/${selectedOrder.orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("accToken")}`
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          if (response.status === 500) {
            if (text.includes("이미 취소된") || text.includes("배송 시작 이후")) {
              throw new Error(text);
            } else {
              throw new Error(`서버 내부 오류가 발생했습니다. 상세: ${text}`);
            }
          } else {
            throw new Error(`요청 처리 중 오류가 발생했습니다 (${response.status}): ${text}`);
          }
        });
      }
      return response.text();
    })
    .then(data => {
      alert(data);
      setDialogOpen(false);
      fetchOrders(); // 주문 취소 후 주문 목록 다시 불러오기
    })
    .catch(error => {
      console.error('주문 취소 에러:', error);
      setErrorMessage(error.message);
    });
  };

  const columns = [ // DataGrid 컬럼 정의 (기존과 동일)
    { field: 'orderId', headerName: '주문 ID', flex: 2 },
    { field: 'memberName', headerName: '회원 이름', flex: 2 },
    { field: 'productName', headerName: '상품명', flex: 2 },
    { field: 'quantity', headerName: '주문 수량', flex: 2 },
    { field: 'totalPrice', headerName: '금액', flex: 2 },
    { field: 'orderDate', headerName: '주문일자', flex: 2 },
    {
        field: 'shippingAddress',
        headerName: '주소',
        flex: 3,
        sx: {
            '& .MuiDataGrid-cell': {
             hiteSpace: 'normal',
             },
         },
     },
    { field: 'paymentMethod', headerName: '결제수단', flex: 2 },
    {
      field: 'orderStatus',
      headerName: '주문상태',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const isCanceled = params.value === 'CANCELED';
        return (
          <Typography style={{ color: isCanceled ? 'red' : 'inherit' }}>
            {getOrderStatusKorean(params.value)}
          </Typography>
        );
      }
    },
    {
      field: 'manage',
      headerName: '관리',
      flex: 2,
      renderCell: (params) => {
        const isCanceled = params.row.orderStatus === 'CANCELED';
        const isDelivered = ['IN_TRANSIT', 'DELIVERED', 'ORDER_COMPLETED'].includes(params.row.orderStatus);

        let tooltipMessage = "";
        if (isCanceled) {
          tooltipMessage = "이미 취소된 주문입니다";
        } else if (isDelivered) {
          tooltipMessage = "배송 시작 이후의 주문은 취소할 수 없습니다";
        }

        return (
          <Tooltip
            title={tooltipMessage}
            disableHoverListener={!isCanceled && !isDelivered}
          >
            <span>
              <Button
                variant="contained"
                color={isCanceled ? 'default' : 'secondary'}
                disabled={isCanceled || isDelivered}
                onClick={() => handleCancelClick(params.row)}
              >
                {isCanceled ? '주문 취소 완료' : '주문 취소'}
              </Button>
            </span>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <div>
      <h3>관리자 주문 내역</h3>
      <Box display="flex" alignItems="center" marginBottom="20px"> {/* Box 컴포넌트로 flex 레이아웃 사용 */}
        <TextField
          label="회원 이름 검색"
          value={searchKeyword}
          onChange={handleSearchChange}
          style={{ marginRight: '10px' }} // 검색어 입력칸과 버튼 사이 간격
          sx={{
              '& .MuiInputBase-input': { // 입력 필드 스타일
                paddingTop: '8px',   // 위쪽 패딩 줄이기
                paddingBottom: '8px', // 아래쪽 패딩 줄이기
              },
            }}
        />
        <Button variant="contained" onClick={handleSearchButtonClick}> {/* "검색" 버튼 추가 */}
          검색
        </Button>
      </Box>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={10}
        autoHeight
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>주문 취소 확인</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography>주문 번호: {selectedOrder.orderId}</Typography>
              <Typography>현재 주문 상태: {getOrderStatusKorean(selectedOrder.orderStatus)}</Typography>
              <Typography>이 주문을 취소하시겠습니까?</Typography>
              {errorMessage && (
                <Typography color="error" style={{marginTop: '16px'}}>
                  오류: {errorMessage}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button onClick={handleCancelConfirm} color="secondary" disabled={!!errorMessage}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderList;