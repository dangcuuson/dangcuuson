import _ from 'lodash';
import React from 'react';
import { RouteProps } from 'react-router-dom';

const HomePage = React.lazy(() => import('./Home/HomePage'));
const SudokuGamePage = React.lazy(() => import('./SudokuGame/SudokuGamePage'));
const SudokuSolverPage = React.lazy(() => import('./SudokuSolver/SudokuSolverPage'));

export interface RouteItemConfig<TGet extends Function = Function> {
    props: RouteProps;
    get: TGet;
}

const createRouteItemConfig = <TGet extends Function>(config: RouteItemConfig<TGet>): RouteItemConfig<TGet> => {
    return config;
};

export const routeConfigs = {
    home: createRouteItemConfig({
        get: () => '/',
        props: { path: '/', element: <HomePage /> }
    }),
    sudokuGame: createRouteItemConfig({
        get: () => '/sudoku-game',
        props: { path: '/sudoku-game', element: <SudokuGamePage /> }
    }),
    sudokuSolve: createRouteItemConfig({
        get: () => '/sudoku-solve',
        props: { path: '/sudoku-solve', element: <SudokuSolverPage /> }
    })
}