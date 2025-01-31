export const validateResponses = (questions, responses) => {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return false;
  }
  return questions.every(question => {
    const response = responses[question.id];
    return response !== undefined && response !== null &&
           (typeof response === 'string' ? response.trim() !== '' : response.length > 0);
  });
};
