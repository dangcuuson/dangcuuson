import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import SudokuPadInteractive from '../../components/SudokuPad/SudokuPadInteractive';
import { SolveResult, solve } from '../../components/SudokuPad/SudokuSolver';
import _ from 'lodash';
import SolveResultDisplay from './SolveResultDisplay';
import { SudokuGrid } from '../../components/SudokuPad/SudokuTypes';
import GoBackIcon from '@mui/icons-material/KeyboardReturn';
import { useNavigate } from 'react-router';

const SudokuSolverPage: React.FC = () => {
    const navigate = useNavigate();
    const [originGrid, setOriginGrid] = React.useState(() => {
        return Array(9).fill(0).map(row => Array(9).fill(0))
    })
    React.useEffect(
        () => {
            const handlePaste = (e: ClipboardEvent) => {
                const textData = e.clipboardData?.getData('text') || '';
                const numonly = textData.replace(/[^0-9]/g, '');
                if (numonly.length === 81) {
                    const gridFromClipboard: SudokuGrid =
                        Array(9).fill(0).map((zero, row) => {
                            return numonly.slice(row * 9, row * 9 + 9).split('').map(digit => +digit);
                        });
                    setOriginGrid(gridFromClipboard);
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
        <Box display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" justifyContent="flex-end" width="100%">
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
                    <SudokuPadInteractive originGrid={originGrid} currentGrid={originGrid} setCurrentGrid={setOriginGrid} />
                    <Button
                        variant="contained" color="primary" size="large"
                        onClick={() => {
                            setSolveResult(solve(originGrid, { showSteps: true }));
                        }}
                    >
                        <Typography variant="h4">Solve</Typography>
                    </Button>
                </React.Fragment>
            )}
            {!!solveResult && <SolveResultDisplay originGrid={originGrid} result={solveResult} />}
        </Box>
    )
}

export default SudokuSolverPage;