import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils/constants';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
  TextField,
  Box,
  Paper,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    let apiUrl = `${API_URL}admin/orders?page=0&size=10`;
    if (searchKeyword.trim() !== "") {
      apiUrl += `&memberName=${encodeURIComponent(searchKeyword)}`;
    }
    setLoading(true);
    fetch(apiUrl, {
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
      .catch(error => {
        console.error('에러 발생:', error);
        setSnackbarMessage("주문 정보를 가져오는 데 실패했습니다.");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleSearchButtonClick = () => {
    fetchOrders();
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setErrorMessage("");
    setDialogOpen(true);
  };

  const handleCancelConfirm = () => {
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
            throw new Error(text);
          });
        }
        return response.text();
      })
      .then(data => {
        setSnackbarMessage(data);
        setSnackbarOpen(true);
        setDialogOpen(false);
        fetchOrders();
      })
      .catch(error => {
        console.error('주문 취소 에러:', error);
        setErrorMessage(error.message);
      });
  };

  const columns = [
    { field: 'orderId', headerName: '주문 ID', flex: 2 },
    { field: 'memberName', headerName: '회원 이름', flex: 2 },
    { field: 'productName', headerName: '상품명', flex: 2 },
    { field: 'quantity', headerName: '주문 수량', flex: 2 },
    {
      field: 'totalPrice',
      headerName: '금액',
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Intl.NumberFormat('ko-KR').format(params.value)}원
        </Typography>
      )
    },
    { field: 'orderDate', headerName: '주문일자', flex: 2 },
    {
      field: 'shippingAddress',
      headerName: '주소',
      flex: 3,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      )
    },
    { field: 'paymentMethod', headerName: '결제수단', flex: 2 },
    {
      field: 'orderStatus',
      headerName: '주문상태',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value === 'CANCELED' ? 'red' : 'inherit'}>
          {getOrderStatusKorean(params.value)}
        </Typography>
      )
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
          <Tooltip title={tooltipMessage} disableHoverListener={!isCanceled && !isDelivered}>
            <span>
              <Button
                variant="contained"
                color={isCanceled ? 'default' : 'secondary'}
                disabled={isCanceled || isDelivered}
                onClick={() => handleCancelClick(params.row)}
                sx={{ textTransform: 'none' }}
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
    <Paper
      elevation={2}
      sx={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* 헤더 섹션 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1a237e' }}>
          주문 관리
        </Typography>
      </Box>

      {/* 검색 섹션 */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="회원 이름 검색"
              value={searchKeyword}
              onChange={handleSearchChange}
              size="small"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#dee2e6' },
                  '&.Mui-focused fieldset': { borderColor: '#3f51b5' }
                }
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={handleSearchButtonClick}
                    sx={{
                      backgroundColor: '#3f51b5',
                      '&:hover': { backgroundColor: '#303f9f' },
                      minWidth: '40px',
                      padding: '6px'
                    }}
                  >
                    <SearchIcon sx={{ color: '#fff' }} />
                  </Button>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchButtonClick();
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 데이터 그리드 */}
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={10}
        autoHeight
        loading={loading}
        sx={{
          borderRadius: '8px',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderRadius: '8px 8px 0 0'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9'
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 8px 8px'
          }
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
          sx={{ width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 주문 취소 확인 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          style: { borderRadius: '8px', padding: '12px' }
        }}
      >
        <DialogTitle>주문 취소 확인</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography variant="body2">주문 번호: {selectedOrder.orderId}</Typography>
              <Typography variant="body2">
                현재 주문 상태: {getOrderStatusKorean(selectedOrder.orderStatus)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                이 주문을 취소하시겠습니까?
              </Typography>
              {errorMessage && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  오류: {errorMessage}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button onClick={handleCancelConfirm} color="secondary" disabled={!!errorMessage} sx={{ textTransform: 'none' }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderList;