import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils/constants';
import {
  Button,
  Typography,
  TextField,
  Box,
  Paper,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewOrder from './ViewOrder';
import Logo from '@/assets/images/logo.png'; // 로고 임포트

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success"); // 알림 심각도 (success, error 등)

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
        showAlert("주문 정보를 가져오는 데 실패했습니다.", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (newStatus !== orders.find(order => order.orderId === orderId)?.orderStatus) {
      try {
        const response = await fetch(`${API_URL}admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("accToken")}`
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.text(); // 에러 메시지 받기
          throw new Error(errorData || '상태 변경 실패'); // 받은 에러 메시지 사용
        }

        showAlert("주문 상태가 변경되었습니다.", "success");
      } catch (error) {
        console.error('상태 변경 에러:', error);
        showAlert(error.message || "주문 상태 변경에 실패했습니다.", "error");
      }
    }
    setDialogOpen(false);
    fetchOrders();
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
      field: 'orderStatus',
      headerName: '주문상태',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={params.value === 'CANCELED' ? 'error' : 'inherit'}
          sx={{
            backgroundColor: params.value === 'CANCELED' ? '#ffebee' :
              params.value === 'DELIVERED' ? '#e8f5e9' :
                'transparent',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          {getOrderStatusKorean(params.value)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 2,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setSelectedOrder(params.row);
            setDialogOpen(true);
          }}
          sx={{ textTransform: 'none' }}
        >
          상세보기
        </Button>
      )
    }
  ];

  const handleSearch = () => {
    fetchOrders();
  };

  // 알림 표시 함수
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };


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

      {/* 검색 카드 */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <Typography variant="subtitle1" fontWeight={500}>검색</Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mb: 2
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              label="회원 이름을 검색하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
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

      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={10}
        autoHeight
        loading={loading}
        disableSelectionOnClick
        sx={{
          borderRadius: '8px',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f8f9fa'
          }
        }}
      />

      <ViewOrder
        open={dialogOpen}
        order={selectedOrder}
        onClose={() => setDialogOpen(false)}
        onStatusChange={handleOrderStatusChange}
        getOrderStatusKorean={getOrderStatusKorean}
      />
      {/* 알림 다이얼로그 */}
      <Dialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#e9efff', padding: '16px 24px' }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <img src={Logo} alt="Logo" style={{ maxWidth: '150px', maxHeight: '50px' }} />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#e9efff', padding: '8px 24px' }}>
          <DialogContentText id="alert-dialog-description" textAlign="center">
            {alertMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#e9efff', padding: '8px 24px' }}>
          <Button onClick={() => setAlertOpen(false)} color="primary" autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderList;