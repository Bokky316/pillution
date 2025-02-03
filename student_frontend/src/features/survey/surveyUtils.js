/*
export const validateResponses = (questions, responses) => {
  console.log("Validating responses:", responses);
  for (const question of questions) {
    const response = responses[question.id];
    console.log(`Question ${question.id}:`, question.questionText, "Response:", response);

    if (response === undefined || response === null || response === '') {
      console.log(`Missing response for question ${question.id}`);
      return false;
    }

    if (Array.isArray(response) && response.length === 0) {
      console.log(`Empty array response for question ${question.id}`);
      return false;
    }
  }
  console.log("All responses are valid");
  return true;
};
*/
