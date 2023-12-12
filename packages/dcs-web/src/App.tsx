import React from 'react';
import MainLayout from './routes/MainLayout';
import { DayNightThemeProvider } from './components/DayNight/DayNightContext';
import { BrowserRouter, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import { RouteItemConfig, routeConfigs } from './routes/routeConfig';
import _ from 'lodash';
import HomePage from './routes/HomePage/HomePage';

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
    return (
        <React.Fragment>
            {/* <SudokuPad grid={[
                [0,0,4,0,0,8,0,0,6],
                [0,0,5,2,0,0,1,8,0],
                [0,1,0,0,0,0,0,0,7],
                [0,0,2,0,9,0,0,0,0],
                [0,0,0,0,0,0,0,0,1],
                [0,5,0,0,0,7,3,4,0],
                [4,0,0,7,0,0,0,0,0],
                [0,3,0,0,0,4,8,5,0],
                [0,0,0,0,0,0,0,6,0]
            ]} /> */}
            {/* <SudokuPad grid={[
                [0,0,2,0,9,0,0,0,0],
                [3,9,0,6,0,0,0,4,0],
                [0,0,0,0,5,0,0,0,8],
                [0,0,7,0,0,0,0,1,0],
                [0,0,4,2,0,0,0,0,0],
                [1,2,0,0,6,0,5,0,0],
                [7,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,3,4,0,0],
                [6,1,0,9,0,0,0,3,0]
            ]} /> */}
            {/**
             * From https://www.youtube.com/watch?v=BPMNu5-Pv24&list=PLK-l8O0YikOk20gPW9Fk_vQ72HiLnk-b4
             */}
            {/* <SudokuPad grid={[
                [7,5,0,0,1,0,0,0,0],
                [0,0,4,0,9,5,0,6,0],
                [0,0,0,8,0,7,0,0,4],
                [4,0,0,0,0,3,0,0,7],
                [0,2,0,0,0,0,0,1,0],
                [6,0,0,5,2,0,0,0,3],
                [0,0,0,4,0,6,0,0,0],
                [0,7,0,9,5,0,4,0,0],
                [0,0,0,0,0,0,0,2,6]
            ]} /> */}
            {/* <SudokuPad grid={[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]} /> */}
        </React.Fragment>
    );
}

export default App;