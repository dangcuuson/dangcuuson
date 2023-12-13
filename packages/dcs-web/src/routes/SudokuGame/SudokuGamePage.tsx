import { Box, Button, Rating, Typography } from '@mui/material';
import React from 'react';
import GoBackIcon from '@mui/icons-material/KeyboardReturn';
import { PencilMark, SolveStep, SudokuGrid } from '../../components/SudokuPad/SudokuTypes';
import { useLocalStorage } from '../../utils/hooks';
import _ from 'lodash';
import { useNavigate } from 'react-router';
import { generateGrid } from '../../components/SudokuPad/SudokuGenerator';
import SudokuPadInteractive from '../../components/SudokuPad/SudokuPadInteractive';
import { hasNumArrField, hasNumField, makeArr } from '../../utils/dataUtils';
import confetti from 'canvas-confetti';
import { solve } from '../../components/SudokuPad/SudokuSolver';
import { createEmptyGrid, parseGrid } from '../../components/SudokuPad/SudokuHelper';

const SudokuPage: React.FC<{}> = () => {
    const navigate = useNavigate();
    const [originGrid, setOriginGrid] = useLocalStorage<SudokuGrid | null>({
        key: 'sudoku_game_origin_grid',
        getInitValue: (value) => {
            return parseGrid(value || '');
        },
        stringify: grid => !grid ? '' : grid.join(',')
    });
    const [difficulty, setDifficulty] = React.useState(0);

    return (
        <Box id="game-page" textAlign="center" width="100%">
            <Box display="flex" justifyContent="flex-start" width="100%">
                <Button
                    variant="text"
                    startIcon={<GoBackIcon />}
                    children="Back"
                    onClick={() => {
                        if (originGrid) {
                            setOriginGrid(null);
                        } else {
                            navigate('/');
                        }
                    }}
                />
            </Box>
            {!originGrid && (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h3" color="text.primary">Select difficulty</Typography>
                    <Rating
                        value={difficulty}
                        onChange={(e, newDifficulty) => setDifficulty(newDifficulty ?? 0)}
                        size="large"
                        sx={{ fontSize: '5rem' }}
                    />
                    <Typography variant="h4" color="text.secondary">
                        {(['Easy', 'Medium', 'Hard', 'Expert', 'Master'][difficulty - 1] || '')}&nbsp;
                    </Typography>
                    <Box marginTop={3} width="100%">
                        <Button
                            variant="contained" color="primary" size="large" fullWidth={true}
                            onClick={() => {
                                setOriginGrid(generateGrid(difficulty - 1));
                                localStorage.removeItem(SUDOKU_GAME_CURRENT_GRID);
                                localStorage.removeItem(SUDOKU_GAME_PENCIL_MARKS);
                            }}
                        >
                            <Typography variant="h6">Start</Typography>
                        </Button>
                    </Box>
                </Box>
            )}
            {!!originGrid && (
                <SudokuGamePageInner originGrid={originGrid} />
            )}
        </Box>
    )
}

const SUDOKU_GAME_CURRENT_GRID = 'sudoku_game_current_grid';
const SUDOKU_GAME_PENCIL_MARKS = 'sudoku_game_pencil_marks';

interface InnerProps {
    originGrid: SudokuGrid
}
const SudokuGamePageInner: React.FC<InnerProps> = ({ originGrid }) => {
    const correctGrid = React.useMemo(
        () => {
            return solve(originGrid).solution || [];
        },
        [originGrid]
    );
    const [hintStepIndex, setHintStepIndex] = React.useState(-1);
    const [hintSteps, setHintSteps] = React.useState<SolveStep[]>([]);
    const [currentGrid, setCurrentGrid] = useLocalStorage<SudokuGrid>({
        key: SUDOKU_GAME_CURRENT_GRID,
        getInitValue: (value) => {
            return parseGrid(value || '') || _.cloneDeep(originGrid);
        },
        stringify: grid => grid.join(',')
    });

    const [pencilMarks, setPencilMarks] = useLocalStorage<PencilMark[]>({
        key: SUDOKU_GAME_PENCIL_MARKS,
        stringify: pMarks => JSON.stringify(pMarks),
        getInitValue: (value) => {
            try {
                return makeArr<PencilMark>({
                    value: JSON.parse(value || ''),
                    itemRestore: (testItem) => {
                        const keys: { [K in keyof PencilMark]: K } = {
                            box: 'box',
                            candidates: 'candidates',
                            col: 'col',
                            row: 'row'
                        };
                        if (
                            hasNumField(testItem, keys.box) &&
                            hasNumField(testItem, keys.row) &&
                            hasNumField(testItem, keys.col) &&
                            hasNumArrField(testItem, keys.candidates)
                        ) {
                            return testItem;
                        }
                        return undefined;
                    }
                })
            } catch {
                return []
            }
        }
    })

    return (
        <Box width="100%">
            <SudokuPadInteractive
                originGrid={originGrid}
                currentGrid={currentGrid}
                setCurrentGrid={setCurrentGrid}
                pencilMarks={pencilMarks}
                setPencilMarks={setPencilMarks}
                hints={{
                    currentStepIndex: hintStepIndex,
                    steps: hintSteps
                }}
            />
            <Box width="100%" marginBottom={2}>
                <Button
                    color="secondary" fullWidth={true} variant="contained" size="large"
                    onClick={() => {
                        const newGrid = createEmptyGrid();
                        // ony keep correct value of current grid
                        for (let row = 0; row < 9; row++) {
s                            for (let col = 0; col < 9; col++) {
                                const curGridVal = currentGrid[row][col];
                                const correctVal = correctGrid[row][col];
                                newGrid[row][col] = curGridVal === correctVal ? curGridVal : 0;
                            }
                        }
                        // solve with new grid but stop at first digit
                        const solveResult = solve(newGrid, { showSteps: true, skipPencilmarkStep: true, stopAtFirstDigit: true });
                        setHintSteps(solveResult.steps);
                        setHintStepIndex(0);
                    }}
                >
                    <Typography variant="h6">Hint</Typography>
                </Button>
            </Box>
            <Button
                color="primary" fullWidth={true} variant="contained" size="large"
                onClick={() => {
                    const result = solve(originGrid);

                }}
            >
                <Typography variant="h6">Check result</Typography>
            </Button>
        </Box>
    )
}

export default SudokuPage;