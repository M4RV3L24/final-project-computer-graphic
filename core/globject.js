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
    
    worldMatrix = null;
    localMatrix = null;
    objectUniformConfig = null;
    _childs = null;

    constructor(GL, vertices, faces, programInfo=null, objectUniformConfig=null) {
        this._GL = GL;
        this._vertices = vertices;
        this._faces = faces;
        this._programInfo = programInfo;
        
        this._triangle_vbo = this._GL.createBuffer();
        this._triangle_ebo = this._GL.createBuffer();
        
        this.localMatrix = LIBS.get_I4();
        this.objectUniformConfig = objectUniformConfig;
        this._childs = [];
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
            child.programInfo = this._programInfo;
        })
    }

    render(worldMatrix=null) {
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
        size = 3;
        offset = 3*4;
        this._GL.vertexAttribPointer(
            this._normalAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );

        // Set all object uniform values
        {
            let setAndApplyUniformValue = (...prop)=>this._programInfo.uniformConfig.setAndApplyUniformValue(...prop);

            let modelMatrix;
            if (worldMatrix != null) {
                modelMatrix = LIBS.multiplyCopy(worldMatrix, this.localMatrix);
            } else {
                modelMatrix = this.localMatrix;
            }
            let normalMatrix = LIBS.inverseCopy(modelMatrix);
            LIBS.transpose(normalMatrix);

            setAndApplyUniformValue("MMatrix", false, modelMatrix);
            setAndApplyUniformValue("normalMatrix", false, normalMatrix);
            
            if (this.objectUniformConfig != null)
                this.objectUniformConfig.applyAll();
        }

        this._GL.bindBuffer(this._GL.ARRAY_BUFFER, this._triangle_vbo);
        this._GL.bindBuffer(this._GL.ELEMENT_ARRAY_BUFFER, this._triangle_ebo);
        this._GL.drawElements(this._GL.TRIANGLES, this._faces.length, this._GL.UNSIGNED_INT, 0);

        this._childs.forEach((child) => {
            child.render();
        })
    }

    addChild(childObj) {
        this._childs.push(childObj);
    }

    removeChild(childObj) {
        let index = this.findChild(childObj);

        if (index == -1)
            throw new Error("Cannot remove child: no matching child found");

        this._childs.splice(index, 1);
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
        if (this._parent === parentObj)
            return;

        this.removeParent();

        this._parent = parentObj;
        parentObj.addChild(this);
    }

    removeParent() {
        GLObject._disconnect(this._parent, this);
    }

    static _disconnect(parent, child) {
        if (parent == null || child == null)
            return;
        if (parent.hasChild(child))
            parent.removeChild(child);
        if (child._parent == parent)
            child._parent = null;
    }

    static _connect(parent, child) {
        if (!parent.hasChild(child))
            parent.addChild(child);
        if (child._parent != null)
            child.removeParent();
        child._parent = parent;
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
