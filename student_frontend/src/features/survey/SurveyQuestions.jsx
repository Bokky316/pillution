import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../component/common/Button';
import Card from '../../component/common/Card';

const questions = [
  { id: 1, text: "평소 피로감을 자주 느끼시나요?", options: ["예", "아니오"] },
  { id: 2, text: "스트레스를 많이 받는 편인가요?", options: ["예", "아니오"] },
  { id: 3, text: "하루 운동 시간이 30분 이상인가요?", options: ["예", "아니오"] },
];

const SurveyQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate('/survey/results', { state: { answers } });
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">질문 {currentQuestion + 1} / {questions.length}</h2>
      <Card>
        <p>{questions[currentQuestion].text}</p>
        {questions[currentQuestion].options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(option)}
            className={answers[questions[currentQuestion].id] === option ? 'selected' : ''}
          >
            {option}
          </Button>
        ))}
        <Button onClick={handleNext} disabled={!answers[questions[currentQuestion].id]}>
          {currentQuestion < questions.length - 1 ? '다음' : '결과 보기'}
        </Button>
      </Card>
    </div>
  );
};

export default SurveyQuestions;
