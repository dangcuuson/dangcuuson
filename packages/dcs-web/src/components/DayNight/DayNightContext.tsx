import React from 'react';
import { Palette, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useDerivedState, useLocalStorage } from '../../utils/hooks';

type DayNightContextType = {
    isNightMode: boolean
    setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DayNightContext = React.createContext<DayNightContextType>({
    isNightMode: false,
    setIsNightMode: () => null
});

declare module '@mui/material/styles' {
    interface Theme {
        palette: Palette;
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {

    }
}


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

    const [theme] = useDerivedState(
        () => {
            return createTheme({
                palette: {
                    mode: isNightMode ? 'dark' : 'light'
                }
            });
        },
        [isNightMode]
    )
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