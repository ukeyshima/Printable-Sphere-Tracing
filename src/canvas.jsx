import React, { useEffect, useRef } from 'react';
import { renderResultState, canvasSizeState } from './store'
import { useRecoilValue } from 'recoil'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    canvas: {
        width: '10vw',
        height: '10vw',
        border: "inset",
        borderWidth: 2
    }
}));

const Canvas = (props) => {
    const classes = useStyles();
    const renderResult = useRecoilValue(renderResultState)
    const canvasSize = useRecoilValue(canvasSizeState)
    const canvasRef = useRef()

    useEffect(() => {
        const canvas = canvasRef.current        
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height        
        const context = canvas.getContext('2d')
        const imageData = context.createImageData(canvasSize.width, canvasSize.height);        
        imageData.data.set(renderResult[props.index]);
        context.putImageData(imageData, 0, 0); 
    });

    return <canvas ref={canvasRef} className={classes.canvas} />
}

export default Canvas;


