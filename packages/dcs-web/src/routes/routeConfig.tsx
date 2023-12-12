import React from 'react';
import { RouteProps } from 'react-router-dom';

const SudokuPage = React.lazy(() => import('./Sudoku/SudokuPage'));

export interface RouteItemConfig<TGet extends Function = Function> {
    props: RouteProps;
    get: TGet;
}

const createRouteItemConfig = <TGet extends Function>(config: RouteItemConfig<TGet>): RouteItemConfig<TGet> => {
    return config;
};

export const routeConfigs = {
    sudoku: createRouteItemConfig({
        get: () => '/sudoku',
        props: { path: '/sudoku', children: <SudokuPage /> }
    })
}