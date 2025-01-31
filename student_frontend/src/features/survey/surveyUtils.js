export const validateResponses = (questions, responses) => {
  return questions.every(question => {
    const response = responses[question.id];
    return response !== undefined && response !== null &&
           (typeof response === 'string' ? response.trim() !== '' : response.length > 0);
  });
};
