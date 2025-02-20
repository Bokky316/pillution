// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4169E1',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafafa',
          boxShadow: 'none',
          color: '#4f4f4f',
          width: '100%', // 전체 너비
          left: 0,
          right: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: '#4f4f4f !important', // 버튼 텍스트 색상을 #4f4f4f로 설정, 우선순위 높임
          '&:hover': {
            backgroundColor: 'rgba(79, 79, 79, 0.04) !important', // 호버 시 배경색 설정 (옵션), 우선순위 높임
          },
        },
        contained: {
          backgroundColor: '#4f4f4f !important', // contained 버튼의 배경색을 #4f4f4f로 설정, 우선순위 높임
          color: '#ffffff !important', // contained 버튼의 텍스트 색상을 흰색으로 설정, 우선순위 높임
          '&:hover': {
            backgroundColor: '#3f3f3f !important', // 호버 시 약간 어두운 색상으로 설정 (옵션), 우선순위 높임
          },
        },
        outlined: {
          borderColor: '#4f4f4f !important', // outlined 버튼의 테두리 색상을 #4f4f4f로 설정, 우선순위 높임
          '&:hover': {
            borderColor: '#3f3f3f !important', // 호버 시 약간 어두운 색상으로 설정 (옵션), 우선순위 높임
          },
        },
      },
    },
  },
});

export default theme;
