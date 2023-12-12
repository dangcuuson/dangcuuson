import { Box, Button, Typography } from '@mui/material';
import SudokuPad from '../../components/SudokuPad/SudokuPad';
import React from 'react';
import { useNavigate } from 'react-router';
import { routeConfigs } from '../routeConfig';

const HomePage: React.FC<{}> = () => {
    const navigate = useNavigate();
    return (
        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            <SudokuPad
                originGrid={[
                    [7, 5, 0, 0, 1, 0, 0, 0, 0],
                    [0, 0, 4, 0, 9, 5, 0, 6, 0],
                    [0, 0, 0, 8, 0, 7, 0, 0, 4],
                    [4, 0, 0, 0, 0, 3, 0, 0, 7],
                    [0, 2, 0, 0, 0, 0, 0, 1, 0],
                    [6, 0, 0, 5, 2, 0, 0, 0, 3],
                    [0, 0, 0, 4, 0, 6, 0, 0, 0],
                    [0, 7, 0, 9, 5, 0, 4, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 2, 6]
                ]}
            />
            <Box marginBottom={2} width="100%">
                <Button
                    variant="outlined" color="primary" fullWidth={true} size="large"
                    onClick={() => navigate(routeConfigs.sudokuGame.get())}
                >
                    <Typography variant="h4">Play Sudoku</Typography>
                </Button>
            </Box>
            <Button
                variant="outlined" color="secondary" fullWidth={true} size="large"
                onClick={() => navigate(routeConfigs.sudokuSolve.get())}
            >
                <Typography variant="h4">Help me solve one</Typography>
            </Button>
        </Box>
    );
}

export default HomePage;