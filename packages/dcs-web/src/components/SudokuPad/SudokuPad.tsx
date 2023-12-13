import React from 'react';
import './SudokuPad.css';
import { GridPosition, SolveStep, SudokuGrid } from './SudokuTypes';
import { useTheme } from '@emotion/react';
import { alpha, colors } from '@mui/material';

type SudokuColorPalette = {
    grid: string;
    originalValue: string;
    userInputValue: string;
    pencilMark: string;
    activeCellStroke: string;
    activeCellFill: string;

    hlRed: string;
    hlGreen: string;
}
const useSudokuColorPalette = (): SudokuColorPalette => {
    const { palette } = useTheme();
    const { augmentColor, mode } = palette;
    const grey = augmentColor({ color: colors.grey });
    const red = augmentColor({
        color: {
            main: colors.red[200]
        }
    });
    const green = augmentColor({
        color: {
            main: colors.green[200]
        }
    });
    const blue = augmentColor({
        color: {
            main: colors.blue[600]
        }
    });

    return {
        grid: mode === 'dark' ? grey.dark : grey.contrastText,
        originalValue: mode === 'dark' ? grey.light : grey.contrastText,
        userInputValue: mode === 'dark' ? blue.dark : blue.light,

        pencilMark: mode === 'dark' ? alpha(grey.light, 0.8) : grey.dark,

        activeCellStroke: mode === 'dark' ? blue.dark : blue.light,
        activeCellFill: mode === 'dark' ? alpha(grey.dark, 0.5) : grey.light,

        hlRed: mode === 'dark' ? red.dark : red.light,
        hlGreen: mode === 'dark' ? green.dark : green.light,
    }
}

type InteractiveProps = {
    selectedCell: GridPosition | null;
    setSelectedCell: React.Dispatch<React.SetStateAction<GridPosition>>
}

interface Props {
    originGrid: SudokuGrid;
    currentStep?: SolveStep;
    interactive?: InteractiveProps;
}

const SudokuPad: React.FC<Props> = ({ originGrid, currentStep, interactive }) => {
    const sudokuColors = useSudokuColorPalette();

    const cellSize = 64;
    const margin = 8;
    const svgSize = cellSize * 9 + margin * 2;
    const gridSize = cellSize * 9;

    const getInnerGridCommand = () => {
        const commands: string[] = [];
        for (let i = 1; i < 9; i++) {
            const offset = cellSize * i;
            commands.push(`M0 ${offset} H${gridSize}`);
            commands.push(`M${offset} 0 V${gridSize}`);
        }
        return commands.join(' ');
    }
    const getOuterGridCommand = () => {
        const commands: string[] = [];
        for (let i = 0; i <= 3; i++) {
            const offset = cellSize * i * 3;
            commands.push(`M0 ${offset} H${gridSize}`);
            commands.push(`M${offset} 0 V${gridSize}`);
        }
        return commands.join(' ');
    }
    const drawGridValues = () => {
        const flattenOriginGrid = originGrid.flatMap(v => v);
        const grid = currentStep ? currentStep.grid : originGrid;
        const flattenGrid = grid.flatMap(v => v);

        return flattenGrid
            .map((val, index) => {
                if (val === 0) {
                    return null;
                }
                const isOrigin = !!flattenOriginGrid[index];
                const row = Math.floor(index / 9);
                const col = index % 9;
                return (
                    <text
                        key={index}
                        fill={!isOrigin ? sudokuColors.userInputValue : undefined}
                        x={(col + 0.5) * cellSize}
                        y={(row + 0.5) * cellSize}
                        children={val}
                    />
                )
            })
            .filter(v => !!v);
    }
    const drawHighlights = () => {
        const highlights = currentStep?.highlights || [];
        return highlights.map((hl, index) => {
            const x = hl.col * cellSize;
            const y = hl.row * cellSize;
            const getHlColor = () => {
                if (hl.color === 'red') {
                    return sudokuColors.hlRed;
                }
                if (hl.color === 'green') {
                    return sudokuColors.hlGreen;
                }
                return hl.color;
            }
            return (
                <path
                    key={index}
                    fill={getHlColor()}
                    d={`M${x} ${y} h${cellSize} v${cellSize} h${-cellSize} v${-cellSize}`}
                />
            )
        })
    }

    const drawPencilMarks = () => {
        const pencilMarks = currentStep?.pMarks || [];
        return pencilMarks.map((pMark, index) => {
            const xOrigin = pMark.col * cellSize;
            const yOrigin = pMark.row * cellSize;
            return (
                <g key={index} fill={sudokuColors.pencilMark}>
                    {pMark.candidates.map(candidate => {
                        const xOffset = (0.5 + ((candidate - 1) % 3)) * (cellSize / 3);
                        const yOffset = (0.5 + Math.floor((candidate - 1) / 3)) * (cellSize / 3);
                        return (
                            <text
                                x={xOrigin + xOffset}
                                y={yOrigin + yOffset}
                                key={candidate}
                                children={candidate}
                            />
                        )
                    })}
                </g>
            )
        })
    }

    const drawInteractives = () => {
        if (!interactive) {
            return null;
        }
        const interactives: React.ReactNode[] = [];
        // cell to listen to user input event
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                interactives.push(
                    <rect
                        key={`r${row}c${col}`}
                        width={cellSize}
                        height={cellSize}
                        x={col * cellSize}
                        y={row * cellSize}
                        fill='rgba(0,0,0,0)'
                        stroke='none'
                        onMouseDown={() => interactive.setSelectedCell({ row, col })}
                        onTouchStart={() => interactive.setSelectedCell({ row, col })}
                    />
                )
            }
        }
        if (interactive.selectedCell) {
            const { row, col } = interactive.selectedCell;
            const x = col * cellSize;
            const y = row * cellSize;
            interactives.push(
                <path
                    key="selected-cell"
                    d={`M${x} ${y} h${cellSize} v${cellSize} h${-cellSize} v${-cellSize}`}
                    stroke={sudokuColors.activeCellStroke}
                    strokeWidth="4"
                    fill={sudokuColors.activeCellFill}
                />
            )
        }
        return interactives;
    }
    return (
        <svg
            className="sudoku-pad"
            width={svgSize}
            height={svgSize}
            viewBox={`-${margin} -${margin} ${svgSize} ${svgSize}`}
        >
            <g className='highlights'>
                {drawHighlights()}
            </g>
            <g className='pencil-marks' style={{ mixBlendMode: 'difference' }}>
                {drawPencilMarks()}
            </g>
            <g className='grids'>
                <path
                    data-type="outer-grid"
                    d={getOuterGridCommand()}
                    fill="none"
                    stroke={sudokuColors.grid}
                    strokeWidth={3}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    data-type="inner-grid"
                    d={getInnerGridCommand()}
                    fill="none"
                    stroke={sudokuColors.grid}
                    vectorEffect="non-scaling-stroke"
                />
            </g>
            <g className='grid-values' fill={sudokuColors.originalValue}>
                {drawGridValues()}
            </g>
            <g className='interactive'>
                {drawInteractives()}
            </g>
        </svg>
    )
}

export default SudokuPad;