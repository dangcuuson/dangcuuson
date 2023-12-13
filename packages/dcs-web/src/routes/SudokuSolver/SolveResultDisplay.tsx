import React from 'react';
import { SolveResult } from '../../components/SudokuPad/SudokuSolver';
import { Box, Button, IconButton, Typography } from '@mui/material';
import SudokuPad from '../../components/SudokuPad/SudokuPad';
import { SudokuGrid } from '../../components/SudokuPad/SudokuTypes';
import { useDerivedState } from '../../utils/hooks';
import NextIcon from '@mui/icons-material/SkipNext';
import PrevIcon from '@mui/icons-material/SkipPrevious';

interface Props {
    originGrid: SudokuGrid;
    result: SolveResult;
}

function maybe<T>(val: T): T | undefined {
    return val;
}

const SolveResultDisplay: React.FC<Props> = ({ result, originGrid }) => {
    const [stepIndex, setStepIndex] = useDerivedState(
        () => result.steps.length,
        [result.steps.length]
    )
    if (result.multipleSolutions) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Typography color="text.primary" variant="h4">Found multiple solutions</Typography>
                <Typography color="text.secondary" variant="h6">Sudoku puzzles should have only one solution</Typography>
                <Box display="flex" alignItems="center">
                    {result.multipleSolutions.map((solutionGrid, index) => {
                        return (
                            <Box key={index} display="flex" flexDirection="column" alignItems="center">
                                <SudokuPad originGrid={originGrid} currentStep={{ grid: solutionGrid }} />
                                <Typography color="text.secondary" variant="h6" children={`Solution ${index + 1}`} />
                            </Box>
                        )
                    })}
                </Box>
            </Box>
        )
    }
    if (!result.solution) {
        return (
            <Box textAlign="center">
                <Typography color="text.primary" variant="h4">{"No solution found :("}</Typography>
                <Typography color="text.secondary">Please make sure the puzzle is a valid Sudoku puzzle</Typography>
            </Box>
        )
    }
    const curStep = maybe(result.steps[stepIndex]);
    const comment = !curStep ? "Here's the final solution" : `Step ${stepIndex + 1}: ${curStep.comment}`;
    return (
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography variant="h4" color="text.primary">{comment}</Typography>
            <Typography variant="h6" color="text.secondary">Use the control below to see the solving steps</Typography>
            <SudokuPad
                originGrid={originGrid}
                currentStep={curStep || {
                    grid: result.solution
                }}
            />
            <Box display="flex" alignItems="center">
                <Button
                    children="Go to first step"
                    onClick={() => setStepIndex(0)}
                />
                <IconButton
                    size='large'
                    disabled={stepIndex <= 0}
                    children={<PrevIcon />}
                    onClick={() => setStepIndex(stepIndex - 1)}
                />
                <IconButton
                    size='large'
                    disabled={stepIndex >= result.steps.length}
                    children={<NextIcon />}
                    onClick={() => setStepIndex(stepIndex + 1)}
                />
                <Button
                    children="View final solution"
                    onClick={() => setStepIndex(result.steps.length)}
                />
            </Box>
        </Box>

    )
};

export default SolveResultDisplay;