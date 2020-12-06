import React, { useEffect, useRef } from 'react';
import { renderResultState, canvasSizeState } from './store'
import { useRecoilValue } from 'recoil'
import Grid from '@material-ui/core/Grid'
import Canvas from './canvas'

const RenderResult = () => {
    const renderResult = useRecoilValue(renderResultState)

    useEffect(() => {

    });

    return renderResult.map((e, i) => <Grid item key={i}>
        <Canvas index={i} />
    </Grid>)
}

export default RenderResult;


