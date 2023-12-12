import React from 'react';
import { Collapse, IconButton, Icon, Typography, colors, Box } from '@mui/material';
import Error from '@mui/icons-material/Error';
import Clear from '@mui/icons-material/Clear';
import Refresh from '@mui/icons-material/Refresh';

interface Props {
    error: React.ReactNode;
    onClose?: () => void;
    onRetry?: () => void;
}

const ErrorBox: React.FC<Props> = (props) => {
    const { error, onClose, onRetry } = props;

    return (
        <Collapse in={!!error}>
            <Box
                bgcolor={colors.red[50]}
                border={`1px solid ${colors.red[400]}`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                padding={1}
                position="relative"
            >
                <Icon color="error">
                    <Error />
                </Icon>
                <Box marginLeft={2}>
                    <Typography children={error} />
                </Box>
                {!!onRetry && (
                    <IconButton onClick={onRetry}>
                        <Refresh />
                    </IconButton>
                )}
                {!!onClose && (
                    <IconButton onClick={onClose}>
                        <Clear />
                    </IconButton>
                )}
            </Box>
        </Collapse>
    );
};

export default ErrorBox;