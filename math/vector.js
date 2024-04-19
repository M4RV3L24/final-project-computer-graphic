class Vector {
    _arr = null;

    constructor(...args) {
        let arr;
        if (args.length == 1) {
            if (args[0] instanceof Vector) {
                // Copy constructor
                arr = args[0]._arr;
            } else if (Array.isArray(args[0])) {
                arr = args[0];
            }
        } else {
            arr = args;
        }

        this._arr = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            this.set(i, arr[i]);
        }
    }

    get(index) {
        return this._arr[index];
    }

    set (index, value) {
        console.assert(
            typeof(value) == "number",
            `Value error when setting element of index ${index}.`,
            "Vector can only hold numbers as elements. Given element: ",
            value
        );
        this._arr[index] = value;
        return this;
    }

    dim() {
        return this._arr.length;
    }

    add(arg) {
        this._arithmetic(Vector._add, arg);
        return this;
    }

    radd(arg) {
        this._arithmetic(Vector._radd, arg);
        return this;
    }

    sub(arg) {
        this._arithmetic(Vector._sub, arg);
        return this;
    }

    rsub(arg) {
        this._arithmetic(Vector._rsub, arg);
        return this;
    }
    

    mul(arg) {
        this._arithmetic(Vector._mul, arg);
        return this;
    }

    rmul(arg) {
        this._arithmetic(Vector._rmul, arg);
        return this;
    }

    div(arg) {
        this._arithmetic(Vector._div, arg);
        return this;
    }

    rdiv(arg) {
        this._arithmetic(Vector._rdiv, arg);
        return this;
    }

    neg() {
        this.mul(-1);
        return this;
    }

    abs() {
        Vector._applyToAll(this, Math.abs);
        return this;
    }

    length2() {
        // length squared
        let result = 0;
        for (let i = 0; i < this.dim(); i++) {
            let x = this.get(i);
            result += x*x;
        }
        return result;
    }

    length() {
        return Math.sqrt(this.length2());
    }

    normalize() {
        this.div(this.length());
        return this;
    }

    dot(vec) {
        if (Array.isArray(vec)) {
            vec = new Vector(vec);
        }

        if (!vec instanceof Vector) {
            throw new Error("Value Error: given argument is not vector nor array");
        }

        Vector._assertSameDims(this, vec);
        let result = 0;
        for (let i = 0; i < this.dim(); i++) {
            result += this.get(i) * vec.get(i);
        }
        return result;
    }

    cross(vec) {
        if (Array.isArray(vec)) {
            vec = new Vector(vec);
        }

        if (!vec instanceof Vector) {
            throw new Error("Value Error: given argument is not vector nor array");
        }

        Vector._assertSameDims(this, vec);
        console.assert(
            this.dim() == 3,
            `Cross product are only supported for 3 dimensions vectors`
        );

        return new Vector([
            this.get(1) * vec.get(2) - this.get(2) * vec.get(1),
            this.get(2) * vec.get(0) - this.get(0) * vec.get(2),
            this.get(0) * vec.get(1) - this.get(1) * vec.get(0)
        ]);
    }

    copy() {
        return new Vector(this);
    }

    arr() {
        // return a copy of this._arr
        // this method works since
        // all elements of this._arr are numbers.
        return [...this._arr];
    }

    _arithmetic(operator, arg) {
        if (Array.isArray(arg)) {
            arg = new Vector(arg);
        }

        if (arg instanceof Vector) {
            Vector._applyElementWise(this, operator, arg);
        } else if(typeof(arg) == "number") {
            Vector._applyToAll(this, operator, arg);
        } else {
            throw new Error("Value error: given element are not vector nor scalar");
        }

        return this;
    }

    static _arithmetic(arg1, operator, roperator, arg2) {
        if (typeof(arg1) == "number") {
            if (typeof(arg2) == "number") {
                return operator(arg1, arg2);
            }
            return new Vector(arg2)._arithmetic(roperator, arg1);
        }
        return new Vector(arg1)._arithmetic(operator, arg2);
    }

    static add(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._add, Vector._radd, arg2);
    }

    static radd(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._radd, Vector._add, arg2);
    }

    static sub(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._sub, Vector._rsub, arg2);
    }

    static rsub(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._rsub, Vector._sub, arg2);
    }

    static mul(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._mul, Vector._rmul, arg2);
    }

    static rmul(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._rmul, Vector._mul, arg2);
    }

    static div(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._div, Vector._rdiv, arg2);
    }

    static rdiv(arg1, arg2) {
        return Vector._arithmetic(arg1, Vector._rdiv, Vector._div, arg2);
    }

    static dot(arg1, arg2) {
        return new Vector(arg1).dot(arg2);
    }

    static cross(arg1, arg2) {
        return new Vector(arg1).cross(arg2);
    }

    static zeroes(dim) {
        return new Vector(new Array(dim));
    }

    static _assertSameDims(vec1, vec2) {
        console.assert(vec1.dim() == vec2.dim(), "Different dimensions", vec1, vec2);
    }

    static _applyElementWise(vec1, operator, vec2) {
        Vector._assertSameDims(vec1, vec2);
        for (let i = 0; i < vec1.dim(); i++) {
            vec1.set(i, operator(vec1.get(i), vec2.get(i)));
        }
    }

    static _applyToAll(vec, operator, ...args) {
        for (let i = 0; i < vec.dim(); i++) {
            vec.set(i, operator(vec.get(i), ...args));
        }
    }

    static _add(a, b) {
        return a+b;
    }

    static _radd(a, b) {
        return b+a;
    }

    static _sub(a, b) {
        return a-b;
    }

    static _rsub(a, b) {
        // reversed subtraction
        return b-a;
    }

    static _mul(a, b) {
        return a*b;
    }

    static _rmul(a, b) {
        return b*a;
    }

    static _div(a, b) {
        return a/b;
    }

    static _rdiv(a, b) {
        // reversed division
        return b/a;
    }
}