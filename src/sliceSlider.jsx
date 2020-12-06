import React, { useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import { sliceNumState } from './store'
import { useRecoilState } from 'recoil'
import Grid from '@material-ui/core/Grid'
import Input from '@material-ui/core/Input';

const min = 1;
const max = 100;
const step = 1;

const useStyles = makeStyles({
    p: {
        color: "#ddd",
        fontSize: 13
    },
    input: {
        color: "#ddd",

    }
})

const SliceSlider = () => {
    const classes = useStyles()
    const [sliceNum, setSliceNum] = useRecoilState(sliceNumState);

    useEffect(() => {
        
    })


    return (
        <React.Fragment>
            <Typography className={classes.p}>Number of slices</Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                    <Slider
                        value={sliceNum}
                        onChange={(event, newValue) => setSliceNum(newValue)}
                        valueLabelDisplay="auto"
                        step={step}
                        marks
                        min={min}
                        max={max}
                    />
                </Grid>
                <Grid item>
                    <Input                    
                        className={classes.input}
                        value={sliceNum}
                        margin="dense"
                        onChange={event => setSliceNum(
                            Math.floor(event.target.value) > max ? max :
                                Math.floor(event.target.value) < min ? min :
                                    Math.floor(event.target.value)
                        )}
                        inputProps={{
                            step: step,
                            min: min,
                            max: max,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                        }}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default SliceSlider