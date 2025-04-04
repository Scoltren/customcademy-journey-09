
// Utility function to calculate difficulty level based on quiz score
/**
 * Determines the appropriate difficulty level based on a user's quiz score
 * @param score The user's score in the quiz
 * @returns String representing the difficulty level (Beginner, Intermediate, or Advanced)
 */
export const calculateDifficultyLevel = (score: number): string => {
  // Assuming quiz has around 10 questions
  if (score >= 8) {
    // High scores indicate advanced skill level
    return 'Advanced';
  } else if (score >= 5) {
    // Medium scores indicate intermediate skill level
    return 'Intermediate';
  } else {
    // Low scores indicate beginner skill level
    return 'Beginner';
  }
};
