export type SudokuGrid = number[][];
export type PencilMark = { row: number; col: number, box: number; candidates: number[] };
export type GridPosition = { row: number; col: number };

export type CellHighlight = {
    row: number;
    col: number;
    color: 'red' | 'green';
}
export type SolveStep = {
    grid: SudokuGrid;
    pMarks?: PencilMark[];
    comment?: string;
    highlights?: CellHighlight[];
}