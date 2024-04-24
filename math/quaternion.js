class Quaternion {
    constructor(...args) {
        let w, x, y, z;

        if (args.length == 0) {
            // Default constructor
            w = x = y = z = 0;
        }
        else if (args.length == 1 && args[0] instanceof Quaternion) {
            // Copy contructor
            w = args[0].w;
            x = args[0].x;
            y = args[0].y;
            z = args[0].z;
        }
        else if (
            args.length == 2
            && typeof(args[0]) == 'number'
            && args[1] instanceof Vector
            && args[1].dim() == 3
        ) {
            // Quaternion(real: Number, imaj: Vector)
            w = args[0];
            [x, y, z] = args[1].arr();
        }
        else if (args.length == 4) {
            // Quaternion(w: Number, x: Number, y: Number, z: Number)
            args.forEach((e)=> {
                if (typeof(e) != 'number') {
                    throw new Error("expected numbers");
                }
            });
            [w, x, y, z] = args;
        }
        else {
            throw new Error("overload resolution failed");
        }

        // Store the real part as scalar
        // and the imajinary parts as vector
        this._real = w;
        this._imaj = new Vector(x, y, z);
    }

    get w() {
        return this._real;
    }

    get x() {
        return this._imaj.get(0);
    }

    get y() {
        return this._imaj.get(1);
    }

    get z() {
        return this._imaj.get(2);
    }

    set w(val) {
        this._real = val;
    }

    set x(val) {
        return this._imaj.set(0, val);
    }

    set y(val) {
        return this._imaj.set(1, val);
    }

    set z(val) {
        return this._imaj.set(2, val);
    }

    arr() {
        return [this._real, ...this._imaj.arr()];
    }

    add(arg) {
        if (typeof(arg) == 'number') {
            this._real += arg;
            this._imaj.add(arg);
        } else if (arg instanceof Quaternion) {
            this._real += arg._real;
            this._imaj.add(arg._imaj);
        } else {
            throw new Error("method overload resolution failed");
        }

        return this;
    }

    sub(arg) {
        if (typeof(arg) == 'number') {
            this._real -= arg;
            this._imaj.sub(arg);
        } else if (arg instanceof Quaternion) {
            this._real -= arg._real;
            this._imaj.sub(arg._imaj);
        } else {
            throw new Error("method overload resolution failed");
        }

        return this;
    }

    qmul(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion");
        }
        this.load(Quaternion.qmul(this, q));
    }

    mul(arg) {
        if (typeof(arg) == 'number') {
            this._real *= arg;
            this._imaj.mul(arg);
        } else if (arg instanceof Quaternion) {
            this.qmul(arg);
        } else {
            throw new Error("method overload resolution failed");
        }

        return this;
    }

    div(arg) {
        if (typeof(arg) == 'number') {
            this._real /= arg;
            this._imaj.div(arg);
        } else if (arg instanceof Quaternion) {
            this.qmul(Quaternion.inverse(arg));
        } else {
            throw new Error("method overload resolution failed");
        }

        return this;
    }

    inverse() {
        this.load(Quaternion.inverse(this));
        return this;
    }

    conjugate() {
        this._imaj.neg();
        return this;
    }

    copy() {
        return new Quaternion(this);
    }

    dot(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion object");
        }
        return (this._real * q._real) + this._imaj.dot(q._imaj);
    }

    length2() {
        return this._real * this._real + this._imaj.length2();
    }

    length() {
        return Math.sqrt(this.length2());
    }

    load(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion object");
        }
        this._real = q._real;
        this._imaj = q._imaj.copy();

        return this;
    }

    static qmul(q1, q2) {
        // Quaternion multiplication
        if (!q1 instanceof Quaternion || !q2 instanceof Quaternion) {
            throw new Error("expected Quaternion object");
        }

        let real = q1._real * q2._real - Vector.dot(q1._imaj, q2._imaj);
        let imaj = (
            Vector.cross(q1._imaj, q2._imaj)
            .add(Vector.mul(q1._real, q2._imaj))
            .add(Vector.mul(q1._imaj, q2._real))
        );

        return new Quaternion(real, imaj);
    }

    static conjugate(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion");
        }
        return q.copy().conjugate();
    }

    static inverse(q) {
        if (!q instanceof Quaternion) {
            throw new Error("expected Quaternion");
        }
        return Quaternion.conjugate(q).div(q.length2());
    }
}