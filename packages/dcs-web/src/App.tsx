import React from 'react';
import MainLayout from './routes/MainLayout';
import { DayNightThemeProvider } from './components/DayNight/DayNightContext';
import { BrowserRouter, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import { RouteItemConfig, routeConfigs } from './routes/routeConfig';
import _ from 'lodash';

const renderRoutes = (configMap: { [K: string]: RouteItemConfig }) => {
    return _.values(configMap).map((config, index) => {
        return <Route key={index} {...config.props} />;
    });
};


const App: React.FC<{}> = () => {
    return (
        <DayNightThemeProvider>
            <BrowserRouter>
                <MainLayout>
                    <Routes>
                        {renderRoutes(routeConfigs)}
                    </Routes>
                </MainLayout>
            </BrowserRouter>
        </DayNightThemeProvider>
    );
}

export default App;