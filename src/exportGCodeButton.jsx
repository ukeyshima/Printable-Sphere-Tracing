import Button from '@material-ui/core/Button';
import { renderResultState, canvasSizeState, sliceNumState } from './store'
import React from 'react';
import { useRecoilValue } from 'recoil'
import slic3rGcode from './slic3rGcode'

const ExportButton = () => {
    const renderResult = useRecoilValue(renderResultState)
    const canvasSize = useRecoilValue(canvasSizeState)
    const sliceNum = useRecoilValue(sliceNumState)

    const exportGCode = () => {
        let positions = [];
        let startPoint = { x: 100, y: 100, z: 0.35 }

        const sliceImages = renderResult.map(e => ({ paths: [], image: Array.from(e).filter((f, i) => (i % 4 == 3)).map(f => ({ passed: false, alpha: f })) }))

        sliceImages.forEach(sliceImage => {
            for (let y = 0; y < canvasSize.height; y++) {
                for (let x = 0; x < canvasSize.width; x++) {
                    if (isContour(sliceImage.image, canvasSize.width, canvasSize.height, x, y)) {
                        const path = [{ x: x, y: y }]
                        contourTracing(path, sliceImage.image, canvasSize.width, canvasSize.height, x, y)
                        sliceImage.paths.push(path)
                    }
                }
            }
        })

        sliceImages.forEach(sliceImage => {
            for (let y = 0; y < canvasSize.height; y += 1) {
                for (let x = 0; x < canvasSize.width; x += 1) {
                    if (isInternal(sliceImage.image, canvasSize.width, canvasSize.height, x, y)) {
                        const path = [{ x: x, y: y }]
                        internalTracing(path, sliceImage.image, canvasSize.width, canvasSize.height, x, y)
                        sliceImage.paths.push(path)
                    }
                }
            }
        })

        sliceImages.forEach((sliceImage, z) => {
            const position = {
                xy: [],
                z: z / (sliceNum - 1)
            }
            sliceImage.paths.forEach(path => {
                if (path.length > 0) {
                    position.xy.push({
                        x: path[0].x / canvasSize.width - 0.5,
                        y: path[0].y / canvasSize.height - 0.5,
                        type: "G0"
                    })
                    if (path.length > 1) {
                        path.reduce((pre, cur) => {
                            const vec = normalize(pre.x, pre.y, cur.x, cur.y)
                            if (vec.toString() != pre.vec.toString()) {
                                position.xy.push({
                                    x: cur.x / canvasSize.width - 0.5,
                                    y: cur.y / canvasSize.height - 0.5,
                                    type: "G1"
                                })
                            }
                            return { x: cur.x, y: cur.y, vec: vec }
                        }, { x: path[0].x, y: path[0].y, vec: normalize(path[0].x, path[0].y, path[1].x, path[1].y) })
                    }
                    position.xy.push({
                        x: path[path.length - 1].x / canvasSize.width - 0.5,
                        y: path[path.length - 1].y / canvasSize.height - 0.5,
                        type: "G1"
                    })
                }
            })
            positions.push(position)
        })
        const size = 80
        // 0.3/(positions[1].z - positions[0].z)

        const startZ = positions[0].z * size + startPoint.z

        let gCode = `${slic3rGcode.header}
G1 Z${startZ} F7800
G1 X20 Y20 F7800
G1 E2.0 F2400
G92 E0        
G1 X20 Y180 E2
G1 X180 Y180 E4
G1 X180 Y20 E6
G1 X20 Y20 E8`

        positions.forEach(position => {
            if (position.xy.length > 0) {
                const x = position.xy[0].x * size + startPoint.x
                const y = position.xy[0].y * size + startPoint.y
                const z = position.z * size + startPoint.z
                gCode += `
G1 X${x} Y${y} Z${z} F7800
G92 E0
G1 E2.0 F2400
G1 F1800`
                position.xy.slice(1).reduce((pre, cur) => {
                    const x = cur.x * size + startPoint.x
                    const y = cur.y * size + startPoint.y
                    let extrudeLength = pre.extrudeLength + Math.sqrt(Math.pow(x - pre.x, 2) + Math.pow(y - pre.y, 2)) / 30
                    if (cur.type == "G1") {
                        gCode += `
G1 X${x} Y${y} E${extrudeLength}`

                    } else {
                        extrudeLength = 2.0
                        gCode += `
G1 X${x} Y${y} F7800
G92 E0
G1 E2.0 F2400
G1 F1800`
                    }
                    return { x: x, y: y, type: cur.type, extrudeLength: extrudeLength }
                }, { x: x, y: y, type: "G0", extrudeLength: 2.0 })
            }
        })

        gCode += `${slic3rGcode.footer}`

        const blob = new Blob([gCode], { type: "text/plan" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sample.gcode';
        link.click();
    }

    return <Button variant="contained" color="primary" onClick={exportGCode}>Export GCode</Button>
}

export default ExportButton;

function normalize(x1, y1, x2, y2) {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    return [(x2 - x1) / length, (y2 - y1) / length]
}

function contourTracing(path, image, width, height, x, y) {
    const index = y * width + x
    image[index].passed = true

    const nextIndexs = [
        { x: x - 1, y: y + 1 },
        { x: x, y: y + 1 },
        { x: x + 1, y: y + 1 },
        { x: x + 1, y: y },
        { x: x + 1, y: y - 1 },
        { x: x, y: y - 1 },
        { x: x - 1, y: y - 1 },
        { x: x - 1, y: y }
    ].filter(e => {
        const i = e.y * width + e.x
        return image[i]
    })

    for (let i = 0; i < nextIndexs.length; i++) {
        if (isContour(image, width, height, nextIndexs[i].x, nextIndexs[i].y)) {
            path.push({ x: nextIndexs[i].x, y: nextIndexs[i].y })
            contourTracing(path, image, width, height, nextIndexs[i].x, nextIndexs[i].y)
            break

        }
    }
}

function isContour(image, width, height, x, y) {
    const index = y * width + x
    if (image[index].alpha > 0 && !image[index].passed) {
        const nextIndexs = [
            { x: x - 1, y: y + 1 },
            { x: x, y: y + 1 },
            { x: x + 1, y: y + 1 },
            { x: x + 1, y: y },
            { x: x + 1, y: y - 1 },
            { x: x, y: y - 1 },
            { x: x - 1, y: y - 1 },
            { x: x - 1, y: y }
        ].filter(e => {
            const i = e.y * width + e.x
            return image[i]
        })

        return nextIndexs.filter(e => {
            const i = e.y * width + e.x
            return image[i].alpha == 0
        }).length > 1
    } else {
        return false
    }

}

function internalTracing(path, image, width, height, x, y) {
    const index = y * width + x
    image[index].passed = true

    const nextIndexs = [
        { x: x + 1, y: y },
        { x: x + 1, y: y + 1 },
        { x: x, y: y + 1 },
        { x: x - 1, y: y },
        { x: x - 1, y: y + 1 },
        { x: x - 1, y: y - 1 },
        { x: x, y: y - 1 },
        { x: x + 1, y: y - 1 }
    ].filter(e => {
        const i = e.y * width + e.x
        return image[i]
    })

    for (let i = 0; i < nextIndexs.length; i++) {
        if (isInternal(image, width, height, nextIndexs[i].x, nextIndexs[i].y)) {
            path.push({ x: nextIndexs[i].x, y: nextIndexs[i].y })
            internalTracing(path, image, width, height, nextIndexs[i].x, nextIndexs[i].y)
            break
        }
    }
}

function isInternal(image, width, height, x, y) {
    const index = y * width + x
    if (image[index].alpha > 0 && !image[index].passed) {
        const nextIndexs = [
            { x: x + 1, y: y },
            { x: x + 1, y: y + 1 },
            { x: x, y: y + 1 },
            { x: x - 1, y: y },
            { x: x - 1, y: y + 1 },
            { x: x - 1, y: y - 1 },
            { x: x, y: y - 1 },
            { x: x + 1, y: y - 1 }
        ].filter(e => {
            const i = e.y * width + e.x
            return image[i]
        })

        return nextIndexs.every(e => {
            const i = e.y * width + e.x
            return image[i].alpha > 0
        })
    } else {
        return false
    }
}