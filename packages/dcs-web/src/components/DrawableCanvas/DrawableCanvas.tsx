import React from 'react';
import { fabric } from 'fabric';

const initFabricCanvas = (el: HTMLCanvasElement): fabric.Canvas => {
    const fc = new fabric.Canvas(el);
    fc.isDrawingMode = true;
    fc.freeDrawingBrush.color = '#000';
    fc.freeDrawingBrush.width = 1;
    return fc;
}

interface Props {
    onCanvasReady?: (canvas: HTMLCanvasElement, fabric: fabric.Canvas) => void;
}

const DrawableCanvas: React.FC<Props> = ({ onCanvasReady }) => {
    const [fc, setFc] = React.useState<fabric.Canvas | null>(null);

    return (
        <canvas width="50" height="50" ref={r => {
            if (r && !fc) {
                const newFC = initFabricCanvas(r);
                setFc(newFC);

                onCanvasReady?.(r, newFC);
            }
        }} style={{ border: '1px solid' }}>
        </canvas>
    )
};

export default DrawableCanvas;