import React from 'react';
import {
    TextField,
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import PropTypes from 'prop-types';


/**
 * @param {string} deliveryName - 배송 받는 사람 이름
 * @param {string} deliveryPhone - 배송 받는 사람 전화번호
 * @param {string} zipCode - 우편번호
 * @param {string} address1 - 주소
 * @param {string} address2 - 상세주소
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
 * @param {Function} setAddress2 - 상세 주소 설정 핸들러
 * @param {Function} setCustomDeliveryMessage - 직접 입력한 배송 메시지 설정 핸들러
 * @param {Function} setIsDefault - 기본 배송지 설정 핸들러
 * @param {Function} setDeliveryInfoName - 배송 정보 이름 설정 핸들러
 * @returns {JSX.Element} 배송 정보 컴포넌트
 * @description 배송 정보를 입력하고 저장하는 컴포넌트입니다.
 */
const DeliveryInfo = ({
                          deliveryName,
                          deliveryPhone,
                          zipCode,
                          address1,
                          address2,
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
                          setAddress2,
                          setCustomDeliveryMessage,
                          setIsDefault,
                          setDeliveryInfoName
                      }) => {
    return (
        <Box>
            <Typography variant="h6" mt={3} gutterBottom>
                배송 정보
            </Typography>

            {/* 저장된 배송지 선택 */}
            <FormControl fullWidth margin="normal">
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

            {/* 배송 정보 - 이름 */}
            <TextField
                label="이름"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                fullWidth
                margin="normal"
            />

            {/* 배송 정보 - 전화번호 */}
            <TextField
                label="전화번호"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                fullWidth
                margin="normal"
            />

            {/* 배송 정보 - 주소 */}
            <Box display="flex" alignItems="center" mb={2}>
                <TextField
                    label="우편번호"
                    value={zipCode}
                    readOnly
                    sx={{ width: '150px', marginRight: 2 }}
                />
                <Button variant="outlined" onClick={handleAddressSearch}>
                    주소 검색
                </Button>
            </Box>
            <TextField
                label="주소"
                value={address1}
                readOnly
                fullWidth
                margin="normal"
            />
            <TextField
                label="상세주소"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                fullWidth
                margin="normal"
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
                        label="배송 메시지 직접 입력"
                        value={customDeliveryMessage}
                        onChange={(e) => setCustomDeliveryMessage(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                )}
            </FormControl>

            {/* 배송 정보 - 사용자 정보 이용 버튼 */}
            <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleUseUserInfoForDelivery}>
                    사용자 정보와 동일하게
                </Button>
            </Box>

            {/* 배송 정보 - 배송 정보 기억하기 버튼 */}
            <Box mt={2}>
                <Button variant="contained" color="secondary" onClick={handleSaveDeliveryInfo}>
                    배송 정보 기억하기
                </Button>
            </Box>

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
    zipCode: PropTypes.string.isRequired,
    address1: PropTypes.string.isRequired,
    address2: PropTypes.string.isRequired,
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
    setAddress2: PropTypes.func.isRequired,
    setCustomDeliveryMessage: PropTypes.func.isRequired,
    setIsDefault: PropTypes.func.isRequired,
    setDeliveryInfoName: PropTypes.func.isRequired
};

export default DeliveryInfo;
