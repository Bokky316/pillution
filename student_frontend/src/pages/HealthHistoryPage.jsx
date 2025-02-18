import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthHistory } from '@store/healthSlice'; // 슬라이스에서 액션 임포트
import '@styles/HealthHistoryPage.css'; // 스타일 파일 임포트

const HealthHistoryPage = () => {
    const dispatch = useDispatch();
    const { history, loading, error } = useSelector((state) => state.health);

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

    return (
        <div className="health-history-container">
            <h2>Health History</h2>
            {history.map((record) => (
                <div key={record.id} className="health-record">
                    <h3>Record Date: {new Date(record.createdAt).toLocaleDateString()}</h3>
                    <p>BMI: {record.healthAnalysis?.bmi}</p>
                    <p>Risk Levels: {record.healthAnalysis?.riskLevels}</p>
                    <p>Overall Assessment: {record.healthAnalysis?.overallAssessment}</p>
                    <h4>Recommended Products:</h4>
                    <ul>
                        {record.productRecommendations && record.productRecommendations.length > 0 ? (
                            record.productRecommendations.map((product) => (
                                <li key={product.id}>
                                    {product.productName} - {product.reason}
                                </li>
                            ))
                        ) : (
                            <li>No products recommended.</li>
                        )}
                    </ul>
                    <h4>Recommended Ingredients:</h4>
                    <ul>
                        {record.recommendedIngredients && record.recommendedIngredients.length > 0 ? (
                            record.recommendedIngredients.map((ingredient) => (
                                <li key={ingredient.ingredientName}>
                                    {ingredient.ingredientName} (Score: {ingredient.score})
                                </li>
                            ))
                        ) : (
                            <li>No ingredients recommended.</li>
                        )}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default HealthHistoryPage;
