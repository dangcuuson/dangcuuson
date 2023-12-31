import _ from 'lodash';
import { solve } from './SudokuSolver';
import { SudokuGrid } from './SudokuTypes';
import { createEmptyGrid } from './SudokuHelper';

/**
 * @param difficulty: higher = more difficult
 * @returns 
 */
export const generateGrid = (difficulty: number): SudokuGrid => {
    const emptyGrid = createEmptyGrid();
    const { multipleSolutions } = solve(emptyGrid);

    const randomGrid = multipleSolutions?.[0];
    if (!randomGrid) {
        return emptyGrid;
    }

    // try removing cells one by one. 
    // If removing cell result in multiple solution, we put the cell back
    // and reduce attempt
    // the higher the attempt, the more difficult the puzzle will be
    let attempts = [10, 20, 35, 40, 50][difficulty] || 10;
    const availableCellIndexes: number[] = _.shuffle(Array(81).fill(0).map((v, index) => index));
    while (attempts > 0 && availableCellIndexes.length > 0) {
        // Select a random cell that was not selected
        const cellIndex = availableCellIndexes.pop() || 0;

        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;

        // Remember its cell value in case we need to put it back
        const backup = randomGrid[row][col];
        randomGrid[row][col] = 0;
        const solveResult = solve(randomGrid, {
            // for lower difficult, do not generate one that can only be solved
            // with these high level techniques
            techniquesBan: {
                bifurcation: difficulty < 3,
                hiddenTwins: difficulty < 3,
                rowColClaim: difficulty < 2
            }
        });

        // found multiple solutions. Put the value back
        if (solveResult.multipleSolutions || !solveResult.solution) {
            randomGrid[row][col] = backup;
            attempts--;
        }
    }

    return randomGrid;
}