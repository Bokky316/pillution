// ViewOrder.js

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Select,
  MenuItem,
  Box,
  Divider,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import PaymentIcon from '@mui/icons-material/Payment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { API_URL } from '@/utils/constants';

const ViewOrder = ({ open, order, onClose, onStatusChange, getOrderStatusKorean }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  //const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar 관련 상태 제거
  //const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar 관련 상태 제거
  //const [errorMessage, setErrorMessage] = useState(""); // Snackbar/에러 관련 상태 제거
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // 확인 대화창 상태 추가


  useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
  };

  const handleSaveStatus = () => {
    onStatusChange(order.orderId, selectedStatus);
  };

  // 취소 버튼 클릭 시 확인 대화창 표시
  const handleCancelButtonClick = () => {
    setConfirmDialogOpen(true);
  };

  // 확인 대화창에서 '취소' 버튼 클릭 시
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

 // 확인 대화창에서 '확인' 버튼 클릭 시 -> handleCancelOrder 호출.
  const handleCancelConfirm = () => {
      setConfirmDialogOpen(false);
      handleCancelOrder();
  };



  // 주문 취소 처리 함수 (수정)
    const handleCancelOrder = () => {
      fetch(`${API_URL}admin/orders/${order.orderId}/cancel`, {
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
              let errorMessage = text || '주문 취소 실패';
                try {
                    const parsedError = JSON.parse(text);
                    if (parsedError.message) {
                        errorMessage = parsedError.message;
                    }
                } catch (parseError) {
                    // JSON 파싱 실패 시, 원래 text를 그대로 사용
                }
              throw new Error(errorMessage);
            });
          }
          return response.text(); // 성공 응답도 텍스트로 파싱
        })
        .then(data => {
            let successMessage = data || '주문이 취소되었습니다.';
            try {
              const parsedData = JSON.parse(data);
              if(parsedData.message){
                successMessage = parsedData.message;
              }
            } catch (error) {
              //파싱에러
            }
            onStatusChange(order.orderId, "CANCELED"); // 상태를 즉시 CANCELED로 업데이트
            onClose(); // 다이얼로그 닫기
            // showAlert 함수를 직접 호출 (성공 메시지 전달)
            if(typeof onStatusChange ==='function'){ //onStatusChange가 함수인지 확인.
              onStatusChange(order.orderId, 'CANCELED', successMessage, "success"); //성공메시지
            }


        })
        .catch(error => {
          console.error('주문 취소 에러:', error);
           if(typeof onStatusChange ==='function'){ //onStatusChange가 함수인지 확인.
              onStatusChange(order.orderId, order.orderStatus, error.message, "error"); //실패메시지
           }
        });
    };

  const getStatusColor = (status) => {
    const colors = {
      'ORDERED': '#2196f3',
      'PAYMENT_PENDING': '#ff9800',
      'PAYMENT_COMPLETED': '#4caf50',
      'PREPARING_SHIPMENT': '#9c27b0',
      'IN_TRANSIT': '#3f51b5',
      'DELIVERED': '#009688',
      'RETURN_REQUESTED': '#f44336',
      'CANCELED': '#757575',
      'ORDER_COMPLETED': '#2e7d32'
    };
    return colors[status] || '#757575';
  };

  const InfoRow = ({ icon, label, value, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        color: color || 'primary.main'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            py: 2
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            주문 상세 정보
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 4, py: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={`주문 ID: ${order.orderId}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={getOrderStatusKorean(order.orderStatus)}
                  sx={{
                    bgcolor: `${getStatusColor(order.orderStatus)}15`,
                    color: getStatusColor(order.orderStatus),
                    fontWeight: 500
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <InfoRow
                icon={<PersonIcon />}
                label="회원 이름"
                value={order.memberName}
              />
              <InfoRow
                icon={<InventoryIcon />}
                label="상품 정보"
                value={`${order.productName} (${order.quantity}개)`}
              />
              <InfoRow
                icon={<PaymentIcon />}
                label="결제 정보"
                value={`${new Intl.NumberFormat('ko-KR').format(order.totalPrice)}원 / ${order.paymentMethod}`}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <InfoRow
                icon={<LocalShippingIcon />}
                label="주문일자"
                value={order.orderDate}
              />
              <InfoRow
                icon={<LocationOnIcon />}
                label="배송 주소"
                value={order.buyerAddr || "배송 주소 없음"}
              />

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  주문 상태 변경
                </Typography>
                <Select
                  fullWidth
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  disabled={order.orderStatus === 'CANCELED'}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1.5
                    }
                  }}
                >
                  {['ORDERED', 'ORDER_COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'PREPARING_SHIPMENT',
                    'IN_TRANSIT', 'DELIVERED', 'RETURN_REQUESTED'].map(status => (
                    <MenuItem key={status} value={status}>
                      {getOrderStatusKorean(status)}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>
          </Grid>

          {order.orderStatus === 'CANCELED' && (
            <Box sx={{
              mt: 3,
              p: 2,
              bgcolor: '#fff3e0',
              borderRadius: '8px',
              border: '1px solid #ffe0b2'
            }}>
              <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon fontSize="small" />
                이 주문은 취소된 상태입니다
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            닫기
          </Button>
          {order.orderStatus !== 'CANCELED' && (
            <>
              <Button
                variant="contained"
                onClick={handleSaveStatus}
                disabled={selectedStatus === order.orderStatus}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3
                }}
              >
                상태 변경
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancelButtonClick}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3
                }}
              >
                주문 취소
              </Button>
            </>
          )}
        </DialogActions>

        {/* 스낵바 제거 */}
        {/* <Snackbar ... /> */}
      </Dialog>

      {/* 취소 확인 대화창 */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            px: 1,
            py: 1
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">주문 취소 확인</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            정말 이 주문을 취소하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            주문 ID: {order.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            상품: {order.productName} ({order.quantity}개)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={handleConfirmDialogClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewOrder;