import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';

type DayNightStore = {
    darkMode: boolean;
    setDarkMode: (v: boolean) => void;
}

// const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
const stateCreator: StateCreator<DayNightStore> = (set) => ({
    darkMode: false,
    setDarkMode: darkMode => {
        set({
            darkMode
        })
    }
});

const useDayNightStore = create<DayNightStore>()(persist(
    stateCreator,
    {
        name: 'daynight-store',
        version: 1
    }
));

export const useIsDarkMode = (): DayNightStore['darkMode'] => useDayNightStore(s => s.darkMode);
export const useSetDarkMode = (): DayNightStore['setDarkMode'] => useDayNightStore(s => s.setDarkMode);