import React from 'react';
import { TextField, Box, Typography } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * @param {string} name - 사용자 이름
 * @param {string} email - 사용자 이메일
 * @param {string} phone - 사용자 전화번호
 * @param {string} postalCode - 사용자 우편번호
 * @param {string} roadAddress - 사용자 도로명 주소
 * @param {string} detailAddress - 사용자 상세 주소
 * @param {Function} handleUseUserInfo - 사용자 정보 사용 핸들러
 * @returns {JSX.Element} 사용자 정보 컴포넌트
 * @description 사용자 정보를 표시하는 컴포넌트입니다.
 */
const UserInfo = ({ name, email, phone, postalCode, roadAddress, detailAddress, handleUseUserInfo }) => {
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

    return (
        <Box>
            <TextField
                placeholder="이름"
                value={name}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
            <TextField
                placeholder="이메일"
                value={email}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
            <TextField
                placeholder="전화번호"
                value={phone}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
            <TextField
                placeholder="우편번호"
                value={postalCode}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
            <TextField
                placeholder="도로명 주소"
                value={roadAddress}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
            <TextField
                placeholder="상세주소"
                value={detailAddress}
                InputProps={{
                    readOnly: true,
                    sx: textFieldStyle
                }}
                fullWidth
                sx={{ mb: 1 }}
            />
        </Box>
    );
};

UserInfo.propTypes = {
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    postalCode: PropTypes.string.isRequired,
    roadAddress: PropTypes.string.isRequired,
    detailAddress: PropTypes.string.isRequired,
    handleUseUserInfo: PropTypes.func.isRequired,
};

export default UserInfo;
