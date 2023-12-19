import React from 'react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useLocalStorage } from '../../utils/hooks';

type DayNightContextType = {
    isNightMode: boolean
    setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DayNightContext = React.createContext<DayNightContextType>({
    isNightMode: false,
    setIsNightMode: () => null
});

const dayTheme = createTheme({
    palette: { mode: 'light' }
});

const nightTheme = createTheme({
    palette: { mode: 'dark' }
});

export const DayNightThemeProvider: React.FC<{ children: React.ReactNode; }> = (props) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    
    const [isNightMode, setIsNightMode] = useLocalStorage<boolean>({
        key: 'night_mode',
        getInitValue: v => {
            if (!v) {
                return prefersDarkMode;
            }
            return v === 'true';
        }
    });

    const theme = React.useMemo(
        () => isNightMode ? nightTheme : dayTheme,
        [isNightMode]
    );
    return (
        <DayNightContext.Provider
            value={{
                isNightMode,
                setIsNightMode
            }}
        >
            <ThemeProvider theme={theme}>
                {props.children}
            </ThemeProvider>
        </DayNightContext.Provider>
    )
}