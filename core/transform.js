class Transform3Interpolator extends AbstractInterpolator {
    _translationInterpolator;
    _rotationInterpolator;
    _scaleInterpolator;
    _start;
    _dim;
    constructor(start, ...ends) {
        super();
        if (!start instanceof Transform3) {
            throw new Error("expected Transform3");
        }
        this._dim = ends.length;
        this._start = start.copy();

        let translation = []
        let rotation = []
        let scale = []
        {
            let transformData = start.decompose();
            translation.push(transformData.translation);
            rotation.push(transformData.rotation);
            scale.push(transformData.scale);
        }

        for (let i = 0; i < ends.length; i++) {
            if (!ends[i] instanceof Transform3) {
                throw new Error("expected Transform3");
            }
            let transformData = ends[i].decompose();
            translation.push(transformData.translation);
            rotation.push(transformData.rotation);
            scale.push(transformData.scale);
        }

        this._translationInterpolator = new VectorInterpolator(...translation);
        this._rotationInterpolator = new RotQuatInterpolator(...rotation);
        this._scaleInterpolator = new VectorInterpolator(...scale);
    }

    interpolate(...normalizedWeights) {
        if (normalizedWeights.length != this.dim()) {
            throw new Error("the number of weights is not equal to the number of ends");
        }

        let transformData = {
            translation: this._translationInterpolator.interpolate(...normalizedWeights).arr(),
            rotation: this._rotationInterpolator.interpolate(...normalizedWeights),
            scale: this._scaleInterpolator.interpolate(...normalizedWeights).arr()
        }

        return Transform3.compose(transformData);
    }

    getStart() {
        return this._start.copy();
    }

    dim() {
        return this._dim;
    }
}


class Transform3 {
    _mat = null;

    constructor(arg = null) {
        if (arg == null) {
            this.reset();
        } else if (arg instanceof Transform3) {
            this._mat = new Matrix();
            this.load(arg);
        } else if (arg instanceof Matrix) {
            this._mat = arg.copy();
        } else {
            throw new Error("constructor overload failed");
        }
    }

    reset() {
        this._mat = Matrix.identity(4);
        return this;
    }

    rotateX(a = 0) {
        this._mat = Transform3.rotateX(this._mat, a);
        return this;
    }

    rotateY(a = 0) {
        this._mat = Transform3.rotateY(this._mat, a);
        return this;
    }

    rotateZ(a = 0) {
        this._mat = Transform3.rotateZ(this._mat, a);
        return this;
    }

    rotateAlong(alpha, axis, origin = [0, 0, 0]) {
        this._mat = Transform3.rotateAlong(this._mat, alpha, axis, origin);
        return this;
    }

    localRotateX(a = 0) {
        this._mat = Transform3.localRotateX(this._mat, a);
        return this;
    }

    localRotateY(a = 0) {
        this._mat = Transform3.localRotateY(this._mat, a);
        return this;
    }

    localRotateZ(a = 0) {
        this._mat = Transform3.localRotateZ(this._mat, a);
        return this;
    }

    localRotateAlong(alpha, axis, origin = [0, 0, 0]) {
        this._mat = Transform3.localRotateAlong(this._mat, alpha, axis, origin);
        return this;
    }

    translateX(t = 0) {
        this._mat = Transform3.translateX(this._mat, t);
        return this;
    }

    translateY(t = 0) {
        this._mat = Transform3.translateY(this._mat, t);
        return this;
    }

    translateZ(t = 0) {
        this._mat = Transform3.translateZ(this._mat, t);
        return this;
    }

    translate(tx = 0, ty = 0, tz = 0) {
        this._mat = Transform3.translate(this._mat, tx, ty, tz);
        return this;
    }

    translateUniform(t = 0) {
        this._mat = Transform3.translateUniform(this._mat, t, t, t);
        return this;
    }

    setTranslationX(t = 0) {
        this._mat = Transform3.setTranslationX(this._mat, t);
        return this;
    }
    
    setTranslationY(t = 0) {
        this._mat = Transform3.setTranslationY(this._mat, t);
        return this;
    }
    
