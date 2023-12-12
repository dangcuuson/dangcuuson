import React from 'react';
import { Palette, ThemeProvider, colors, createTheme } from '@mui/material';
import { useDerivedState } from '../../utils/hooks';

type DayNightContextType = {
    isNightMode: boolean
    setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DayNightContext = React.createContext<DayNightContextType>({
    isNightMode: false,
    setIsNightMode: () => null
});

const LOCAL_STORAGE_NIGHT_MODE_KEY = 'night_mode';

declare module '@mui/material/styles' {
    interface Theme {
        palette: Palette
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
    }
}


export const DayNightThemeProvider: React.FC<{ children: React.ReactNode; }> = (props) => {
    const [isNightMode, setIsNightMode] = React.useState(() => {
        return localStorage.getItem(LOCAL_STORAGE_NIGHT_MODE_KEY) === 'true'
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

    React.useEffect(
        () => {
            localStorage.setItem(LOCAL_STORAGE_NIGHT_MODE_KEY, isNightMode + '');
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