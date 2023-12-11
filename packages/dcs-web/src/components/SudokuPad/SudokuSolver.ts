import * as _ from 'lodash';
import { CellHighlight, PencilMark, SolveStep, SudokuGrid } from './SudokuPadTypes';

class MultipleSolutionsFoundError extends Error {
    constructor(public solutions: SudokuGrid[]) {
        super('Found more than one solution in the provided grid');
    }
}

const calcBoxIndex = (row: number, col: number): number => {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

const _1To9 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function buildPencilMarks(grid: SudokuGrid): PencilMark[] {
    function scanRow(grid: SudokuGrid, row: number): number[] {
        return grid[row];
    }

    function scanCol(grid: SudokuGrid, col: number): number[] {
        return grid.map(row => row[col] || 0);
    }

    function scanBox(grid: SudokuGrid, row: number, col: number): number[] {
        const groups = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        const rowGroup = groups.find(group => group.includes(row)) || [];
        const colGroup = groups.find(group => group.includes(col)) || [];
        const result: number[] = [];
        for (const r of rowGroup) {
            for (const c of colGroup) {
                result.push(grid[r][c])
            }
        };
        return result;
    }

    const pMarks: PencilMark[] = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col]) {
                continue;
            }
            const rowValues = scanRow(grid, row);
            const colValues = scanCol(grid, col);
            const boxValues = scanBox(grid, row, col);
            const allValues = [...rowValues, ...colValues, ...boxValues].filter(v => v > 0);
            const candidates = _1To9.filter(v => !allValues.includes(v));
            if (candidates.length > 0) {
                pMarks.push({
                    candidates, row, col, box: calcBoxIndex(row, col)
                })
            }
        }
    }
    return pMarks;
}

const RED = '#ef9a9a';
const GREEN = '#c5e1a5';
type SolveOptions = {
    showSteps?: boolean;
}
type SolveResult = {
    solution?: SudokuGrid;
    steps: SolveStep[];
    // in case a puzzle has more than one solution, it will output at least two examples here
    multipleSolutions?: SudokuGrid[];
}

/**
 * Solving sukodu with human readable techniques:
 * https://humage.com/blogs/basic-advanced-sudoku-elimination-techniques-to-solve-sudoku-puzzles.html
 * 
 * Only resort to brute force when all techniques are exhausted
 */