    setTranslationZ(t = 0) {
        this._mat = Transform3.setTranslationZ(this._mat, t);
        return this;
    }

    setTranslationUniform(t = 0) {
        this._mat = Transform3.setTranslationUniform(this._mat, t);
        return this;
    }

    resetTranslation() {
        this._mat = Transform3.resetTranslation(mat);
        return this;
    }

    scaleX(k = 1) {
        this._mat = Transform3.scaleX(this._mat, k);
        return this;
    }

    scaleY(k = 1) {
        this._mat = Transform3.scaleY(this._mat, k);
        return this;
    }

    scaleZ(k = 1) {
        this._mat = Transform3.scaleZ(this._mat, k);
        return this;
    }

    scale(kx = 1, ky = 1, kz = 1) {
        this._mat = Transform3.scale(this._mat, kx, ky, kz);
        return this;
    }

    scaleUniform(k = 1) {
        this.scaleX(k);
        this.scaleY(k);
        this.scaleZ(k);
        return this;
    }

    matrix() {
        return this._mat.copy();
    }

    matrixRef() {
        // Return reference instead of copy
        return this._mat;
    }

    copy() {
        return new Transform3(this);
    }

    load(transform) {
        if (!transform instanceof Transform3)
            throw new Error("expected Transform3");
        this._mat.load(transform._mat);
        return this;
    }

    decompose() {
        // Return decomposition of this transform in TRS order
        // (Translation * Rotation * Scale)
        // Translation and Scale will be given as array,
        // while Rotation will be given as Quaternion

        // Create shorter reference, merely to improve code readability
        let mat = this._mat;

        // Based on: https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati

        let translation = [
            mat.get(0, 3),  // x
            mat.get(1, 3),  // y
            mat.get(2, 3)   // z
        ], scale = [
            Math.sqrt(mat.get(0, 0) ** 2 + mat.get(1, 0) ** 2 + mat.get(2, 0) ** 2),  // x
            Math.sqrt(mat.get(0, 1) ** 2 + mat.get(1, 1) ** 2 + mat.get(2, 1) ** 2),  // y
            Math.sqrt(mat.get(0, 2) ** 2 + mat.get(1, 2) ** 2 + mat.get(2, 2) ** 2)   // z
        ];


        // Convert rotation matrix to Quaternion
        // Based on: https://d3cw3dd2w32x2b.cloudfront.net/wp-content/uploads/2015/01/matrix-to-quat.pdf

        // Transpose to follow the order
        // of the matrix in the paper (column major)
        mat.transpose();

        let m00 = mat.get(0, 0) / scale[0], m01 = mat.get(0, 1) / scale[0], m02 = mat.get(0, 2) / scale[0],
            m10 = mat.get(1, 0) / scale[1], m11 = mat.get(1, 1) / scale[1], m12 = mat.get(1, 2) / scale[1],
            m20 = mat.get(2, 0) / scale[2], m21 = mat.get(2, 1) / scale[2], m22 = mat.get(2, 2) / scale[2];

        // Revert the transpose
        mat.transpose();

        let tempMat = new Matrix([
            [m00, m01, m02],
            [m10, m11, m12],
            [m20, m21, m22]
        ]).transpose();

        let t, rotation;
        if (m22 < 0) {
            if (m00 > m11) {
                t = 1 + m00 - m11 - m22;
                rotation = new Quaternion(m12 - m21, t, m01 + m10, m20 + m02);
            }
            else {
                t = 1 - m00 + m11 - m22;
                rotation = new Quaternion(m20 - m02, m01 + m10, t, m12 + m21);
            }
        }
        else {
            if (m00 < -m11) {
                t = 1 - m00 - m11 + m22;
                rotation = new Quaternion(m01 - m10, m20 + m02, m12 + m21, t);
            }
            else {
                t = 1 + m00 + m11 + m22;
                rotation = new Quaternion(t, m12 - m21, m20 - m02, m01 - m10);
            }
        }
        rotation.normalize();

        return { translation, rotation, scale };
    }

