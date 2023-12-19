import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { useIsDarkMode } from './DayNightStore';

const DayNightThemeProvider: React.FC<{ children: React.ReactNode; }> = (props) => {
    const isDarkMode = useIsDarkMode();

    const theme = React.useMemo(
        () => {
            {
                return createTheme({
                    palette: {
                        mode: isDarkMode ? 'dark' : 'light'
                    }
                });
            }
        },
        [isDarkMode]
    )

    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    )
}

export default DayNightThemeProvider;