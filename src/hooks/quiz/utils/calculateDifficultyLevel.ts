
/**
 * Utility to calculate difficulty level based on score
 */
export const calculateDifficultyLevel = (score: number): string => {
  // Assuming quiz has around 10 questions
  if (score >= 8) {
    return 'Advanced';
  } else if (score >= 5) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
};
