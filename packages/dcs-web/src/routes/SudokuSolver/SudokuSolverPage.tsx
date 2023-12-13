import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import SudokuPadInteractive from '../../components/SudokuPad/SudokuPadInteractive';
import { SolveResult, solve } from '../../components/SudokuPad/SudokuSolver';
import _ from 'lodash';
import SolveResultDisplay from './SolveResultDisplay';
import { PencilMark, SudokuGrid } from '../../components/SudokuPad/SudokuTypes';
import GoBackIcon from '@mui/icons-material/KeyboardReturn';
import { useNavigate } from 'react-router';
import { useDerivedState } from '../../utils/hooks';
import { createEmptyGrid, parseGrid } from '../../components/SudokuPad/SudokuHelper';

const SudokuSolverPage: React.FC<{}> = () => {
    const navigate = useNavigate();
    const [originGrid] = React.useState(() => {
        return createEmptyGrid();
    });
    const [currentGrid, setCurrentGrid] = useDerivedState<SudokuGrid>(
        () => _.cloneDeep(originGrid),
        [originGrid]
    );
    const [pencilMarks, setPencilMarks] = useDerivedState<PencilMark[]>(
        () => [],
        [originGrid]
    );
    React.useEffect(
        () => {
            const handlePaste = (e: ClipboardEvent) => {
                const textData = e.clipboardData?.getData('text') || '';
                const gridFromClipboard = parseGrid(textData);
                if (gridFromClipboard) {
                    setCurrentGrid(gridFromClipboard);
                }
            }
            window.addEventListener('paste', handlePaste);
            return () => {
                window.removeEventListener('paste', handlePaste);
            }
        },
        []
    )
    const [solveResult, setSolveResult] = React.useState<SolveResult | null>(null);
    return (
        <Box id="solve-page" textAlign="center" width="100%">
            <Box display="flex" justifyContent="flex-start" width="100%">
                <Button
                    variant="text"
                    startIcon={<GoBackIcon />}
                    children="Back"
                    onClick={() => {
                        if (solveResult) {
                            setSolveResult(null);
                        } else {
                            navigate('/');
                        }
                    }}
                />
            </Box>
            {!solveResult && (
                <React.Fragment>
                    <Typography variant="h5" color="text.primary">
                        Fill the grid and click 'Solve'
                    </Typography>
                    <SudokuPadInteractive
                        originGrid={originGrid}
                        currentGrid={currentGrid}
                        setCurrentGrid={setCurrentGrid}
                        pencilMarks={pencilMarks}
                        setPencilMarks={setPencilMarks}
                    />
                    <Button
                        variant="contained" color="primary" size="large"
                        fullWidth={true}
                        onClick={() => {
                            setSolveResult(solve(currentGrid, { showSteps: true }));
                        }}
                    >
                        <Typography variant="h6">Solve</Typography>
                    </Button>
                </React.Fragment>
            )}
            {!!solveResult && <SolveResultDisplay originGrid={currentGrid} result={solveResult} />}
        </Box>
    )
}

export default SudokuSolverPage;