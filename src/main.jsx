import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReactDOM from 'react-dom'
import { RecoilRoot } from 'recoil'
import Grid from '@material-ui/core/Grid'
import Editor from './editor'
import Iframe from './iframe'
import RenderResult from './renderResult'
import ExportGCodeButton from './exportGCodeButton'
import SliceSlider from './sliceSlider'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#333",
    padding: theme.spacing(2)
  }
}))

const App = () => {
  const classes = useStyles()

  return <RecoilRoot>
    <Grid container className={classes.root} spacing={2}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Editor />
        </Grid>
        <Grid item xs={4}>
          <Iframe />
          {/* <SliceSlider /> */}
          <ExportGCodeButton />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <RenderResult />
      </Grid>
    </Grid>
  </RecoilRoot>
}

ReactDOM.render(<App />, document.querySelector('#root'))