    static rotateX(mat, a = 0) {
        let c = Math.cos(a);
        let s = Math.sin(a);

        let rotationMatrix = [
            [1, 0, 0, 0],
            [0, c, -s, 0],
            [0, s, c, 0],
            [0, 0, 0, 1]
        ];

        return mat.rmatMul(new Matrix(rotationMatrix));
    }

    static rotateY(mat, a = 0) {
        let c = Math.cos(a);
        let s = Math.sin(a);

        let rotationMatrix = [
            [c, 0, s, 0],
            [0, 1, 0, 0],
            [-s, 0, c, 0],
            [0, 0, 0, 1]
        ];

        return mat.rmatMul(new Matrix(rotationMatrix));
    }

    static rotateZ(mat, a = 0) {
        let c = Math.cos(a);
        let s = Math.sin(a);

        let rotationMatrix = [
            [c, -s, 0, 0],
            [s, c, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        return mat.rmatMul(new Matrix(rotationMatrix));
    }

    static rotateAlong(mat, alpha, axis, origin = [0, 0, 0]) {
        // Rotation of a point in 3 dimensional space by 'alpha'
        // about an arbitrary axis defined by a line aligned
        // with a normalized vector 'axis' = (a1, a2, a3)
        // passing through point 'origin' = (p1, p2, p3)
        // can be achieved by the following steps:

        // (1) translate space so that the rotation axis passes through the origin
        Transform3.translateX(mat, -origin[0]);
        Transform3.translateY(mat, -origin[1]);
        Transform3.translateZ(mat, -origin[2]);

        // (2) rotate space about the x axis so that the rotation axis lies in the xz plane
        let a = Math.atan2(axis[1], axis[2]);
        Transform3.rotateX(mat, a);

        // (3) rotate space about the y axis so that the rotation axis lies along the z axis
        let d = Math.sqrt(axis[1] * axis[1] + axis[2] * axis[2]);
        let b = Math.atan2(axis[0], d);
        Transform3.rotateY(mat, b);

        // (4) perform the desired rotation by theta about the z axis
        Transform3.rotateZ(mat, alpha);

        // (5) apply the inverse of step (3) and (2)
        Transform3.rotateY(mat, -b);
        Transform3.rotateX(mat, -a);

        // (6) translate back so that the original point is at the origin again
        Transform3.translateX(mat, origin[0]);
        Transform3.translateY(mat, origin[1]);
        Transform3.translateZ(mat, origin[2]);

        return mat;
    }

    static _preTranslationTransform(transformFunction, mat, ...args) {
        let translation = Transform3.getTranslation(mat);
        Transform3.resetTranslation(mat);
        mat = transformFunction(mat, ...args);
        Transform3.translate(mat, ...translation);
        return mat;
    }

    // Local rotations are rotations ignoring the translations,
    // the effect will be as the rotation is done before the translation

    static localRotateX(mat, a = 0) {
        Transform3._preTranslationTransform(Transform3.rotateX, mat, a);
        return mat;
    }

    static localRotateY(mat, a = 0) {
        Transform3._preTranslationTransform(Transform3.rotateY, mat, a);
        return mat;
    }

    static localRotateZ(mat, a = 0) {
        Transform3._preTranslationTransform(Transform3.rotateZ, mat, a);
        return mat;
    }

    static localRotateAlong(mat, alpha, axis, origin = [0, 0, 0]) {
        Transform3._preTranslationTransform(Transform3.rotateAlong, mat, alpha, axis, origin);
        return mat;
    }

    static translateX(mat, t = 0) {
        mat.set(0, 3, mat.get(0, 3) + t);
        return mat;
    }

    static translateY(mat, t = 0) {
        mat.set(1, 3, mat.get(1, 3) + t);
        return mat;
    }

    static translateZ(mat, t = 0) {
        mat.set(2, 3, mat.get(2, 3) + t);
        return mat;
    }

    static translate(mat, tx = 0, ty = 0, tz = 0) {
        Transform3.translateX(mat, tx);
        Transform3.translateY(mat, ty);
        Transform3.translateZ(mat, tz);
        return mat;
    }

    static translateUniform(mat, t = 0) {
        Transform3.translateX(mat, t);
        Transform3.translateY(mat, t);
        Transform3.translateZ(mat, t);
        return mat;
    }

    static setTranslationX(mat, t = 0) {
        mat.set(0, 3, t);
        return mat;
    }
    
    static setTranslationY(mat, t = 0) {
        mat.set(1, 3, t);
        return mat;
    }
    
    static setTranslationZ(mat, t = 0) {
        mat.set(2, 3, t);
        return mat;
    }

    static setTranslationUniform(mat, t = 0) {
        Transform3.setTranslationX(mat, t);
        Transform3.setTranslationY(mat, t);
        Transform3.setTranslationZ(mat, t);
        return mat;
    }

    static getTranslation(mat) {
        return [mat.get(0, 3), mat.get(1, 3), mat.get(2, 3)];
    }

    static resetTranslation(mat) {
        mat.set(0, 3, 0);
        mat.set(1, 3, 0);
        mat.set(2, 3, 0);
        return mat;
    }

    // Do all scale before any other transformation

    static scaleX(mat, k = 1) {
        mat.set(0, 0, mat.get(0, 0) * k);
        mat.set(1, 0, mat.get(1, 0) * k);
        mat.set(2, 0, mat.get(2, 0) * k);
        mat.set(3, 0, mat.get(3, 0) * k);
        return mat;
    }

    static scaleY(mat, k) {
        mat.set(0, 1, mat.get(0, 1) * k);
        mat.set(1, 1, mat.get(1, 1) * k);
        mat.set(2, 1, mat.get(2, 1) * k);
        mat.set(3, 1, mat.get(3, 1) * k);
        return mat;
    }

    static scaleZ(mat, k = 1) {
        mat.set(0, 2, mat.get(0, 2) * k);
        mat.set(1, 2, mat.get(1, 2) * k);
        mat.set(2, 2, mat.get(2, 2) * k);
        mat.set(3, 2, mat.get(3, 2) * k);
        return mat;
    }

    static scale(mat, kx = 1, ky = 1, kz = 1) {
        Transform3.scaleX(mat, kx);
        Transform3.scaleY(mat, ky);
        Transform3.scaleZ(mat, kz);
        return mat;
    }

    static scaleUniform(mat, k = 1) {
        Transform3.scaleX(mat, k);
        Transform3.scaleY(mat, k);
        Transform3.scaleZ(mat, k);
        return mat;
    }

    static QuatToRotMatrix(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion");
        }

        // Transform Quaternion to rotation matrix
        // Based on: https://automaticaddison.com/how-to-convert-a-quaternion-to-a-rotation-matrix/

        // For shorter reference
        let { w, x, y, z } = q;

        let r00 = 1 - 2 * y * y - 2 * z * z;
        let r01 = 2 * x * y - 2 * z * w;
        let r02 = 2 * x * z + 2 * y * w;

        // Second row of the rotation matrix
        let r10 = 2 * x * y + 2 * z * w;
        let r11 = 1 - 2 * x * x - 2 * z * z;
        let r12 = 2 * y * z - 2 * x * w;

        // Third row of the rotation matrix
        let r20 = 2 * x * z - 2 * y * w;
        let r21 = 2 * y * z + 2 * x * w;
        let r22 = 1 - 2 * x * x - 2 * y * y;

        return new Matrix([[
            r00, r01, r02, 0,
            r10, r11, r12, 0,
            r20, r21, r22, 0,
            0, 0, 0, 1
        ]], 4, 4);
    }

    static compose({ translation, rotation, scale }) {
        // Apply in the order of TRS: Translation * Rotation * Scale
        // as such, we do scale first, then rotation, and lastly translation

        let transform = new Transform3();
        if (scale != undefined) {
            if (!Array.isArray(scale)) {
                throw new Error("expected array or null");
            }
            transform.scale(...scale);
        }
        if (rotation != undefined) {
            let rotMat = Transform3.QuatToRotMatrix(rotation);
            transform.matrixRef().rmatMul(rotMat);
        }
        if (translation != undefined) {
            transform.translate(...translation);
        }

        return transform;
    }
}