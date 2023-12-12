import { Box, Card, CardActionArea, CardMedia } from '@mui/material';
import SudokuPad from '../../components/SudokuPad/SudokuPad';
import React from 'react';

const HomePage: React.FC<{}> = () => {
    return (
        <Box>
            <Card>
                <CardActionArea>
                    <CardMedia
                        component={SudokuPad}
                        grid={[
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
                </CardActionArea>
            </Card>
        </Box>
    );
}

export default HomePage;