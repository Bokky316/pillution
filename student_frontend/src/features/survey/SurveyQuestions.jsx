import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../component/common/Button';
import Card from '../../component/common/Card';
import { getSurveyCategories } from '../../services/api';

const SurveyQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getSurveyCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("카테고리 데이터 로딩 오류:", err);
        setError("설문 데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      navigate('/survey/results', { state: { responses } });
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!categories.length) return <div>설문 데이터가 없습니다.</div>;

  const currentCategory = categories[currentCategoryIndex];

  return (
    <div className="section">
      <h2 className="section-title">{currentCategory.name}</h2>
      <Card>
        {currentCategory.subCategories.map(subCategory => (
          <div key={subCategory.id}>
            <h3>{subCategory.name}</h3>
            {subCategory.questions.map(question => (
              <div key={question.id}>
                <p>{question.questionText}</p>
                {question.questionType === 'SINGLE_CHOICE' && (
                  <div>
                    {question.options.map(option => (
                      <Button
                        key={option.id}
                        onClick={() => handleResponseChange(question.id, option.id)}
                        className={responses[question.id] === option.id ? 'selected' : ''}
                      >
                        {option.optionText}
                      </Button>
                    ))}
                  </div>
                )}
                {/* 다른 질문 유형에 대한 처리 추가 */}
              </div>
            ))}
          </div>
        ))}
        <Button onClick={handleNext}>
          {currentCategoryIndex < categories.length - 1 ? '다음' : '결과 보기'}
        </Button>
      </Card>
    </div>
  );
};

export default SurveyQuestions;
