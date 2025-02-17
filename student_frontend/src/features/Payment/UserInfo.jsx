import React from 'react';
import { TextField, Box, Typography, Button } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * @param {string} name - 사용자 이름
 * @param {string} email - 사용자 이메일
 * @param {string} phone - 사용자 전화번호
 * @param {string} address1 - 사용자 주소1
 * @param {string} address2 - 사용자 주소2
 * @param {Function} handleUseUserInfo - 사용자 정보 사용 핸들러
 * @returns {JSX.Element} 사용자 정보 컴포넌트
 * @description 사용자 정보를 표시하는 컴포넌트입니다.
 */
const UserInfo = ({ name, email, phone, zipCode, address1, address2, handleUseUserInfo }) => {
    return (
        <Box>
            <Typography variant="h6" mt={3} gutterBottom>
                사용자 정보
            </Typography>
            <Button variant="contained" color="primary" onClick={handleUseUserInfo}>
                사용자 정보 탭에서 주문 정보 탭으로 정보 복사
            </Button>
            <TextField
                label="이름"
                value={name}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
            />
            <TextField
                label="이메일"
                value={email}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
            />
            <TextField
                label="전화번호"
                value={phone}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
            />
             <TextField
                label="우편번호"
                value={zipCode}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="주소"
                value={address1}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="상세주소"
                value={address2}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
        </Box>
    );
};

UserInfo.propTypes = {
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address1: PropTypes.string.isRequired,
    address2: PropTypes.string.isRequired,
    handleUseUserInfo: PropTypes.func.isRequired,
};

export default UserInfo;
