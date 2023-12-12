import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import { AppBar, Box, Toolbar } from '@mui/material';
import NightModeToggle from '../components/DayNight/DayNightToggle';
import DightNightBackground from '../components/DayNight/DayNightBackground';

const MainLayout: React.FC<{}> = () => {
    return (
        <ErrorBoundary>
            <React.Suspense fallback="Loading...">
                <DightNightBackground>
                    <Box
                        boxShadow={4}
                        margin="auto"
                        bgcolor="background.paper"
                        height={'1000px'}
                        width="100%"
                        maxWidth="960px"
                    >
                        <AppBar position="sticky">
                            <Toolbar>
                                <Box display="flex" flexGrow={1} justifyContent="flex-end">
                                    <NightModeToggle />
                                </Box>
                            </Toolbar>
                        </AppBar>
                    </Box>
                </DightNightBackground>
            </React.Suspense>
        </ErrorBoundary>
    )
}

export default MainLayout;