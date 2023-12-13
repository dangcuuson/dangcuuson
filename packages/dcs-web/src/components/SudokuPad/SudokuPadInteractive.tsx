import React from 'react';
import { GridPosition, SudokuGrid } from './SudokuTypes';
import SudokuPad from './SudokuPad';
import { Box } from '@mui/material';
import _ from 'lodash';

interface Props {
    originGrid: SudokuGrid;
    currentGrid: SudokuGrid;
    setCurrentGrid: React.Dispatch<React.SetStateAction<SudokuGrid>>;
}
const SudokuPadInteractive: React.FC<Props> = ({ originGrid, currentGrid, setCurrentGrid }) => {
    const [selectedCell, setSelectedCell] = React.useState<GridPosition | null>(null);
    React.useEffect(
        () => {
            if (!selectedCell) {
                return;
            }
            const { row, col } = selectedCell;
            const cellModifiable = !originGrid[row][col];

            const moveSelectedCell = (dRow: number, dCol: number) => {
                const newRow = _.clamp(row + dRow, 0, 8);
                const newCol = _.clamp(col + dCol, 0, 8);
                if (row !== newRow || col !== newCol) {
                    setSelectedCell({ row: newRow, col: newCol });
                }
            }
            const handleKeyDown = (e: KeyboardEvent) => {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'a': {
                        moveSelectedCell(0, -1);
                        break;
                    }
                    case 'ArrowRight':
                    case 'd': {
                        moveSelectedCell(0, 1);
                        break;
                    }
                    case 'ArrowUp':
                    case 'w': {
                        moveSelectedCell(-1, 0);
                        break;
                    }
                    case 'ArrowDown':
                    case 's': {
                        moveSelectedCell(1, 0);
                        break;
                    }
                    case 'Delete':
                    case 'Backspace': {
                        if (!cellModifiable) {
                            break;
                        }
                        setCurrentGrid(curGrid => {
                            const newGrid = _.cloneDeep(curGrid);
                            newGrid[row][col] = 0;
                            return newGrid;
                        });
                        break;
                    }
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9': {
                        if (!cellModifiable) {
                            break;
                        }
                        setCurrentGrid(curGrid => {
                            const newGrid = _.cloneDeep(curGrid);
                            newGrid[row][col] = +e.key;
                            return newGrid;
                        });
                        break;
                    }
                }
            }
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            }
        },
        [selectedCell, originGrid, setSelectedCell, setCurrentGrid]
    )

    return (
        <Box sx={{ cursor: 'pointer' }}>
            <SudokuPad
                interactive={{
                    selectedCell,
                    setSelectedCell
                }}
                originGrid={originGrid}
                currentStep={{
                    grid: currentGrid
                }}
            />
        </Box>
    )
}

export default SudokuPadInteractive;