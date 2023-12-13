import { Box, Button, Typography } from '@mui/material';
import SudokuPad from '../../components/SudokuPad/SudokuPad';
import React from 'react';
import { useNavigate } from 'react-router';
import { routeConfigs } from '../routeConfig';

const HomePage: React.FC<{}> = () => {
    const navigate = useNavigate();
    return (
        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            <React.Suspense fallback="AAAA">
                <SudokuPad originGrid={[
                    [0, 0, 0, 0, 0, 6, 0, 0, 0],
                    [4, 5, 0, 7, 0, 0, 0, 2, 3],
                    [0, 8, 0, 1, 0, 0, 0, 5, 0],
                    [2, 3, 0, 6, 7, 0, 0, 0, 0],
                    [8, 0, 0, 0, 0, 0, 3, 0, 0],
                    [0, 9, 0, 5, 3, 0, 0, 1, 0],
                    [0, 0, 0, 0, 6, 0, 9, 0, 0],
                    [0, 4, 2, 8, 0, 0, 0, 0, 0],
                    [0, 0, 8, 0, 4, 0, 5, 0, 0]
                ]} />
            </React.Suspense>
            <Box marginBottom={2} width="100%">
                <Button
                    variant="contained" color="primary" fullWidth={true} size="large"
                    onClick={() => navigate(routeConfigs.sudokuGame.get())}
                >
                    <Typography variant="h6">Play Sudoku</Typography>
                </Button>
            </Box>
            <Button
                variant="contained" color="secondary" fullWidth={true} size="large"
                onClick={() => navigate(routeConfigs.sudokuSolve.get())}
            >
                <Typography variant="h6">Help me solve one</Typography>
            </Button>
        </Box>
    );
}

export default HomePage;