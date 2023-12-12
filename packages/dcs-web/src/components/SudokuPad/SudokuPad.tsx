import React from 'react';
import './SudokuPad.css';
import { SolveStep, SudokuGrid } from './SudokuTypes';
import { useTheme } from '@emotion/react';
import { colors } from '@mui/material';

type SudokuColorPalette = {
    black: string;
    red: string;
    green: string;
    blue: string;
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
        black: mode === 'dark' ? grey.dark : grey.contrastText,
        red: mode === 'dark' ? red.dark : red.light,
        green: mode === 'dark' ? green.dark : green.light,
        blue: mode === 'dark' ? blue.dark : blue.light,
    }
}

interface Props {
    originGrid: SudokuGrid;
    currentStep?: SolveStep;
}

const SudokuPad: React.FC<Props> = ({ originGrid, currentStep }) => {
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

        return flattenGrid.map((val, index) => {
            if (val === 0) {
                return null;
            }
            const isOrigin = !!flattenOriginGrid[index];
            const row = Math.floor(index / 9);
            const col = index % 9;
            return (
                <text
                    key={index}
                    fill={!isOrigin ? sudokuColors.blue : undefined}
                    x={(col + 0.5) * cellSize}
                    y={(row + 0.5) * cellSize}
                    children={val}
                />
            )
        }).filter(v => !!v);
    }
    const drawHighlights = () => {
        const highlights = currentStep?.highlights || [];
        return highlights.map((hl, index) => {
            const x = hl.col * cellSize;
            const y = hl.row * cellSize;
            const getHlColor = () => {
                if (hl.color === 'red') {
                    return sudokuColors.red;
                }
                if (hl.color === 'green') {
                    return sudokuColors.green;
                }
                if (hl.color === 'blue') {
                    return sudokuColors.blue;
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
                <g key={index}>
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
                    stroke={sudokuColors.black}
                    strokeWidth={3}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    data-type="inner-grid"
                    d={getInnerGridCommand()}
                    fill="none"
                    stroke={sudokuColors.black}
                    vectorEffect="non-scaling-stroke"
                />
            </g>
            <g className='grid-values' fill={sudokuColors.black}>
                {drawGridValues()}
            </g>
        </svg>
    )
}

export default SudokuPad;