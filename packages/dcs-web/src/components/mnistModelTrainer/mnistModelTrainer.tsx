import React from 'react';
import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';
import { loadMnistData } from './mninstImgLoader';
import DrawableCanvas from '../DrawableCanvas/DrawableCanvas';

function getModel() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have 
    // to specify the input shape. Then we specify some parameters for 
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: 5,
        filters: 8,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.  
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Repeat another conv2d + maxPooling stack. 
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
        kernelSize: 5,
        filters: 16,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
        units: NUM_OUTPUT_CLASSES,
        kernelInitializer: 'varianceScaling',
        activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    return model;
}

async function trainModel(model: tf.Sequential, data, onTrainEnd: () => void) {
    // const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    // const container = {
    //     name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    // };
    // const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = 5500;
    const TEST_DATA_SIZE = 1000;

    const [trainXs, trainYs] = tf.tidy(() => {
        const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
        return [
            d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
            d.labels
        ];
    });

    const [testXs, testYs] = tf.tidy(() => {
        const d = data.nextTestBatch(TEST_DATA_SIZE);
        return [
            d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
            d.labels
        ];
    });

    return model.fit(trainXs, trainYs, {
        batchSize: BATCH_SIZE,
        validationData: [testXs, testYs],
        epochs: 10,
        shuffle: true,
        callbacks: {
            onTrainEnd
        }
        // callbacks: fitCallbacks
    });
}

const MnistModelTrainer: React.FC<{}> = () => {
    const modelRef = React.useRef<tf.LayersModel>();
    const [traning, setTraining] = React.useState(true);
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    React.useEffect(
        () => {
            tf.loadLayersModel('localstorage://my-model-1')
                .then(model => {
                    modelRef.current = model;
                    setTraining(false);
                })
                .catch(err => {
                    const startTraining = async () => {
                        const data = await loadMnistData();
                        const model = getModel();
                        modelRef.current = model;
                        // tfvis.show.modelSummary({ name: 'Model Architecture', tab: 'Model' }, model);
                        trainModel(model, data, () => setTraining(false));
                    }
                    startTraining();
                });

        },
        []
    )

    if (traning) {
        return <div>Training model...</div>;
    }
    return (
        <React.Fragment>
            <div>Model has been trained</div>
            <button onClick={() => {
                modelRef.current?.save('localstorage://my-model-1');
            }}>
                Save model (local storage)
            </button>
            {!!canvas && (
                <button
                    onClick={() => {
                        const readCanvas = () => {
                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                alert(`2d canvas is not supported`);
                                return null;
                            }
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const imageBuffer = new Float32Array(canvas.width * canvas.height);
                            for (let j = 0; j < imageData.data.length / 4; j++) {
                                // All channels hold an equal value since the image is grayscale, so
                                // just read the red channel.
                                imageBuffer[j] = imageData.data[j * 4] / 255;
                            }
                            console.log(canvas.width, canvas.height, imageData.data.length);
                            return { canvas, imageBuffer };
                        }

                        const doPrediction = () => {
                            const canvasResult = readCanvas();
                            const model = modelRef.current;
                            if (!canvasResult || !model) {
                                return;
                            }

                            const imgTensor = tf
                                .tensor4d(canvasResult.imageBuffer, [1, canvasResult.canvas.width, canvasResult.canvas.height, 1])
                            const resizedImg = tf.image.resizeBilinear(imgTensor, [28, 28]);
                            const preds = model.predict(resizedImg);

                            console.log(preds.toString());
                        }
                        doPrediction();
                    }}
                >
                    Predict
                </button>
            )}
            {/* This is needed because React will break with conditional button before DrawableCanvas (which do something with DOM manipulation) */}
            <div />

            <DrawableCanvas onCanvasReady={(canvas, fc) => {
                setCanvas(canvas);
            }} />
        </React.Fragment>
    )
}

export default MnistModelTrainer;