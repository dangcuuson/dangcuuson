import React, { forwardRef } from 'react';
import { fabric } from 'fabric';

const initFabricCanvas = (el: HTMLCanvasElement): fabric.Canvas => {
    const fc = new fabric.Canvas(el);
    fc.isDrawingMode = true;
    fc.freeDrawingBrush.color = '#000';
    fc.freeDrawingBrush.width = 1;
    return fc;
}

interface Props {
    fcRef: React.RefObject<fabric.Canvas>
}

const DrawableCanvas = forwardRef<HTMLCanvasElement, Props>((props, ref) => {
    const [fc, setFc] = React.useState<fabric.Canvas | null>(null);

    return (
        <React.Fragment>
            <canvas width="500" height="500" ref={r => {
                if (r && !fc) {
                    const newFC = initFabricCanvas(r);
                    setFc(newFC);
                    // ref
                }
            }} style={{ border: '1px solid' }}>
            </canvas>
        </React.Fragment>
    )
})

export default DrawableCanvas;