import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthHistory } from '@store/healthSlice'; // 슬라이스에서 액션 임포트
import '@styles/HealthHistoryPage.css'; // 스타일 파일 임포트
import { useNavigate } from 'react-router-dom';

const HealthHistoryPage = () => {
    const dispatch = useDispatch();
    const { history, loading, error } = useSelector((state) => state.health);
    const navigate = useNavigate(); // useNavigate 훅 초기화

    // 컴포넌트가 마운트될 때 건강 기록 히스토리 조회 액션 디스패치
    useEffect(() => {
        dispatch(fetchHealthHistory());
    }, [dispatch]);

    // 로딩 중일 때 메시지 표시
    if (loading) {
        return <div>Loading health history...</div>;
    }

    // 에러 발생 시 에러 메시지 표시
    if (error) {
        return <div>Error: {error}</div>;
    }

    // 건강 기록이 없을 경우 메시지 표시
    if (!history || history.length === 0) {
        return <div>No health history available.</div>;
    }

    // 특정 건강 기록 클릭 시 추천 페이지로 이동
    const handleRecordClick = (record) => {
        navigate(`/recommendation/${record.id}`); // 추천 페이지로 이동
    };

    return (
        <div>
            <h2>Health History</h2>
            <ul>
                {history.map((record) => (
                    <li key={record.id}>
                        <button onClick={() => handleRecordClick(record)}>
                            Record Date: {new Date(record.createdAt).toLocaleDateString()}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HealthHistoryPage;