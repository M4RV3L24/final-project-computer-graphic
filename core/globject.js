class GLObject {
    _GL = null;
    _vertices = null;
    _faces = null;
    _programInfo = null;
    
    _positionAttributeLocation = null;
    _normalAttributeLocation = null;
    
    _triangle_vbo = null;
    _triangle_ebo = null;

    _parent = null;
    
    transform = null;
    objectUniformConfig = null;
    _childs = null;

    constructor(GL, vertices, faces, programInfo=null, objectUniformConfig=null) {
        this._GL = GL;
        this._vertices = vertices;
        this._faces = faces;
        this._childs = [];
        
        this._triangle_vbo = this._GL.createBuffer();
        this._triangle_ebo = this._GL.createBuffer();

        this.transform = new Transform3();
        this.objectUniformConfig = objectUniformConfig;

        if (programInfo != null)
            this.programInfo = programInfo;
    }

    setup() {
        this._GL.bindBuffer(this._GL.ARRAY_BUFFER, this._triangle_vbo);
        this._GL.bufferData(this._GL.ARRAY_BUFFER, new Float32Array(this._vertices), this._GL.STATIC_DRAW);

        this._GL.bindBuffer(this._GL.ELEMENT_ARRAY_BUFFER, this._triangle_ebo);
        this._GL.bufferData(this._GL.ELEMENT_ARRAY_BUFFER, new Uint32Array(this._faces), this._GL.STATIC_DRAW);

        this._childs.forEach((child) => {
            child.setup();
        })
    }

    set programInfo(_programInfo) {
        this._programInfo = _programInfo;
        this._GL.useProgram(this._programInfo.program);
        this._positionAttributeLocation = this._GL.getAttribLocation(this._programInfo.program, "position");
        this._normalAttributeLocation = this._GL.getAttribLocation(this._programInfo.program, "normal");
        this._GL.enableVertexAttribArray(this._positionAttributeLocation);
        this._GL.enableVertexAttribArray(this._normalAttributeLocation);
        this.objectUniformConfig = null;

        this._childs.forEach((child) => {
            child.programInfo = _programInfo;
        })
    }

    isNullObject() {
        return this._faces.length == 0;
    }

    render(worldTransform=null) {
        console.log(worldTransform)
        let modelTransform;
        if (worldTransform != null) {
            modelTransform = this.transform.copy();
            modelTransform.matMul(worldTransform.matrixRef())
        } else {
            modelTransform = this.transform;
        }

        let modelMatrix = modelTransform.matrixRef().toGLMatrix(),
            normalMatrix = Matrix.inverse(modelTransform.matrixRef()).transpose().toGLMatrix();

        // Set all object uniform values
        {
            let setUniformValue = (...prop)=>this._programInfo.uniformConfig.setUniformValue(...prop);
            setUniformValue("MMatrix", false, modelMatrix);
            setUniformValue("normalMatrix", false, normalMatrix);
            this._programInfo.uniformConfig.applyAll();
            
            if (this.objectUniformConfig != null)
                this.objectUniformConfig.applyAll();
        }

        if (!this.isNullObject()) {
            this._GL.bindBuffer(this._GL.ARRAY_BUFFER, this._triangle_vbo);
            var size = 3;
            var type = this._GL.FLOAT;
            var normalize = false;
            var stride = 6*4;
            var offset = 0;
            this._GL.vertexAttribPointer(
                this._positionAttributeLocation,
                size,
                type,
                normalize,
                stride,
                offset
            );
            offset = 3*4;
            this._GL.vertexAttribPointer(
                this._normalAttributeLocation,
                size,
                type,
                normalize,
                stride,
                offset
            );
            this._GL.bindBuffer(this._GL.ELEMENT_ARRAY_BUFFER, this._triangle_ebo);
            this._GL.drawElements(this._GL.TRIANGLES, this._faces.length, this._GL.UNSIGNED_INT, 0);
        }

        this._childs.forEach((child) => {
            child.render(modelTransform);
        })
    }

    addChild(childObj) {
        GLObject._connect(this, childObj);
    }

    addChilds(...childObjs) {
        childObjs.forEach((childObj)=>{this.addChild(childObj)});
    }

    removeChild(childObj) {
        if (!this.hasChild(childObj))
            throw new Error("Cannot remove child: no matching child found");
        GLObject._disconnect(this, childObj);
    }

    hasChild(childObj) {
        return this.findChild(childObj) != -1;
    }

    findChild(childObj) {
        if (this._childs != null)
            for (let i = 0; i < this._childs.length; i++)
                if (this._childs[i] === childObj)
                    return i;
        return -1;
    }

    setParent(parentObj) {
        GLObject._connect(parentObj, this);
    }

    removeParent() {
        GLObject._disconnect(this._parent, this);
    }

    static _removeChildIfExists(parent, child) {
        let index = parent.findChild(child);
        
        if (index != -1)
            parent._childs.splice(index, 1);

        return index != -1;  // status (success or not)
    }

    static _disconnect(parent, child) {
        if (parent == null)
            throw new Error("Cannot disconnect, parent is null");
        if (child == null)
            throw new Error("Cannot disconnect, child is null");

        if (child.parent == parent)
            child.parent = null;

        GLObject._removeChildIfExists(parent, child);
    }

    static _connect(parent, child) {
        if (parent == null)
            throw new Error("Cannot connect, parent is null");
        if (child == null)
            throw new Error("Cannot connect, child is null");

        GLObject._removeChildIfExists(parent, child);
        parent._childs.push(child);

        if (child.parent == parent)
            return;
        
        if (child.parent != null)
            GLObject._removeChildIfExists(child.parent, child);
        child.parent = parent;
    }
}

function createShader(GL, type, source) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    var success = GL.getShaderParameter(shader, GL.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(GL.getShaderInfoLog(shader));
    GL.deleteShader(shader);
}

function createProgram(GL, vertexShader, fragmentShader) {
    var program = GL.createProgram();
    GL.attachShader(program, vertexShader);
    GL.attachShader(program, fragmentShader);
    GL.linkProgram(program);
    var success = GL.getProgramParameter(program, GL.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(GL.getProgramInfoLog(program));
    GL.deleteProgram(program);
}
