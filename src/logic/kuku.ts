export interface Problem {
  id: string;
  q: string; // e.g., "7 × 8"
  a: number; // 56
}

/**
 * Generates all 81 multiplication pairs (1x1 to 9x9).
 */
export const generateKuku = (): Problem[] => {
  const problems: Problem[] = [];
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      problems.push({
        id: `${i}-${j}`,
        q: `${i} × ${j}`,
        a: i * j,
      });
    }
  }
  return problems;
};

/**
 * Shuffles an array of problems using Fisher-Yates algorithm.
 */
export const shuffleProblems = (problems: Problem[]): Problem[] => {
  const shuffled = [...problems];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Filter problems for a specific "Dan" (e.g., all 7s).
 */
export const getDanProblems = (dan: number): Problem[] => {
  const problems: Problem[] = [];
  for (let j = 1; j <= 9; j++) {
    problems.push({
      id: `${dan}-${j}`,
      q: `${dan} × ${j}`,
      a: dan * j,
    });
  }
  return problems;
};

/**
 * Reverses the order of problems.
 */
export const reverseProblems = (problems: Problem[]): Problem[] => {
  return [...problems].reverse();
};
