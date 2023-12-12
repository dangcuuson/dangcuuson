import { Box, Typography } from '@mui/material';
import React from 'react';
import SudokuPad from '../../components/SudokuPad/SudokuPad';

const SudokuSolverPage: React.FC = () => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5" color="text.primary">
                Fill the grid and click 'Solve'
            </Typography>
            <SudokuPad
                originGrid={[
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                ]}
            />
        </Box>
    )
}

export default SudokuSolverPage;