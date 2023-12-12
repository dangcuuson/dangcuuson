import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import { Box, IconButton, alpha } from '@mui/material';
import styled from '@emotion/styled';
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
    height: '100vh',
    width: '100%',
    maxWidth: '960px'
}));

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    return (
        <ErrorBoundary>
            <React.Suspense fallback="Loading...">
                <DightNightBackground>
                    <MainContainer>
                        <Box display="flex" flexGrow={1} justifyContent="flex-start">
                            <IconButton
                                size="large"
                                onClick={() => navigate(routeConfigs.home.get())}
                                children={<HomeIcon />}
                            />
                            <DayNightMusicPlayer />
                            <NightModeToggle />

                        </Box>
                        <Box padding={2}>
                            {children}
                        </Box>
                    </MainContainer>
                </DightNightBackground>
            </React.Suspense>
        </ErrorBoundary >
    )
}

export default MainLayout;