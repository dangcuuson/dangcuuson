import type { Palette } from '@mui/material';
import type { Theme as MUITheme } from '@mui/material';

declare module '@mui/material/styles' {
    interface Theme {
        palette: Palette;
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {

    }
}

declare module "@emotion/react" {
    export interface Theme extends MUITheme { }
}

export {}