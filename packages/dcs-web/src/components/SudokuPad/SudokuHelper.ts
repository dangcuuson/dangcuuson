import { SudokuGrid } from './SudokuTypes';

export function createEmptyGrid(): SudokuGrid {
    return Array(9).fill(0).map(row => Array(9).fill(0));
}

export function parseGrid(value: string): SudokuGrid | null {
    const digits = (value || '').replace(/[^0-9]/g, '');
    if (digits.length === 81) {
        return Array(9).fill(0).map((zero, row) => {
            return digits.slice(row * 9, row * 9 + 9).split('').map(digit => +digit);
        });
    }
    return null;
}