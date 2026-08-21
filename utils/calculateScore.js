const calculateScore = (exam, answers) => {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let score = 0;

  answers.forEach((answer) => {
    const question = exam.questions.find(
      (q) => q._id.toString() === answer.questionId
    );

    if (!question || !answer.selectedAnswer) {
      skipped++;
      return;
    }

    if (question.correctAnswer === answer.selectedAnswer) {
      correct++;
      score += question.marks;
    } else {
      wrong++;
      score -= question.negativeMarks;
    }
  });

  const percentage = Number(
    ((score / (exam.totalQuestions || 1)) * 100).toFixed(2)
  );

  return {
    score,
    correct,
    wrong,
    skipped,
    percentage,
    passed: score >= exam.passingMarks,
  };
};

module.exports = calculateScore;