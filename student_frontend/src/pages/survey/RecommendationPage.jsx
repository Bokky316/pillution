import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, Checkbox, CircularProgress } from '@mui/material';
import { fetchWithAuth } from '../../features/auth/utils/fetchWithAuth';
import { API_URL } from '../../constant';

const RecommendationPage = () => {
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const categoryData = await fetchWithAuth(`${API_URL}survey/categories`);
                const questionData = await fetchWithAuth(`${API_URL}survey/questions`);
                setCategories(categoryData);
                setQuestions(questionData);
                setLoading(false);
            } catch (error) {
                console.error('설문 데이터 로딩 오류:', error);
                setError('설문 데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchSurveyData();
    }, []);

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({...prev, [questionId]: value}));
    };

    const handleMultipleChoiceChange = (questionId, optionId) => {
        setResponses(prev => {
            const currentResponses = prev[questionId] || [];
            if (currentResponses.includes(optionId)) {
                return {...prev, [questionId]: currentResponses.filter(id => id !== optionId)};
            } else {
                return {...prev, [questionId]: [...currentResponses, optionId]};
            }
        });
    };

    const handleNextCategory = () => {
        if (currentCategoryIndex < categories.length - 1) {
            setCurrentCategoryIndex(prev => prev + 1);
        } else {
            submitSurvey();
        }
    };

    const submitSurvey = async () => {
        try {
            const result = await fetchWithAuth(`${API_URL}survey/submit`, {
                method: 'POST',
                body: JSON.stringify(responses),
            });
            alert('설문이 성공적으로 제출되었습니다!');
            // 여기에 추천 결과를 처리하는 로직을 추가할 수 있습니다.
            console.log('추천 결과:', result);
        } catch (error) {
            console.error('설문 제출 오류:', error);
            alert('설문 제출에 실패했습니다. 다시 시도해주세요.');
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
    }

    if (error) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography color="error">{error}</Typography></Box>;
    }

    if (!categories || categories.length === 0) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography>설문 카테고리를 불러올 수 없습니다.</Typography></Box>;
    }

    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = questions.filter(q => q.category_id === currentCategory.id);

    return (
        <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>
                {currentCategory.name}
            </Typography>
            {categoryQuestions.map((question) => (
                <Box key={question.id} sx={{ marginBottom: '20px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '10px' }}>
                        {question.question_text}
                    </Typography>
                    {renderQuestionInput(question, handleResponseChange, handleMultipleChoiceChange)}
                </Box>
            ))}
            <Button variant="contained" color="primary" onClick={handleNextCategory}>
                {currentCategoryIndex < categories.length - 1 ? '다음' : '제출'}
            </Button>
        </Box>
    );
};

const renderQuestionInput = (question, handleResponseChange, handleMultipleChoiceChange) => {
    switch (question.question_type) {
        case 'TEXT':
            return <TextField fullWidth variant="outlined" onChange={(e) => handleResponseChange(question.id, e.target.value)} />;
        case 'NUMBER':
            return <TextField fullWidth type="number" variant="outlined" onChange={(e) => handleResponseChange(question.id, e.target.value)} />;
        case 'SINGLE_CHOICE':
            return (
                <RadioGroup onChange={(e) => handleResponseChange(question.id, e.target.value)}>
                    {question.options.map((option) => (
                        <FormControlLabel key={option.id} value={option.id.toString()} control={<Radio />} label={option.option_text} />
                    ))}
                </RadioGroup>
            );
        case 'MULTIPLE_CHOICE':
            return question.options.map((option) => (
                <FormControlLabel
                    key={option.id}
                    control={<Checkbox onChange={() => handleMultipleChoiceChange(question.id, option.id)} />}
                    label={option.option_text}
                />
            ));
        default:
            return null;
    }
};

export default RecommendationPage;
