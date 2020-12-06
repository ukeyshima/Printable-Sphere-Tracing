class WebGL {
    constructor(canvas, shadersInfo) {
        this.canvas = canvas
        this.gl = canvas.getContext('webgl')
        this.extension = this.makeExtension();
        this.webglPrograms = shadersInfo.map(info => {
            const vs = this.makeShader(info.vsText, this.gl.VERTEX_SHADER);
            const fs = this.makeShader(info.fsText, this.gl.FRAGMENT_SHADER);
            const program = this.makeProgram(vs, fs);
            return {
                vs: vs,
                fs: fs,
                program: program,
                uniLocations: info.uniList.map(e => this.gl.getUniformLocation(program, e)),
                attLocations: info.attList.map(e => [this.gl.getAttribLocation(program, e[0]), e[1]])
            }
        })
    }

    makeShader(text, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, text);
        this.gl.compileShader(shader);
        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            return shader;
        } else {            
            console.log(this.gl.getShaderInfoLog(shader));
        }
    }

    makeProgram(vs, fs) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.useProgram(program);
            return program;
        } else {
            return null;
        }
    }

    makeExtension() {
        const extension =
            this.gl.getExtension('OES_vertex_array_object') ||
            this.gl.getExtension('MOZ_OES_vertex_array_object') ||
            this.gl.getExtension('WEBKIT_OES_vertex_array_object');
        if (!extension) {
            console.log('vertex array object not supported');
            null;
        }
        return extension
    }

    makeVAO(position, index, attList) {
        const vao = this.extension.createVertexArrayOES();
        this.extension.bindVertexArrayOES(vao);        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(position), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(attList.map(e => e[0]));
        this.gl.vertexAttribPointer(attList.map(e => e[0]), attList.map(e => e[1]), this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer());
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), this.gl.STATIC_DRAW);
        this.extension.bindVertexArrayOES(null);        
        return vao
    }

    makeFrameBuffer(width, height) {
        const frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        const depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
        const fTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
    }
}

export default WebGL;