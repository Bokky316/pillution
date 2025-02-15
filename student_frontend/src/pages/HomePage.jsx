import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Home() {
    const { user, isLoggedIn } = useSelector((state) => state.auth);

    return (
        <Box sx={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <Typography variant="h4" gutterBottom sx={{ width: '100%', textAlign: 'center' }}>
                메인 화면
            </Typography>

            {/* 로그인하지 않은 경우 로그인 카드 표시 */}
            {!isLoggedIn && (
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            로그인
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            로그인 후 더 많은 기능을 이용할 수 있습니다.
                        </Typography>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: '10px' }}
                        >
                            로그인하기
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 로그인한 사용자만 학생 목록을 볼 수 있음 */}
            {isLoggedIn && (
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            학생 목록
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            학생들의 정보를 확인할 수 있습니다.
                        </Typography>
                        <Button
                            component={Link}
                            to="/listStudent"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: '10px' }}
                        >
                            학생 목록
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 학생 등록 카드 - 관리자만 접근 가능 */}
            {isLoggedIn && user?.roles?.includes('ROLE_ADMIN') && (
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            학생 등록
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            새로운 학생을 등록할 수 있습니다.
                        </Typography>
                        <Button
                            component={Link}
                            to="/addStudent"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: '10px' }}
                        >
                            학생 등록하기
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 마이페이지 카드 - 로그인된 사용자만 접근 가능 */}
            {isLoggedIn && (
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            마이페이지
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            자신의 정보를 확인하고 수정할 수 있습니다.
                        </Typography>
                        <Button
                            component={Link}
                            to={`/mypage/${user?.id}`}
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: '10px' }}
                        >
                            마이페이지로 이동
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default Home;
