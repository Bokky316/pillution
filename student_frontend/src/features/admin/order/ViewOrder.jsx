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
    Paper
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
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.orderStatus);
        }
    }, [order]);

    if (!order) return null;

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleSaveStatus = () => {
        onStatusChange(order.orderId, selectedStatus);
    };

    const handleCancelButtonClick = () => {
        setConfirmDialogOpen(true);
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
    };

    const handleCancelConfirm = () => {
        setConfirmDialogOpen(false);
        handleCancelOrder();
    };

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
                        let errorMessage;
                        try {
                            const parsedError = JSON.parse(text);

                            errorMessage = parsedError.message.split('주문 ID:')[0].trim();
                        } catch (parseError) {

                            errorMessage = text.split('주문 ID:')[0].trim();
                        }
                        throw new Error(errorMessage || '주문 취소 실패');
                    });
                }
                return response.text();
            })
            .then(data => {
                let successMessage = data || '주문이 취소되었습니다.';
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.message) {
                        successMessage = parsedData.message;
                    }
                } catch (error) { }
                onStatusChange(order.orderId, "CANCELED");
                onClose();
                if (typeof onStatusChange === 'function') {
                    onStatusChange(order.orderId, 'CANCELED', successMessage, "success");
                }
            })
            .catch(error => {
                console.error('주문 취소 에러:', error);
                if (typeof onStatusChange === 'function') {
                    onStatusChange(order.orderId, order.orderStatus, error.message, "error");
                }
            });
    };

    const getStatusColor = (status) => {
        const colors = {
            'ORDERED': '#2563eb',        // 밝은 파랑
            'PAYMENT_PENDING': '#f59e0b', // 밝은 주황
            'PAYMENT_COMPLETED': '#10b981', // 밝은 초록
            'PREPARING_SHIPMENT': '#8b5cf6', // 밝은 보라
            'IN_TRANSIT': '#6366f1',     // 밝은 인디고
            'DELIVERED': '#0d9488',      // 밝은 청록
            'RETURN_REQUESTED': '#ef4444', // 밝은 빨강
            'CANCELED': '#6b7280',       // 밝은 회색
            'ORDER_COMPLETED': '#059669'  // 밝은 에메랄드
        };
        return colors[status] || '#6b7280';
    };

    const getStatusBackgroundColor = (status) => {
        const colors = {
            'ORDERED': '#dbeafe',        // 연한 파랑
            'PAYMENT_PENDING': '#fef3c7', // 연한 주황
            'PAYMENT_COMPLETED': '#d1fae5', // 연한 초록
            'PREPARING_SHIPMENT': '#ede9fe', // 연한 보라
            'IN_TRANSIT': '#e0e7ff',     // 연한 인디고
            'DELIVERED': '#ccfbf1',      // 연한 청록
            'RETURN_REQUESTED': '#fee2e2', // 연한 빨강
            'CANCELED': '#f3f4f6',       // 연한 회색
            'ORDER_COMPLETED': '#ecfdf5'  // 연한 에메랄드
        };
        return colors[status] || '#f3f4f6';
    };

    const InfoRow = ({ icon, label, value }) => (
        <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: 3,
            '&:last-child': { mb: 0 }
        }}>
            <Box sx={{
                mr: 2,
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'primary.main'
            }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.5
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 500,
                        color: 'text.primary'
                    }}
                >
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
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    id="view-order-title" // DialogTitle 에 id 추가 (접근성 향상)
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        padding: '16px 24px' // padding 값 직접 지정 (기본 p: 2.5 는 20px)
                    }}
                >
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}> {/* variant 를 h5 로, component 를 div 로 변경 */}
                        주문 상세 정보
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'text.primary' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <Chip
                                    label={`주문 ID: ${order.orderId}`}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 1.5,
                                        height: 32,
                                        fontWeight: 500
                                    }}
                                />
                                <Chip
                                    label={getOrderStatusKorean(order.orderStatus)}
                                    sx={{
                                        borderRadius: 1.5,
                                        height: 32,
                                        fontWeight: 500,
                                        color: getStatusColor(order.orderStatus),
                                        bgcolor: getStatusBackgroundColor(order.orderStatus),
                                        border: 'none'
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'grey.50'
                                }}
                            >
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
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'grey.50'
                                }}
                            >
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

                                {order.orderStatus !== 'CANCELED' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                mb: 1,
                                                color: 'text.secondary',
                                                fontWeight: 500
                                            }}
                                        >
                                            주문 상태 변경
                                        </Typography>
                                        <Select
                                            fullWidth
                                            value={selectedStatus}
                                            onChange={handleStatusChange}
                                            sx={{
                                                borderRadius: 1.5,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'divider'
                                                }
                                            }}
                                        >
                                            {['ORDERED', 'ORDER_COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED',
                                                'PREPARING_SHIPMENT', 'IN_TRANSIT', 'DELIVERED', 'RETURN_REQUESTED'].map(status => (
                                                    <MenuItem key={status} value={status}>
                                                        {getOrderStatusKorean(status)}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {order.orderStatus === 'CANCELED' && (
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#fff8f1',
                            border: '1px solid',
                            borderColor: '#ffe4cc'
                        }}>
                            <Typography
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: '#f97316'
                                }}
                            >
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
                            borderRadius: 1.5,
                            textTransform: 'none',
                            px: 3,
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main'
                            }
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
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    px: 3,
                                    bgcolor: '#4169E1',
                                    '&:hover': {
                                        bgcolor: '#3457b2'  // 어두운 색
                                    }
                                }}
                            >
                                상태 변경
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleCancelButtonClick}
                                sx={{
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                주문 취소
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDialogOpen}
                onClose={handleConfirmDialogClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        주문 취소 확인
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        정말 이 주문을 취소하시겠습니까?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                            borderRadius: 1.5,
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
                            borderRadius: 1.5,
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