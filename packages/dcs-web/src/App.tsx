import React from 'react';
import MnistModelTrainer from './components/mnistModelTrainer/mnistModelTrainer';

const App: React.FC<{}> = () => {

    return (
        <React.Fragment>
            <MnistModelTrainer />
            <div>Hello world</div>
        </React.Fragment>
    );
}

export default App;