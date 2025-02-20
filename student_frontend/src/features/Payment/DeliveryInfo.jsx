import React, { useState } from 'react';
import {
    TextField,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Modal
} from "@mui/material";
import PropTypes from 'prop-types';

/**
 * @param {string} deliveryName - 배송 받는 사람 이름
 * @param {string} deliveryPhone - 배송 받는 사람 전화번호
 * @param {string} postalCode - 우편번호
 * @param {string} roadAddress - 주소
 * @param {string} detailAddress - 상세주소
 * @param {string} deliveryMessage - 배송 메시지
 * @param {string} customDeliveryMessage - 직접 입력한 배송 메시지
 * @param {Array} savedAddresses - 저장된 배송지 목록
 * @param {string} selectedSavedAddressId - 선택된 저장된 배송지 ID
 * @param {boolean} openDialog - 다이얼로그 열림 여부
 * @param {string} deliveryInfoName - 배송 정보 이름
 * @param {Function} handleSavedAddressChange - 저장된 배송지 선택 핸들러
 * @param {Function} handleAddressSearch - 주소 검색 핸들러
 * @param {Function} handleDeliveryMessageChange - 배송 메시지 변경 핸들러
 * @param {Function} handleUseUserInfoForDelivery - 사용자 정보와 동일하게 설정 핸들러
 * @param {Function} handleSaveDeliveryInfo - 배송 정보 저장 핸들러
 * @param {Function} handleCloseDialog - 다이얼로그 닫기 핸들러
 * @param {Function} handleConfirmSave - 저장 확인 핸들러
 * @param {Function} setDeliveryName - 배송 이름 설정 핸들러
 * @param {Function} setDeliveryPhone - 배송 전화번호 설정 핸들러
 * @param {Function} setRoadAddress - 도로명 주소 설정 핸들러
 * @param {Function} setDetailAddress - 상세 주소 설정 핸들러
 * @param {Function} setCustomDeliveryMessage - 직접 입력한 배송 메시지 설정 핸들러
 * @param {Function} setIsDefault - 기본 배송지 설정 핸들러
 * @param {Function} setDeliveryInfoName - 배송 정보 이름 설정 핸들러
 * @returns {JSX.Element} 배송 정보 컴포넌트
 * @description 배송 정보를 입력하고 저장하는 컴포넌트입니다.
 */
