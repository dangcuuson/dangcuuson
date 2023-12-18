import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import { Box, IconButton, alpha, styled } from '@mui/material';
import NightModeToggle from '../components/DayNight/DayNightToggle';
import DightNightBackground from '../components/DayNight/DayNightBackground/DayNightBackground';
import DayNightMusicPlayer from '../components/DayNight/DayNightMusicPlayer/DayNightMusicPlayer';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from './routeConfig';
import HomeIcon from '@mui/icons-material/Home';

const MainContainer = styled('div')(({ theme }) => ({
    margin: 'auto',
    boxShadow: theme.shadows[4],
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    minHeight: '100vh',
    width: '100%',
    maxWidth: '960px',
    overflow: 'auto',
    '& *': {
        boxSizing: 'border-box'
    }
}));

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    return (
        <ErrorBoundary>
            <React.Suspense fallback="Loading...">
                <DightNightBackground>
                    <MainContainer id="main-container">
                        <Box display="flex" flexGrow={1} justifyContent="flex-start">
                            <IconButton
                                size="large"
                                onClick={() => navigate(routeConfigs.home.get())}
                                aria-label="Home page"
                                children={<HomeIcon />}
                            />
                            <DayNightMusicPlayer />
                            <NightModeToggle />

                        </Box>
                        <React.Suspense fallback="Loading...">
                            <Box padding={2} width="100%">
                                {children}
                            </Box>
                        </React.Suspense>
                    </MainContainer>
                </DightNightBackground>
            </React.Suspense>
        </ErrorBoundary >
    )
}

export default MainLayout;