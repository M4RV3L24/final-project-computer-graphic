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

    _mode = null;

    _visibility = true;
    _boxColor = [1, 0, 0];
    _boxObject = null;
    _boundary = null;
    


    constructor(GL, vertices, faces, programInfo=null, objectUniformConfig=null, mode = null) {
        this._GL = GL;
        this._vertices = vertices;
        this._faces = faces;
        this._childs = [];
        this._mode = mode !== null ? mode : GL.TRIANGLES; // default drawing mode is TRIANGLE if no mode is provided
    
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
        let modelTransform;
        if (worldTransform != null) {
            modelTransform = worldTransform.copy();
            modelTransform.matrixRef().matMul(this.transform.matrixRef());
        } else {
            modelTransform = this.transform.copy();
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

        if (!this.isNullObject() && this._visibility) {
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
            this._GL.drawElements(this._mode, this._faces.length, this._GL.UNSIGNED_INT, 0);
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
    setDrawMode(mode=null) {
        this._mode = mode!==null ? mode : this._GL.TRIANGLES;
    }

    static setDrawMode(obj, mode=null) {
        obj.setDrawMode(mode!==null ? mode : obj._GL.TRIANGLES);
    }

    getVisibility() {
        return this._visibility;
    }

    setVisibility(isVisible, propagate=true) {
        this._visibility = isVisible;
        if (propagate) {
            // Propagate visibility to children
            this._childs.forEach((child) => {
                child.setVisibility(isVisible);
            });
        }
    }

    // Calculate the bounding box for the object
    calculateBoundingBox(visited = new Set(), worldTransform=null) {
        let modelTransform;
        if (worldTransform != null) {
            modelTransform = worldTransform.copy();
            modelTransform.matrixRef().matMul(this.transform.matrixRef());
        } else {
            modelTransform = this.transform.copy();
        }

        let minX = Number.MAX_SAFE_INTEGER, minY = Number.MAX_SAFE_INTEGER, minZ= Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER, maxY = Number.MIN_SAFE_INTEGER, maxZ = Number.MIN_SAFE_INTEGER;
        // if(obj != null) {
        //     minX = obj.min[0], minY = obj.min[1], minZ = obj.min[2];
        //     maxX = obj.max[0], maxY = obj.max[1], maxZ = obj.max[2];
        // }
        // Initialize maxX, maxY, maxZ to very small numbers to ensure they get updated
        
        const vertices = this._vertices;
        for (let i = 0; i < vertices.length; i += 3) {
            let x = vertices[i];
            let y = vertices[i + 1];
            let z = vertices[i + 2];

            //apply current object transformation
            [x, y, z] = modelTransform.applyToPoint(x, y, z);
            
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
    
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }
        // Recursively calculate the bounding box for child objects
        
        this._childs.forEach((child) => {
            
            const childBoundingBox = child.calculateBoundingBox(visited, modelTransform);
            // Update the bounding box based on child's bounding box
            
            if (childBoundingBox) {
            minX = Math.min(minX, childBoundingBox.min[0]);
            minY = Math.min(minY, childBoundingBox.min[1]);
            minZ = Math.min(minZ, childBoundingBox.min[2]);
            maxX = Math.max(maxX, childBoundingBox.max[0]);
            maxY = Math.max(maxY, childBoundingBox.max[1]);
            maxZ = Math.max(maxZ, childBoundingBox.max[2]);
            }

        });

        // Return the updated bounding box
        return { 
            min: [minX, minY, minZ],
            max: [maxX, maxY, maxZ]
        };
    }

    // Create the bounding box object based on calculated bounding box
    createBoundingBoxObject(box=null) {
        let min, max;

        if (box == null) {
            this._boundary = this.calculateBoundingBox();
        } else {
            this._boundary = {
                min: [...box.min],
                max: [...box.max],
            };
        }
        min = this._boundary.min, max = this._boundary.max;

        const vertices = [
            min[0], min[1], min[2],  0, 0, 0,
            min[0], min[1], max[2],  0, 0, 0,
            min[0], max[1], max[2],  0, 0, 0,
            min[0], max[1], min[2],  0, 0, 0,
            max[0], min[1], min[2],  0, 0, 0,
            max[0], min[1], max[2],  0, 0, 0,
            max[0], max[1], max[2],  0, 0, 0,
            max[0], max[1], min[2],  0, 0, 0
        ];

        const indices = [
            0, 1,  1, 2,  2, 3,  3, 0,  // bottom rectangle
            4, 5,  5, 6,  6, 7,  7, 4,  // top rectangle
            0, 4,  1, 5,  2, 6,  3, 7   // vertical connections
        ];

        this._boxObject = new GLObject(this._GL, vertices, indices);
        this._boxObject.setDrawMode(this._GL.LINES);
        this.addChild(this._boxObject);
        this._boxObject.setVisibility(true);
        
    }
    //function to update bounding box at each transition
    updateBoundingBox() {
        if (this._boxObject != null) {
            this.removeChild(this._boxObject);
            this.createBoundingBoxObject();
        }
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
