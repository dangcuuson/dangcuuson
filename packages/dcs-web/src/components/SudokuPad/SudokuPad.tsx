import React from 'react';
import { SudokuGrid, SolveStep, solve } from './SudokuSolver';
import './SudokuPad.css';

interface Props {
    grid: SudokuGrid;
}
const SudokuPad: React.FC<Props> = (props) => {
    const [steps, setSteps] = React.useState<SolveStep[]>([]);
    React.useEffect(
        () => {
            const { steps } = solve(props.grid, { showSteps: true })
            setSteps(steps);
        },
        []
    )

    function renderGrid(grid: SudokuGrid) {
        return (
            grid.map((row, rowIndex) => {
                return (
                    <div key={rowIndex}>
                        {row.map((val, colIndex) => {
                            return (
                                <span key={colIndex}>
                                    {val}
                                </span>
                            );
                        })}
                    </div>
                )
            })
        )
    }
    return (
        <React.Fragment>
            <StepRenderer originGrid={props.grid} />
            {steps.map((step, index) => {
                return (
                    <div key={index}>
                        <div>Step #{index + 1}: {step.comment}</div>
                        <StepRenderer originGrid={props.grid} currentStep={step} />
                    </div>
                )
            })}
        </React.Fragment>
    )
}

const StepRenderer: React.FC<{
    originGrid: SudokuGrid;
    currentStep?: SolveStep;
}> = ({ originGrid, currentStep }) => {
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
                    className={!isOrigin ? 'user-input' : undefined}
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
            return (
                <path
                    key={index}
                    fill={hl.color}
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
            <g className='pencil-marks'>
                {drawPencilMarks()}
            </g>
            <g className='grids'>
                <path
                    data-type="outer-grid"
                    d={getOuterGridCommand()}
                    fill="none"
                    stroke="#000"
                    strokeWidth={3}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    data-type="inner-grid"
                    d={getInnerGridCommand()}
                    fill="none"
                    stroke="#000"
                    vectorEffect="non-scaling-stroke"
                />
            </g>
            <g className='grid-values'>
                {drawGridValues()}
            </g>
        </svg>
    )
}

export default SudokuPad;