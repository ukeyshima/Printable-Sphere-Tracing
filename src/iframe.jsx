import React, { useEffect, useRef } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { codeState, renderResultState, canvasSizeState, sliceNumState } from './store'
import { makeStyles } from '@material-ui/core/styles';
import WebGL from './webGL'
import ver from './vertexShader.glsl'
import fra from './fragmentShader.glsl'
import dep from './depthShader.glsl'

const useStyles = makeStyles(() => ({
    iframe: {
        width: '30vw',
        height: '30vw'
    }
}));

const Iframe = () => {
    const classes = useStyles();
    const code = useRecoilValue(codeState)
    const sliceNum = useRecoilValue(sliceNumState)
    const canvasSize = useRecoilValue(canvasSizeState)
    const setRenderResult = useSetRecoilState(renderResultState)

    const iframe = useRef()
    const position = [
        -1.0, 1.0, 0.0, 1.0,
        1.0, 0.0, -1.0, -1.0,
        0.0, 1.0, -1.0, 0.0
    ]
    const index = [0, 2, 1, 1, 2, 3]
    const vsText = ver()
    const fsText = fra().replace("//Write distFunc code", code).replace("//sliceBoxSizeY", "1.0").replace("//slicePositionY", "0.0")
    const uniList = ["iTime", "iResolution", "rotateX", "rotateY"]
    const attList = [["position", 3]]

    const render = (gl, extension, vao, program, index, uniList, canvasSize, time, rotateX, rotateY) => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(program)
        extension.bindVertexArrayOES(vao)
        gl.uniform1f(uniList[0], time)
        gl.uniform2fv(uniList[1], canvasSize)
        gl.uniform1f(uniList[2], rotateX)
        gl.uniform1f(uniList[3], rotateY)
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)
        gl.flush()
    }

    useEffect(() => {
        try {
            const iframeWindow = iframe.current.contentWindow
            const iframeDocument = iframeWindow.document
            iframeDocument.open()
            iframeDocument.write(`<canvas></canvas>`)
            iframeDocument.close()
            iframeDocument.body.style.margin = 0

            const canvas = iframeDocument.getElementsByTagName('canvas')[0]
            canvas.style.width = '100%'
            canvas.style.height = '100%'
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height

            const webgl = new WebGL(canvas,
                [
                    { vsText: vsText, fsText: fsText, uniList: uniList, attList: attList }
                ].concat(
                    new Array(sliceNum).fill(0).flatMap((e, i) => {
                        return ([
                            // new Array(sliceNum * 2).fill(0).flatMap((e, i) => ([
                            // {
                            //     vsText: vsText, fsText:
                            //         fra().replace("//Write distFunc code", code).replace("//sliceBoxSizeZ", "0.001").replace("//slicePositionZ", i / sliceNum * 2.0 - 1.0)
                            //     , uniList: uniList, attList: attList
                            // },
                            {
                                vsText: vsText, fsText:
                                    dep().replace("//Write distFunc code", code).replace("//rayStartPosY", "1.0").replace("//rayDirectionY", "-1.0").replace("//slicePositionY", i * 2 / (sliceNum - 1) - 1.0)
                                , uniList: uniList, attList: attList
                            }
                        ])
                    }
                    )
                )
            )


            render(webgl.gl, webgl.extension, webgl.makeVAO(position, index, webgl.webglPrograms[0].attLocations), webgl.webglPrograms[0].program, index, webgl.webglPrograms[0].uniLocations, [canvas.width, canvas.height], 0.0, 0.0, 0.0)

            let drag = false
            let rotateX = 0.0
            let rotateY = 0.0
            let preX = 0.0
            let preY = 0.0
            iframeDocument.addEventListener("mousedown", e => {
                drag = true
                preX = e.clientX
                preY = e.clientY
            })

            iframeDocument.addEventListener("mousemove", e => {
                if (drag) {
                    rotateX += (e.clientY - preY) / 100
                    rotateY += (e.clientX - preX) / 100                    
                    render(webgl.gl, webgl.extension, webgl.makeVAO(position, index, webgl.webglPrograms[0].attLocations), webgl.webglPrograms[0].program, index, webgl.webglPrograms[0].uniLocations, [canvas.width, canvas.height], 0.0, rotateX, rotateY)
                    preX = e.clientX
                    preY = e.clientY
                }
            })

            iframeDocument.addEventListener("mouseup", () => {
                drag = false
                render(webgl.gl, webgl.extension, webgl.makeVAO(position, index, webgl.webglPrograms[0].attLocations), webgl.webglPrograms[0].program, index, webgl.webglPrograms[0].uniLocations, [canvas.width, canvas.height], 0.0, 0.0, 0.0)
            })


            const frameBuffer = webgl.makeFrameBuffer(canvas.width, canvas.height)

            const renderResult = (w, h) => {
                // const datas = new Array(sliceNum * 2).fill(0).map(e => new Uint8Array(w * h * 4))
                const datas = new Array(sliceNum).fill(0).map(e => new Uint8Array(w * h * 4))

                webgl.webglPrograms.slice(1).forEach((e, i) => {
                    webgl.gl.bindFramebuffer(webgl.gl.FRAMEBUFFER, frameBuffer.f)
                    render(webgl.gl, webgl.extension, webgl.makeVAO(position, index, e.attLocations), e.program, index, e.uniLocations, [canvas.width, canvas.height], 0)
                    webgl.gl.readPixels(0, 0, w, h, webgl.gl.RGBA, webgl.gl.UNSIGNED_BYTE, datas[i])
                    webgl.gl.bindFramebuffer(webgl.gl.FRAMEBUFFER, null)
                })
                return datas
            }

            setRenderResult(renderResult(canvas.width, canvas.height))
        } catch (e) {
            console.log(e)
        }
    })

    return <iframe ref={iframe} className={classes.iframe} />
}

export default Iframe


