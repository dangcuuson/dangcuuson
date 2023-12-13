import React from 'react';
import { GridPosition, PencilMark, SudokuGrid } from './SudokuTypes';
import SudokuPad from './SudokuPad';
import { Box, Button, useMediaQuery } from '@mui/material';
import _ from 'lodash';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import BackspaceIcon from '@mui/icons-material/Backspace';
import EditIcon from '@mui/icons-material/Edit';
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

const SudokuPadInteractive: React.FC<Props> = (props) => {
    const { originGrid, currentGrid } = props;
    const [selectedCell, setSelectedCell] = React.useState<GridPosition | null>(null);
    const isMobileView = useMediaQuery('(max-width:600px)');

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
                            grid: currentGrid,
                            pMarks: props.pencilMarks
                        }}
                    />
                </Box>
                <Box flex="1">
                    <SudokuPadControls
                        {...props}
                        isMobileView={isMobileView}
                        selectedCell={selectedCell}
                        setSelectedCell={setSelectedCell}
                    />
                </Box>
            </Box>
        </React.Fragment>
    );
}

interface ControlProps extends Props {
    isMobileView: boolean;
    selectedCell: GridPosition | null;
    setSelectedCell: React.Dispatch<React.SetStateAction<GridPosition | null>>;
}

const SudokuPadControls: React.FC<ControlProps> = (props) => {
    const undoStack = React.useRef<{ action: Action; reverse: Action; }[]>([]);
    const redoStack = React.useRef<{ action: Action; reverse: Action; }[]>([]);
    const [_pencilMode, setPencilMode] = React.useState(false);
    const [isShift, setIsShift] = React.useState(false);
    const pencilMode = isShift ? !_pencilMode : _pencilMode;

    React.useEffect(
        () => {
            undoStack.current = [];
            redoStack.current = [];
        },
        [props.originGrid]
    );

    const performAction = (action: Action, source: 'user-input' | 'undo' | 'redo') => {
        switch (action.type) {
            case 'set-cell': {
                const { row, col, digit, pencilMarkValues } = action;
                if (source === 'user-input') {
                    // check if the action result in visible change
                    // if it does, add the action to undo stack
                    const pMark = props.pencilMarks.find(p => p.row === row && p.col === col);
                    const currentPMarkValues = pMark?.candidates || [];
                    const currentDigit = props.currentGrid[row][col];
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

                const newGrid = _.cloneDeep(props.currentGrid);
                newGrid[row][col] = digit;
                props.setCurrentGrid(newGrid);

                const newPMarks = _.cloneDeep(props.pencilMarks)
                    .filter(pMark => {
                        return pMark.row !== row || pMark.col !== col;
                    });
                if (pencilMarkValues.length > 0) {
                    newPMarks.push({ row, col, box: calcBoxIndex(row, col), candidates: pencilMarkValues });
                }

                props.setPencilMarks(newPMarks);
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

    const performDigit = (digit: number) => {
        if (!props.selectedCell) {
            return;
        }
        const { row, col } = props.selectedCell;
        const cellModifiable = !props.originGrid[row][col];
        if (!cellModifiable) {
            return;
        }
        const newDigit = !pencilMode ? digit : props.currentGrid[row][col];
        const getNewPMarkValues = (): number[] => {
            if (!pencilMode) {
                return [];
            }
            const curPMark = props.pencilMarks.find(pMark => pMark.row === row && pMark.col === col);
            let newPMarkValues = [...curPMark?.candidates || []];
            if (pencilMode) {
                if (newPMarkValues.includes(digit)) {
                    newPMarkValues = newPMarkValues.filter(v => v !== digit);
                } else {
                    newPMarkValues.push(digit);
                }
            }
            return newPMarkValues;
        }


        performAction({
            type: 'set-cell',
            row,
            col,
            digit: newDigit,
            pencilMarkValues: getNewPMarkValues()
        }, 'user-input');
    };

    const performDelete = () => {
        if (!props.selectedCell) {
            return;
        }
        const { row, col } = props.selectedCell;
        const cellModifiable = !props.originGrid[row][col];
        if (!cellModifiable) {
            return;
        }
        performAction({
            type: 'set-cell',
            row,
            col,
            digit: 0,
            pencilMarkValues: []
        }, 'user-input');
    };

    React.useEffect(
        () => {
            if (!props.selectedCell) {
                return;
            }
            const { row, col } = props.selectedCell;
            const moveSelectedCell = (dRow: number, dCol: number) => {
                const newRow = (row + dRow + 9) % 9;
                const newCol = (col + dCol + 9) % 9;
                if (row !== newRow || col !== newCol) {
                    props.setSelectedCell({ row: newRow, col: newCol });
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
                        performDelete();
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
                        performDigit(+e.key);
                        break;
                    }
                }
            }
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            }
        },
        [props.selectedCell, props.originGrid, props.currentGrid, props.pencilMarks, pencilMode]
    );

    React.useEffect(
        () => {
            const shiftKeyDownCheck = (e: KeyboardEvent) => {
                if (e.key === 'Shift') {
                    setIsShift(true);
                }
            };
            const shiftKeyUpCheck = (e: KeyboardEvent) => {
                if (e.key === 'Shift') {
                    setIsShift(false);
                }
            };
            window.addEventListener('keydown', shiftKeyDownCheck);
            window.addEventListener('keyup', shiftKeyUpCheck);
            return () => {
                window.addEventListener('keydown', shiftKeyDownCheck);
                window.addEventListener('keyup', shiftKeyUpCheck);
            }
        },
        []
    );

    return (
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" height="100%">
            <Box display="flex" alignItems="center">
                <Button
                    size="large"
                    disabled={undoStack.current.length === 0}
                    sx={{ textTransform: 'unset' }}
                    onClick={() => undo()}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                        >
                            <UndoIcon />
                            <span>Undo</span>
                        </Box>
                    )}
                />
                <Button
                    size="large"
                    disabled={redoStack.current.length === 0}
                    sx={{ textTransform: 'unset' }}
                    onClick={() => redo()}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                        >
                            <RedoIcon />
                            <span>Redo</span>
                        </Box>
                    )}
                />
                <Button
                    size="large"
                    variant={pencilMode ? 'contained' : undefined}
                    sx={{ textTransform: 'unset', padding: '1 1,5' }}
                    onClick={() => setPencilMode(p => !p)}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                        >
                            <EditIcon />
                            <span>Notes: {pencilMode ? 'on' : 'off'}</span>
                        </Box>
                    )}
                />
                <Button
                    size="large"
                    sx={{ textTransform: 'unset' }}
                    onClick={() => performDelete()}
                    children={(
                        <Box
                            display="flex" flexDirection="column" alignItems="center"
                        >
                            <BackspaceIcon />
                            <span>Erase</span>
                        </Box>
                    )}
                />
            </Box>
            <Box display={!props.isMobileView ? 'grid' : 'flex'} gridTemplateColumns="auto auto auto" flexWrap="wrap">
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
                            performDigit(digit);
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
}

export default SudokuPadInteractive;