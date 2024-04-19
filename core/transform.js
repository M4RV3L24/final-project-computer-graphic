class Transform3 {
    _mat = null;

    constructor(arg=null) {
        if (arg == null) {
            this.reset();
        } else if (arg instanceof Transform3) {
            this.load(arg);
        } else if (arg instanceof Matrix) {
            this._mat = arg.copy();
        }
    }

    reset() {
        this._mat = Matrix.identity(4);
    }

    matMul(mat) {
        this._mat.matMul(mat);
        return this;
    }

    rmatMul(mat) {
        this._mat.rmatMul(mat);
        return this;
    }

    rotateX(a) {
        this._mat = Transform3.rotateX(this._mat, a);
        return this;
    }

    rotateY(a) {
        this._mat = Transform3.rotateY(this._mat, a);
        return this;
    }

    rotateZ(a) {
        this._mat = Transform3.rotateZ(this._mat, a);
        return this;
    }

    rotate(ax, ay, az) {
        this._mat = Transform3.rotate(this._mat, ax, ay, az);
        return this;
    }

    rotateAlong(alpha, axis, origin) {
        this._mat = Transform3.rotateAlong(this._mat, alpha, axis, origin);
        return this;
    }

    translateX(t) {
        this._mat = Transform3.translateX(this._mat, t);
        return this;
    }

    translateY(t) {
        this._mat = Transform3.translateY(this._mat, t);
        return this;
    }

    translateZ(t) {
        this._mat = Transform3.translateZ(this._mat, t);
        return this;
    }

    translate(tx, ty, tz) {
        this._mat = Transform3.translate(this._mat, tx, ty, tz);
        return this;
    }

    translateUniform(t) {
        this._mat = Transform3.translateUniform(this._mat, t, t, t);
        return this;
    }

    scaleX(k) {
        this._mat = Transform3.scaleX(this._mat, k);
        return this;
    }

    scaleY(k) {
        this._mat = Transform3.scaleY(this._mat, k);
        return this;
    }

    scaleZ(k) {
        this._mat = Transform3.scaleZ(this._mat, k);
        return this;
    }

    scale(kx, ky, kz) {
        this._mat = Transform3.scale(this._mat, kx, ky, kz);
        return this;
    }

    scaleUniform(k) {
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
        return new Transform3().load(this);
    }

    load(transform) {
        if (!transform instanceof Transform3)
            throw new Error("expected Transform3");
        this._mat.load(transform._mat);
        return this;
    }

    static rotateX(mat, a) {
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

    static rotateY(mat, a) {
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

    static rotateZ(mat, a) {
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

    static rotate(mat, ax, ay, az) {
        Transform3.rotateX(mat, ax);
        Transform3.rotateY(mat, ay);
        Transform3.rotateZ(mat, az);
        return mat;
    }

    static rotateAlong(mat, alpha, axis, origin) {
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

    static translateX(mat, t) {
        mat.set(0, 3, mat.get(0, 3) + t);
        return mat;
    }

    static translateY(mat, t) {
        mat.set(1, 3, mat.get(1, 3) + t);
        return mat;
    }

    static translateZ(mat, t) {
        mat.set(2, 3, mat.get(2, 3) + t);
        return mat;
    }

    static translate(mat, tx, ty, tz) {
        Transform3.translateX(mat, tx);
        Transform3.translateY(mat, ty);
        Transform3.translateZ(mat, tz);
        return mat;
    }

    static translateUniform(mat, k) {
        Transform3.translateX(mat, k);
        Transform3.translateY(mat, k);
        Transform3.translateZ(mat, k);
        return mat;
    }

    static scaleX(mat, k) {
        mat.set(0, 0, mat.get(0, 0) * k);
        return mat;
    }

    static scaleY(mat, k) {
        mat.set(1, 1, mat.get(1, 1) * k);
        return mat;
    }

    static scaleZ(mat, k) {
        mat.set(2, 2, mat.get(2, 2) * k);
        return mat;
    }

    static scale(mat, kx, ky, kz) {
        Transform3.scaleX(mat, kx);
        Transform3.scaleY(mat, ky);
        Transform3.scaleZ(mat, kz);
        return mat;
    }

    static scaleUniform(mat, k) {
        Transform3.scaleX(mat, k);
        Transform3.scaleY(mat, k);
        Transform3.scaleZ(mat, k);
        return mat;
    }
}