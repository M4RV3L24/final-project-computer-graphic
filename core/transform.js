class Transform3 {
    _mat = null;

    constructor() {
        this.reset();
    }

    reset() {
        this._mat = Matrix.identity(4);
    }

    matMul(mat) {
        this._mat = this._mat.matMul(mat);
        return this;
    }

    rmatMul(mat) {
        this._mat = mat.matMul(this._mat);
        return this;
    }

    rotateX(a) {
        let c = Math.cos(a);
        let s = Math.sin(a);
        
        let rotationMatrix = [
            [1, 0, 0, 0],
            [0, c, -s, 0],
            [0, s, c, 0],
            [0, 0, 0, 1]
        ];

        this.rmatMul(new Matrix(rotationMatrix));
        return this;
    }

    rotateY(a) {
        let c = Math.cos(a);
        let s = Math.sin(a);

        let rotationMatrix = [
            [c, 0, s, 0],
            [0, 1, 0, 0],
            [-s, 0, c, 0],
            [0, 0, 0, 1]
        ];

        this.rmatMul(new Matrix(rotationMatrix));
        return this;
    }

    rotateZ(a) {
        let c = Math.cos(a);
        let s = Math.sin(a);

        let rotationMatrix = [
            [c, -s, 0, 0],
            [s, c, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        this.rmatMul(new Matrix(rotationMatrix));
        return this;
    }

    rotate(ax, ay, az) {
        this.rotateX(ax);
        this.rotateY(ay);
        this.rotateZ(az);
        return this;
    }

    translateX(t) {
        this._mat.set(0, 3, this._mat.get(0, 3) + t);
        return this;
    }

    translateY(t) {
        this._mat.set(1, 3, this._mat.get(1, 3) + t);
        return this;
    }

    translateZ(t) {
        this._mat.set(2, 3, this._mat.get(2, 3) + t);
        return this;
    }

    translate(tx, ty, tz) {
        this.translateX(tx);
        this.translateY(ty);
        this.translateZ(tz);
        return this;
    }

    translateUniform(k) {
        this.translateX(k);
        this.translateY(k);
        this.translateZ(k);
        return this;
    }

    scaleX(k) {
        this._mat.set(0, 0, this._mat.get(0, 0) * k);
        return this;
    }

    scaleY(k) {
        this._mat.set(1, 1, this._mat.get(1, 1) * k);
        return this;
    }

    scaleZ(k) {
        this._mat.set(2, 2, this._mat.get(2, 2) * k);
        return this;
    }

    scale(sx, sy, sz) {
        this.scaleX(sx);
        this.scaleY(sy);
        this.scaleZ(sz);
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

    toGLMatrix() {
        let result = this._mat.transpose().arr();
        this._mat.transpose();
        return result
    }
}