const DeliveryInfo = ({
    deliveryName,
    deliveryPhone,
    postalCode,
    roadAddress,
    detailAddress,
    deliveryMessage,
    customDeliveryMessage,
    savedAddresses,
    selectedSavedAddressId,
    openDialog,
    deliveryInfoName,
    handleSavedAddressChange,
    handleAddressSearch,
    handleDeliveryMessageChange,
    handleUseUserInfoForDelivery,
    handleSaveDeliveryInfo,
    handleCloseDialog,
    handleConfirmSave,
    setDeliveryName,
    setDeliveryPhone,
    setRoadAddress,
    setDetailAddress,
    setCustomDeliveryMessage,
    setIsDefault,
    setDeliveryInfoName
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #eee'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #eee'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #4169E1'
        },
        borderRadius: 0
    };

    // buttonStyle 정의
    const buttonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '0.8rem',
        textDecoration: 'underline',
        color: 'inherit',
        '&:hover': {
            background: 'none',
        },
        '&:focus': {
            outline: 'none',
        },
        boxShadow: 'none',
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Box>
            {/* 주문 정보 불러오기와 저장된 배송지 선택을 한 줄에 배치 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                    onClick={handleUseUserInfoForDelivery}
                    sx={buttonStyle}
                >
                    주문 정보 불러오기
                </Button>
                <Button
                    onClick={openModal}
                    sx={buttonStyle}
                >
                    배송 정보 저장
                </Button>
            </Box>

            {/* 저장된 배송지 선택 모달 */}
            <Modal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="saved-address-modal-title"
                aria-describedby="saved-address-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="saved-address-modal-title" variant="h6" component="h2">
                        배송 정보 저장
                    </Typography>
                    <Box mt={2}>
                        <Button
                            onClick={handleSaveDeliveryInfo}
                            sx={{
                                background: 'none',
                                border: 'none',
                                fontSize: '0.8rem',
                                textDecoration: 'underline',
                                color: 'inherit',
                                '&:hover': {
                                    background: 'none',
                                },
                                '&:focus': {
                                    outline: 'none',
                                },
                                boxShadow: 'none',
                                display: 'block', // 전체 폭을 사용하도록 설정
                                textAlign: 'right', // 텍스트를 오른쪽으로 정렬
                                padding: 0, // 패딩 제거
                                marginBottom: '10px'
                            }}
                        >
                            현재 배송 정보 기억하기
                        </Button>
                        <FormControl fullWidth>
                            <InputLabel id="saved-address-label">저장된 배송지</InputLabel>
                            <Select
                                labelId="saved-address-label"
                                id="saved-address"
                                value={selectedSavedAddressId}
                                onChange={handleSavedAddressChange}
                                label="저장된 배송지"
                            >
                                <MenuItem value="">선택 안 함</MenuItem>
                                {savedAddresses.map(address => (
                                    <MenuItem key={address.id} value={address.id}>
                                        {address.deliveryName} - {address.recipientName}, {address.roadAddress}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Modal>

            {/* 배송 정보 - 이름 */}
            <TextField
                placeholder="이름"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{ sx: textFieldStyle }}
            />

            {/* 배송 정보 - 전화번호 */}
            <TextField
                placeholder="전화번호"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{ sx: textFieldStyle }}
            />

            {/* 배송 정보 - 주소 */}
            <Box display="flex" alignItems="center" mb={2}>
                <TextField
                    placeholder="우편번호"
                    value={postalCode}
                    readOnly
                    sx={{ width: '150px', marginRight: 2 }}
                    InputProps={{ sx: textFieldStyle }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddressSearch}
                    sx={{
                        backgroundColor: '#333', // 검정색 배경
                        color: 'white', // 흰색 글씨
                        fontSize: '0.8rem',
                        fontWeight: 'bold', // 글씨 굵게
                        borderRadius: '8px', // 모서리 둥글게
                        textTransform: 'none', // 대문자 변환 방지
                        boxShadow: 'none', // 그림자 제거
                        '&:hover': {
                            backgroundColor: '#555', // 호버 시 약간 밝은 검정색
                            boxShadow: 'none', // 호버 시 그림자 제거
                        },
                    }}
                >
                    우편번호 검색
                </Button>
            </Box>
            <TextField
                placeholder="도로명 주소"
                value={roadAddress}
                readOnly
                fullWidth
                margin="normal"
                InputProps={{ sx: textFieldStyle }}
            />
            <TextField
                placeholder="상세주소"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{ sx: textFieldStyle }}
            />

            {/* 배송 메시지 선택 */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="delivery-message-label">배송 메시지</InputLabel>
                <Select
                    labelId="delivery-message-label"
                    id="delivery-message"
                    value={deliveryMessage}
                    onChange={handleDeliveryMessageChange}
                    label="배송 메시지"
                >
                    <MenuItem value="">선택 안 함</MenuItem>
                    <MenuItem value="문 앞에 놓아주세요">문 앞에 놓아주세요</MenuItem>
                    <MenuItem value="부재 시 연락 부탁드려요">부재 시 연락 부탁드려요</MenuItem>
                    <MenuItem value="배송 전 미리 연락해 주세요">배송 전 미리 연락해 주세요</MenuItem>
                    <MenuItem value="custom">직접 입력하기</MenuItem>
                </Select>
                {deliveryMessage === 'custom' && (
                    <TextField
                        placeholder="배송 메시지 직접 입력"
                        value={customDeliveryMessage}
                        onChange={(e) => setCustomDeliveryMessage(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputProps={{ sx: textFieldStyle }}
                    />
                )}
            </FormControl>

            {/* 배송 정보 저장 다이얼로그 */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>배송 정보 저장</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        이 배송 정보를 기본 배송 정보로 설정하시겠습니까?
                    </DialogContentText>
                    <Box display="flex" justifyContent="space-around">
                        <Button onClick={() => setIsDefault(true)}>예</Button>
                        <Button onClick={() => setIsDefault(false)}>아니오</Button>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="deliveryInfoName"
                        label="배송 정보 이름"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={deliveryInfoName}
                        onChange={(e) => setDeliveryInfoName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>취소</Button>
                    <Button onClick={handleConfirmSave}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

DeliveryInfo.propTypes = {
    deliveryName: PropTypes.string.isRequired,
    deliveryPhone: PropTypes.string.isRequired,
    postalCode: PropTypes.string.isRequired,
    roadAddress: PropTypes.string.isRequired,
    detailAddress: PropTypes.string.isRequired,
    deliveryMessage: PropTypes.string.isRequired,
    customDeliveryMessage: PropTypes.string.isRequired,
    savedAddresses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        deliveryName: PropTypes.string.isRequired,
        recipientName: PropTypes.string.isRequired,
        roadAddress: PropTypes.string.isRequired,
    })).isRequired,
    selectedSavedAddressId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    openDialog: PropTypes.bool.isRequired,
    deliveryInfoName: PropTypes.string.isRequired,
    handleSavedAddressChange: PropTypes.func.isRequired,
    handleAddressSearch: PropTypes.func.isRequired,
    handleDeliveryMessageChange: PropTypes.func.isRequired,
    handleUseUserInfoForDelivery: PropTypes.func.isRequired,
    handleSaveDeliveryInfo: PropTypes.func.isRequired,
    handleCloseDialog: PropTypes.func.isRequired,
    handleConfirmSave: PropTypes.func.isRequired,
    setDeliveryName: PropTypes.func.isRequired,
    setDeliveryPhone: PropTypes.func.isRequired,
    setRoadAddress: PropTypes.func.isRequired,
    setDetailAddress: PropTypes.func.isRequired,
    setCustomDeliveryMessage: PropTypes.func.isRequired,
    setIsDefault: PropTypes.func.isRequired,
    setDeliveryInfoName: PropTypes.func.isRequired
};

export default DeliveryInfo;