function _solve(_grid: SudokuGrid, options: SolveOptions = {}): SolveResult {
    // if checkCompletion=true, test that all value is filled
    // otherwise, just check to makre sure no duplicate and number values should be between 0-9
    const isGridValid = (grid: SudokuGrid, checkCompletion: boolean) => {
        // scan value in each row, col, box
        for (let i = 0; i < 9; i++) {
            const rowValues = grid[i];
            const colValues = grid.map(row => row[i]);

            const bRow = Math.floor(i / 3) * 3;
            const bCol = (i % 3) * 3;
            const boxValues = [
                grid[bRow][bCol], grid[bRow][bCol + 1], grid[bRow][bCol + 2],
                grid[bRow + 1][bCol], grid[bRow + 1][bCol + 1], grid[bRow + 1][bCol + 2],
                grid[bRow + 2][bCol], grid[bRow + 2][bCol + 1], grid[bRow + 2][bCol + 2],
            ];

            const valuesSets = [rowValues, colValues, boxValues];
            const allSetOk = valuesSets.every(numSet => {
                if (checkCompletion) {
                    return numSet.length === 9 && _.difference(_1To9, numSet).length === 0;
                } else {
                    const non0Values = numSet.filter(v => v !== 0);
                    const uniqNon0Val = _.uniq(non0Values);
                    return non0Values.every(v => v > 0 && v < 10) && non0Values.length === uniqNon0Val.length;
                }
            });
            if (!allSetOk) {
                return false;
            }
        }
        return true;
    }
    if (!isGridValid(_grid, false)) {
        return { steps: [] }
    }


    // copy grid/pencil mark to a new memory space so that further grid modification does not change old value
    function copyGrid(oldGrid: SudokuGrid) {
        return _.cloneDeep(oldGrid);
    }
    function copyPMarks(oldPMarks: PencilMark[]) {
        return _.cloneDeep(oldPMarks);
    }

    const steps: SolveStep[] = [];
    function addStep(step: SolveStep) {
        if (!options.showSteps) {
            return;
        }
        steps.push({
            ...step,
            grid: copyGrid(step.grid),
            pMarks: copyPMarks(step.pMarks)
        });
    }

    const grid = copyGrid(_grid);
    let pMarks = buildPencilMarks(grid);

    type DigitPlacement = {
        value: number;
        row: number;
        col: number;
        box: number;
    }
    // place digits into grid and update pencil makrs
    function placeDigits(placements: DigitPlacement[]) {
        for (const { value, col, row, box } of placements) {
            grid[row][col] = value;
            pMarks = pMarks
                .map(pMark => {
                    // remove candidate value from pencil mark of same row/col/box
                    if (pMark.row === row || pMark.col === col || pMark.box === box) {
                        return {
                            ...pMark,
                            candidates: pMark.candidates.filter(c => c !== value)
                        }
                    }
                    return pMark;
                })
                // remove the pencil mark of filled digit
                .filter(pMark => {
                    if (pMark.row === row && pMark.col === col) {
                        return false;
                    }
                    return true;
                })
        }
    }

    /**
     * remove candidate values of existing pencil marks from a set (row/col/box)
     */
    function removePencilMarksDigits(args: {
        digitsToRemove: number[];
        location: 'row' | 'column' | 'box'
        locIndex: number[],
        pMarksWhiteList: PencilMark[]
    }): { removed: PencilMark[]; oldPMarks: PencilMark[] } {
        const { digitsToRemove, location, locIndex, pMarksWhiteList } = args;
        // make a copy of current pMarks for steps visualisation
        // do not need to cloneDeep if not showing steps
        const oldPMarks = !options.showSteps ? pMarks : _.cloneDeep(pMarks);

        const candidateRemoved: PencilMark[] = [];
        pMarks.forEach(pMark => {
            if (pMarksWhiteList.includes(pMark)) {
                return;
            }
            const checkLocation = () => {
                if (location === 'row') {
                    return locIndex.includes(pMark.row);
                }
                if (location === 'column') {
                    return locIndex.includes(pMark.col);
                }
                if (location === 'box') {
                    return locIndex.includes(pMark.box);
                }
            }
            if (checkLocation()) {
                const removedCandidates = _.difference(pMark.candidates, digitsToRemove);
                if (removedCandidates.length < pMark.candidates.length) {
                    candidateRemoved.push(pMark);
                }
                pMark.candidates = removedCandidates;
            }
        })

        return { removed: candidateRemoved, oldPMarks };
    }

    addStep({ comment: 'Fill in pencil marks', grid, pMarks });

    function applyTechniques() {

        // technique names come from
        // https://humage.com/blogs/basic-advanced-sudoku-elimination-techniques-to-solve-sudoku-puzzles.html
        function onlyCandidate(): boolean {
            const singleCandidates = pMarks.filter(p => p.candidates.length === 1);
            if (singleCandidates.length === 0) {
                return false;
            }
            addStep({
                comment: `Found single candidate(s)`,
                grid,
                pMarks,
                highlights: singleCandidates.map(sc => ({
                    row: sc.row, col: sc.col, color: GREEN
                }))
            });
            const placements = singleCandidates.map<DigitPlacement>(sc => ({
                value: sc.candidates[0],
                row: sc.row,
                box: sc.box,
                col: sc.col
            }))
            placeDigits(placements);
            return true;
        }

        function getPMarksOfRow(pMarks: PencilMark[], row: number) {
            return pMarks.filter(mark => mark.row === row);
        }

        function getPMarksOfCol(pMarks: PencilMark[], col: number) {
            return pMarks.filter(mark => mark.col === col);
        }

        function getPMarksOfBox(pMarks: PencilMark[], box: number) {
            return pMarks.filter(mark => mark.box === box);
        }

        type PMarksSet = {
            pMarks: PencilMark[];
            location: 'row' | 'column' | 'box',
            locIndex: number;
        }
        const printSetLocation = (set: PMarksSet) => {
            return `${set.location} ${set.locIndex + 1}`
        }
        function loner(): boolean {
            for (const pMark of pMarks) {
                const rowSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfRow(pMarks, pMark.row),
                    location: 'row',
                    locIndex: pMark.row,
                });
                const colSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfCol(pMarks, pMark.col),
                    location: 'column',
                    locIndex: pMark.col,
                });
                const boxSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfBox(pMarks, pMark.box),
                    location: 'box',
                    locIndex: pMark.box
                });
                for (const candidateValue of pMark.candidates) {
                    const pMarksSets = [boxSet, rowSet, colSet];
                    for (const pMarkSetGetter of pMarksSets) {
                        const pMarksSet = pMarkSetGetter();
                        const setTest = pMarksSet.pMarks.filter(pMark => pMark.candidates.includes(candidateValue));
                        if (setTest.length === 1) {
                            const { row, col, box } = setTest[0];
                            addStep({
                                comment: `Where can ${candidateValue} be placed in ${printSetLocation(pMarksSet)}?`,
                                grid,
                                pMarks,
                                highlights: pMarksSet.pMarks.map(pMark => ({
                                    row: pMark.row,
                                    col: pMark.col,
                                    color: pMark.row === row && pMark.col === col ? GREEN : RED,
                                    pMark: (pMark.row === row && pMark.col === col)
                                        ? [{ type: 'circle', value: candidateValue }]
                                        : undefined
                                }))
                            });

                            placeDigits([{ value: candidateValue, row, col, box }]);
                            return true;
                        }
                    }

                }
            }
            return false;
        }

        function hiddenTwins(): boolean {
            // similar to loner, but instead of placing digits, we can only remove related candidates
            for (let i = 0; i < 9; i++) {
                const rowSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfRow(pMarks, i),
                    location: 'row',
                    locIndex: i,
                });
                const colSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfCol(pMarks, i),
                    location: 'column',
                    locIndex: i
                });
                const boxSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfBox(pMarks, i),
                    location: 'box',
                    locIndex: i
                });
                const pMarksSets = [boxSet, rowSet, colSet];
                for (const pMarksSetGetter of pMarksSets) {
                    const pMarksSet = pMarksSetGetter();
                    if (pMarksSet.pMarks.length <= 2) {
                        continue;
                    }
                    const flattenUniqCandidates = _.uniq(_.flatMap(pMarksSet.pMarks, pMark => pMark.candidates));
                    // pick 2 number of flatten uniq candidates
                    const cLength = flattenUniqCandidates.length;
                    for (let i = 0; i < cLength - 1; i++) {
                        for (let j = i + 1; j < cLength; j++) {
                            const digit1 = flattenUniqCandidates[i];
                            const digit2 = flattenUniqCandidates[j];
                            const setTest = pMarksSet.pMarks.filter(pMark => {
                                return pMark.candidates.includes(digit1) || pMark.candidates.includes(digit2);
                            });
                            if (setTest.length === 2) {
                                // check if we can remove digit1 or digit2 from pMarksSet
                                const { removed, oldPMarks } = removePencilMarksDigits({
                                    digitsToRemove: [digit1, digit2],
                                    location: pMarksSet.location,
                                    locIndex: [pMarksSet.locIndex],
                                    pMarksWhiteList: setTest
                                });
                                if (removed.length > 0) {
                                    addStep({
                                        comment: `Where can ${digit1} and ${digit2} be placed in ${printSetLocation(pMarksSet)}?`,
                                        grid,
                                        pMarks: oldPMarks,
                                        highlights: [
                                            ...setTest.map<CellHighlight>(pMark => ({
                                                col: pMark.col,
                                                row: pMark.row,
                                                color: GREEN
                                            })),
                                            ...removed.map<CellHighlight>(pMark => ({
                                                col: pMark.col,
                                                row: pMark.row,
                                                color: RED
                                            }))
                                        ]
                                    })
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

        // generic solution for naked twin/triplets
        function nakedGroups(): boolean {
            for (let i = 0; i < 9; i++) {
                const rowSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfRow(pMarks, i),
                    location: 'row',
                    locIndex: i,
                });
                const colSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfCol(pMarks, i),
                    location: 'column',
                    locIndex: i,
                });
                const boxSet: () => PMarksSet = () => ({
                    pMarks: getPMarksOfBox(pMarks, i),
                    location: 'box',
                    locIndex: i,
                });
                const pMarksSets = [rowSet, colSet, boxSet];
                for (const pMarksSetGetter of pMarksSets) {
                    const pMarksSet = pMarksSetGetter();
                    const pMarksGroup = _.groupBy(pMarksSet.pMarks, pMark => {
                        return pMark.candidates.join(',');
                    })
                    const groupKeys = _.keys(pMarksGroup);
                    // no need to look if it's just one single group
                    if (groupKeys.length <= 1) {
                        continue;
                    }

                    for (const key of groupKeys) {
                        const group = pMarksGroup[key];
                        if (group.length <= 1) {
                            continue;
                        }

                        const groupValues = group[0].candidates;

                        const keyLength = key.split(',').length;
                        if (keyLength === group.length) {
                            // found twin/triplet/quaduplet/etc.
                            // now try removes group from other pencil mark in the same set
                            const { oldPMarks, removed } = removePencilMarksDigits({
                                digitsToRemove: groupValues,
                                location: pMarksSet.location,
                                locIndex: [pMarksSet.locIndex],
                                pMarksWhiteList: group
                            });
                            if (removed.length > 0) {
                                addStep({
                                    comment: `Found common digits ${groupValues.join(',')} in ${printSetLocation(pMarksSet)}`,
                                    grid,
                                    pMarks: oldPMarks,
                                    highlights: [
                                        ...group.map<CellHighlight>(pMark => ({
                                            col: pMark.col,
                                            row: pMark.row,
                                            color: GREEN
                                        })),
                                        ...removed.map<CellHighlight>(pMark => ({
                                            col: pMark.col,
                                            row: pMark.row,
                                            color: RED
                                        }))
                                    ]
                                })
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        // go through each box and check if a candidate only appear in a row/column
        // then elimiate candidates from same row/column
        function boxClaim(): boolean {
            for (let i = 0; i < 9; i++) {
                const boxSet: PMarksSet = {
                    pMarks: getPMarksOfBox(pMarks, i),
                    location: 'box',
                    locIndex: i,
                };
                for (let digit = 1; digit <= 9; digit++) {
                    // check if digit is only in a row or column
                    const pMarksOfDigit = boxSet.pMarks.filter(pMark => pMark.candidates.includes(digit));
                    const rows = _.uniq(pMarksOfDigit.map(pMark => pMark.row));
                    const cols = _.uniq(pMarksOfDigit.map(pMark => pMark.col));
                    if (rows.length === 1 || cols.length === 1) {
                        // all digits are in same row/col. Try to remove digits from this row/col
                        const location = rows.length === 1 ? 'row' : 'column';
                        const locIndex = rows.length === 1 ? rows[0] : cols[0];
                        const { removed, oldPMarks } = removePencilMarksDigits({
                            digitsToRemove: [digit],
                            location,
                            locIndex: [locIndex],
                            pMarksWhiteList: boxSet.pMarks
                        });
                        if (removed.length > 0) {
                            addStep({
                                comment: `In box ${i + 1}, digit ${digit} only appear in ${location} ${locIndex + 1}`,
                                pMarks: oldPMarks,
                                grid,
                                highlights: [
                                    ...boxSet.pMarks
                                        .filter(pMark => pMark.candidates.includes(digit))
                                        .map<CellHighlight>(pMark => ({
                                            col: pMark.col,
                                            row: pMark.row,
                                            color: GREEN
                                        })),
                                    ...removed.map<CellHighlight>(pMark => ({
                                        col: pMark.col,
                                        row: pMark.row,
                                        color: RED
                                    }))
                                ]
                            })
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        // pick 2 out of 3 boxes of same row/col
        // if selected boxes contain a digits that are both belong to the same row/col
        // then eliminate digits of the remaining box of the row/col
        function rowColClaim(): boolean {
            type BoxConfig = {
                boxes: [number, number],
                targetBox: number
            }
            const hBoxesConfigs: BoxConfig[] = [
                { boxes: [0, 1], targetBox: 2 },
                { boxes: [0, 2], targetBox: 1 },
                { boxes: [1, 2], targetBox: 0 },
            ];

            const vBoxesConfigs: BoxConfig[] = [
                { boxes: [0, 3], targetBox: 6 },
                { boxes: [0, 6], targetBox: 3 },
                { boxes: [3, 6], targetBox: 0 }
            ];
            const offsetConfig = (bc: BoxConfig, offset: number): BoxConfig => {
                return {
                    boxes: [bc.boxes[0] + offset, bc.boxes[1] + offset],
                    targetBox: bc.targetBox + offset
                };
            };
            const offsetConfigs = (bcs: BoxConfig[], offset: number): BoxConfig[] => {
                return bcs.map(bc => offsetConfig(bc, offset));
            };
            // add 3/6 to horizontal boxes, and 1/2 to vertical boxes
            const boxesConfigs = [
                ...[0, 3, 6].flatMap(offset => offsetConfigs(hBoxesConfigs, offset)),
                ...[0, 1, 2].flatMap(offset => offsetConfigs(vBoxesConfigs, offset))
            ];
            for (const config of boxesConfigs) {
                const box1Index = config.boxes[0];
                const box2Index = config.boxes[1];
                const box1Set = getPMarksOfBox(pMarks, box1Index);
                const box2Set = getPMarksOfBox(pMarks, box2Index);
                for (let digit = 1; digit <= 9; digit++) {
                    const box1SetWithDigit = box1Set.filter(pMarks => pMarks.candidates.includes(digit));
                    const box2SetWithDigit = box2Set.filter(pMarks => pMarks.candidates.includes(digit));

                    const checkRowCol = (location: 'row' | 'column'): boolean => {
                        const getLocIndex = (pMark: PencilMark) => {
                            if (location === 'row') {
                                return pMark.row;
                            }
                            if (location === 'column') {
                                return pMark.col;
                            }
                            return -1;
                        }
                        const box1LocIndex = _.uniq(box1SetWithDigit.map(getLocIndex));
                        const box2LocIndex = _.uniq(box2SetWithDigit.map(getLocIndex));

                        if (box1LocIndex.length === 2 &&
                            box2LocIndex.length === 2 &&
                            _.difference(box1LocIndex, box2LocIndex).length === 0
                        ) {
                            // try eliminate digits from target box
                            const { removed, oldPMarks } = removePencilMarksDigits({
                                digitsToRemove: [digit],
                                location,
                                locIndex: box1LocIndex,
                                pMarksWhiteList: [
                                    ...box1Set,
                                    ...box2Set
                                ]
                            });

                            if (removed.length > 0) {
                                addStep({
                                    comment: `In box ${box1Index + 1} and box ${box2Index + 1}, digit ${digit} appears `
                                        + `in ${location} ${box1LocIndex[0]} and ${box1LocIndex[1]}. `
                                        + `Therefore we can elimiate ${digit} in those ${location}s in box ${config.targetBox + 1}`,
                                    grid,
                                    pMarks: oldPMarks,
                                    highlights: [
                                        ...[...box1SetWithDigit, ...box2SetWithDigit]
                                            .filter(pMark => pMark.candidates.includes(digit))
                                            .map<CellHighlight>(pMark => ({
                                                col: pMark.col,
                                                row: pMark.row,
                                                color: GREEN
                                            })),
                                        ...removed.map<CellHighlight>(pMark => ({
                                            col: pMark.col,
                                            row: pMark.row,
                                            color: RED
                                        }))
                                    ]
                                })
                                return true;
                            }
                        }
                        return false;
                    }

                    const rowRemoved = checkRowCol('row');
                    if (!rowRemoved) {
                        const colRemoved = checkRowCol('column');
                        if (colRemoved) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        function bifurcation(): boolean {
            const testPMark = _.minBy(pMarks, pMark => pMark.candidates.length);
            if (testPMark) {
                const solutionsFound: SudokuGrid[] = [];
                // try filling the grid with one the candidate
                for (const value of testPMark.candidates) {
                    const testGrid = copyGrid(grid);
                    testGrid[testPMark.row][testPMark.col] = value;
                    const result = _solve(testGrid, { showSteps: false });
                    if (result.multipleSolutions) {
                        throw new MultipleSolutionsFoundError(result.multipleSolutions);
                    } else if (!result.solution) {
                        addStep({
                            grid,
                            pMarks,
                            comment:
                                `Using bifurcation, putting ${value} in row ${testPMark.row + 1}, column ${testPMark.col + 1} lead to an invalid solution.`,
                            highlights: [{ col: testPMark.col, row: testPMark.row, color: RED }]
                        })
                        testPMark.candidates = testPMark.candidates.filter(v => v !== value);
                        return true;
                    } else {
                        // found more than 1 valid solution => stop
                        solutionsFound.push(result.solution);
                        if (solutionsFound.length >= 2) {
                            throw new MultipleSolutionsFoundError(solutionsFound);
                        }
                    }
                }
            }

            return false;
        }


        let updated = false;
        do {
            const techniques = [
                onlyCandidate,
                loner,
                nakedGroups,
                hiddenTwins,
                boxClaim,
                rowColClaim,
                bifurcation
            ];
            for (const technique of techniques) {
                updated = technique();
                if (updated) {
                    break;
                }
            }
        } while (updated)
    }

    applyTechniques();

    if (!isGridValid(grid, true)) {
        return { steps };
    }

    return {
        solution: grid,
        steps
    }
}

export function solve(_grid: SudokuGrid, options: SolveOptions = {}): SolveResult {
    try {
        return _solve(_grid, options);
    } catch (err) {
        if (err instanceof MultipleSolutionsFoundError) {
            return { multipleSolutions: err.solutions, steps: [] }
        } else {
            console.error(err);
            return { steps: [] };
        }
    }
}