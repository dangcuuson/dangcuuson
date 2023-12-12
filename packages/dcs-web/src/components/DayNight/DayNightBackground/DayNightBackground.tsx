import { Box } from '@mui/material';
import React from 'react';
import { DayNightContext } from '../DayNightContext';

const DayBG = require('./DayBackground.jpg');
const NightBG = require('./NightBackground.jpg');
const DightNightBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { isNightMode } = React.useContext(DayNightContext);
    return (
        <Box
            bgcolor="background.paper"
            sx={{
                backgroundImage: `url(${isNightMode ? NightBG : DayBG})`,
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