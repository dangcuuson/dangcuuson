import React from 'react';
import { GridPosition, PencilMark, SudokuGrid } from './SudokuTypes';
import SudokuPad from './SudokuPad';
import { Box, Button, useMediaQuery } from '@mui/material';
import _ from 'lodash';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { calcBoxIndex } from './SudokuSolver';

interface Props {
    originGrid: SudokuGrid;
    currentGrid: SudokuGrid;
    setCurrentGrid: React.Dispatch<React.SetStateAction<SudokuGrid>>;
    pencilMarks: PencilMark[];
    setPencilMarks: React.Dispatch<React.SetStateAction<PencilMark[]>>;
}

type Action = SetCellAction;
type SetCellAction = {
    type: 'set-cell';
    digit: number;
    row: number;
    col: number;
    pencilMarkValues: number[];
}

const SudokuPadInteractive: React.FC<Props> = ({ originGrid, currentGrid, setCurrentGrid, pencilMarks, setPencilMarks }) => {
    const [selectedCell, setSelectedCell] = React.useState<GridPosition | null>(null);
    const isMobileView = useMediaQuery('(max-width:600px)');
    const undoStack = React.useRef<{ action: Action; reverse: Action; }[]>([]);
    const redoStack = React.useRef<{ action: Action; reverse: Action; }[]>([]);

    React.useEffect(
        () => {
            undoStack.current = [];
            redoStack.current = [];
        },
        [originGrid]
    );

    const performAction = (action: Action, source: 'user-input' | 'undo' | 'redo') => {
        switch (action.type) {
            case 'set-cell': {
                const { row, col, digit, pencilMarkValues } = action;
                if (source === 'user-input') {
                    // check if the action result in visible change
                    // if it does, add the action to undo stack
                    const pMark = pencilMarks.find(p => p.row === row && p.col === col);
                    const currentPMarkValues = pMark?.candidates || [];
                    const currentDigit = currentGrid[row][col];
                    const hasVisibleChange = () => {
                        if (currentDigit !== digit) {
                            return true;
                        }
                        return currentPMarkValues.length !== pencilMarkValues.length ||
                            _.difference(currentPMarkValues, pencilMarkValues).length > 0;
                    }
                    if (hasVisibleChange()) {
                        const reverse: Action = {
                            type: 'set-cell',
                            digit: currentDigit,
                            pencilMarkValues: currentPMarkValues,
                            row,
                            col
                        }
                        undoStack.current.push({ action, reverse })
                        redoStack.current = [];
                    }
                }

                const newGrid = _.cloneDeep(currentGrid);
                newGrid[row][col] = digit;
                setCurrentGrid(newGrid);

                const newPMarks = _.cloneDeep(pencilMarks)
                    .filter(pMark => {
                        return pMark.row !== row || pMark.col !== col;
                    });
                newPMarks.push({ row, col, box: calcBoxIndex(row, col), candidates: pencilMarkValues });

                setPencilMarks(newPMarks);
                break;
            }
        }
    };

    const undo = () => {
        const lastAction = undoStack.current.pop();
        if (lastAction) {
            performAction(lastAction.reverse, 'undo');
            redoStack.current.push(lastAction);
        }

    };

    const redo = () => {
        const lastAction = redoStack.current.pop();
        if (lastAction) {
            performAction(lastAction.action, 'redo');
            undoStack.current.push(lastAction);
        }
    };

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
                        performAction({
                            type: 'set-cell',
                            row,
                            col,
                            digit: 0,
                            pencilMarkValues: []
                        }, 'user-input');
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
                        // TODO: check pencil mark mode
                        performAction({
                            type: 'set-cell',
                            row,
                            col,
                            digit: +e.key,
                            pencilMarkValues: []
                        }, 'user-input');
                        break;
                    }
                }
            }
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            }
        },
        [selectedCell, originGrid, currentGrid, pencilMarks]
    );
    return (
        <React.Fragment>
            <Box display="flex" flexDirection={!isMobileView ? 'row' : 'column'}>
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
                <Box flex="1">
                    <SudokuPadControls
                        onDigitClicked={() => null}
                        isMobileView={isMobileView}
                        onUndo={() => undo()}
                        onRedo={() => redo()}
                        canUndo={undoStack.current.length > 0}
                        canRedo={redoStack.current.length > 0}
                    />
                </Box>
            </Box>
        </React.Fragment>
    );
}

interface ControlProps {
    onDigitClicked: (num: number) => void;
    isMobileView: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

const SudokuPadControls: React.FC<ControlProps> = ({ onDigitClicked, isMobileView, onUndo, onRedo, canUndo, canRedo }) => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" height="100%">
            <Box display="flex" alignItems="center">
                <Button
                    size="large"
                    disabled={!canUndo}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                            onClick={() => onUndo()}
                        >
                            <UndoIcon />
                            <span>Undo</span>
                        </Box>
                    )}
                />
                <Button
                    size="large"
                    disabled={!canRedo}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                            onClick={() => onRedo()}
                        >
                            <RedoIcon />
                            <span>Redo</span>
                        </Box>
                    )}
                />
            </Box>
            <Box display={!isMobileView ? 'grid' : 'flex'} gridTemplateColumns="auto auto auto" flexWrap="wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                    <Button
                        key={digit}
                        children={digit}
                        size="small"
                        sx={{
                            minWidth: {
                                xs: 36,
                                sm: 64
                            },
                            fontSize: {
                                xs: '2rem',
                                md: '2.5rem'
                            }
                        }}
                        onClick={() => {
                            onDigitClicked(digit);
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
}

export default SudokuPadInteractive;