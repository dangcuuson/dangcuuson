import { Box, Button, Typography } from '@mui/material';
import SudokuPad from '../../components/SudokuPad/SudokuPad';
import React from 'react';
import { useNavigate } from 'react-router';
import { routeConfigs } from '../routeConfig';
import { generateGrid } from '../../components/SudokuPad/SudokuGenerator';

const HomePage: React.FC<{}> = () => {
    const navigate = useNavigate();
    const randomGrid = React.useMemo(
        () => {
            return generateGrid(4);
        },
        []
    )
    return (
        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            <SudokuPad originGrid={randomGrid} />
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