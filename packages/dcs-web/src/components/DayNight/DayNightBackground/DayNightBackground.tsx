import { Box } from '@mui/material';
import React from 'react';
import { useIsDarkMode } from '../DayNightStore';

const DayBG = require('./DayBackground.webp');
const NightBG = require('./NightBackground.webp');
const DightNightBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const isDarkMode = useIsDarkMode();
    return (
        <Box
            bgcolor="background.paper"
            sx={{
                backgroundImage: `url(${isDarkMode ? NightBG : DayBG})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                transition: 'background-image 1s ease-in-out'
            }}
        >
            {children}
        </Box>
    )
}

export default DightNightBackground;