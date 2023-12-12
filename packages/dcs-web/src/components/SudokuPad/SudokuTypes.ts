export type SudokuGrid = number[][];
export type PencilMark = { row: number; col: number, box: number; candidates: number[] };

export type CellHighlight = {
    row: number;
    col: number;
    color: 'red' | 'green' | 'blue';
    pMark?: PencilMarkHighlight[];
}
type PencilMarkHighlight = {
    value: number;
    type: 'circle' | 'cross';
}
export type SolveStep = {
    grid: SudokuGrid;
    pMarks: PencilMark[];
    comment: string;
    highlights?: CellHighlight[];
}