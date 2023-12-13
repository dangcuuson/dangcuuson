import { Box, Button, Rating, Typography } from '@mui/material';
import React, { useState } from 'react';
import GoBackIcon from '@mui/icons-material/KeyboardReturn';
import { PencilMark, SudokuGrid } from '../../components/SudokuPad/SudokuTypes';
import { useDerivedState, useLocalStorage } from '../../utils/hooks';
import _ from 'lodash';
import { useNavigate } from 'react-router';
import { generateGrid } from '../../components/SudokuPad/SudokuGenerator';
import SudokuPadInteractive from '../../components/SudokuPad/SudokuPadInteractive';
import { hasNumArrField, hasNumField, makeArr } from '../../utils/dataUtils';

const SudokuPage: React.FC<{}> = () => {
    const navigate = useNavigate();
    const [originGrid, setOriginGrid] = useLocalStorage<SudokuGrid | null>({
        key: 'sudoku_game_origin_grid',
        getInitValue: (value) => {
            const digits = (value || '').replace(/[^0-9]/g, '');
            if (digits.length === 81) {
                return Array(9).fill(0).map((zero, row) => {
                    return digits.slice(row * 9, row * 9 + 9).split('').map(digit => +digit);
                });
            }
            return null;
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
                            }}
                        >
                            Start
                        </Button>
                    </Box>
                </Box>
            )}
            {!!originGrid && (
                <SudokuPageInner originGrid={originGrid} />
            )}
        </Box>
    )
}

interface InnerProps {
    originGrid: SudokuGrid
}
const SudokuPageInner: React.FC<InnerProps> = ({ originGrid }) => {
    const [currentGrid, setCurrentGrid] = useLocalStorage<SudokuGrid>({
        key: 'sudoku_game_current_grid',
        getInitValue: (value) => {
            const digits = (value || '').replace(/[^0-9]/g, '');
            if (digits.length === 81) {
                return Array(9).fill(0).map((zero, row) => {
                    return digits.slice(row * 9, row * 9 + 9).split('').map(digit => +digit);
                });
            }
            return _.cloneDeep(originGrid);
        },
        stringify: grid => grid.join(',')
    });

    const [pencilMarks, setPencilMarks] = useLocalStorage<PencilMark[]>({
        key: 'sudoku_game_pencil_marks',
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
            />
            <Button fullWidth={true}>
                Check result
            </Button>
        </Box>
    )
}

export default SudokuPage;