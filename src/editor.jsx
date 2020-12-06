import React, { useEffect, useRef } from 'react';
import { monaco, ControlledEditor } from '@monaco-editor/react';
import { makeStyles } from '@material-ui/core/styles';
import { useRecoilState } from 'recoil';
import { codeState } from './store';
import Typography from '@material-ui/core/Typography'

monaco.init().then(monaco => {    
    monaco.languages.register({ id: 'glsl' });

    monaco.languages.setMonarchTokensProvider('glsl', {
        tokenizer: {
            root: [
                [/vec[0-4]|float/, "vector"],
                [/\-?\d\.\d*/, "number"]
            ]
        }
    });
    monaco.editor.defineTheme('glslTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'vector', foreground: '66d9ef'},
            { token: 'number', foreground: 'e6db74' },            
            { token: 'function', foreground: 'a6e22e' },            
            { token: 'variable', foreground: 'ae81ff' },
        ]
    });   
}).catch(e => console.error('An error occurred during initialization of Monaco: ', e));

const useStyles = makeStyles(() => ({
    p: {
        color: "#ddd",
        fontSize: 13
    }
}))

const Editor = () => {
    const classes = useStyles();
    const [code, setCode] = useRecoilState(codeState);    

    return <React.Fragment>
        {/* <Typography className={classes.p}>{"float distFunc(vec3 p) {"}</Typography> */}
        <ControlledEditor
            height="35vw"
            language="glsl"
            theme="glslTheme"
            value={code}
            onChange={(ev, val) => setCode(val)}
        />
        {/* <Typography className={classes.p}>{"}"}</Typography> */}
    </React.Fragment>;
}

export default Editor;