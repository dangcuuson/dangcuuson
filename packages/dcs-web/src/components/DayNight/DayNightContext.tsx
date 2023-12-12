import React from 'react';
import { Palette, ThemeProvider, colors, createTheme } from '@mui/material';
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
        palette: Palette
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
    }
}


export const DayNightThemeProvider: React.FC<{ children: React.ReactNode; }> = (props) => {
    const [isNightMode, setIsNightMode] = useLocalStorage<boolean>({
        key: 'night_mode',
        getInitValue: v => v === 'true'
    });

    const [theme] = useDerivedState(
        () => {
            return createTheme({
                palette: {
                    primary: colors.blue,
                    secondary: colors.orange,
                    error: colors.red,
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