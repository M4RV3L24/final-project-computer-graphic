class Matrix {
    _arr = null;

    constructor(data = null, numRow = null, numCol = null) {
        if (numRow != null) {
            console.assert(
                Number.isInteger(numRow),
                "Number of rows should be integer"
            );
        }
        if (numCol != null) {
            console.assert(
                Number.isInteger(numCol),
                "Number of columns should be integer"
            );
        }

        let arr;
        if (data != null) {
            if (data instanceof Matrix) {
                // Copy constructor
                arr = data._arr;
                if (numRow == null) {
                    numRow = data._numRow;
                }
                if (numCol == null) {
                    numCol = data._numCol;
                }
            } else if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    let row = data[i];
                    console.assert(
                        Array.isArray(row),
                        "given data is not Matrix nor 2d array"
                    );
                    console.assert(
                        row.length == data[0].length,
                        `row ${i} have different lengths`
                    );
                }
                arr = data;
            }

            this._arr = arr.flat();
        } else if (numRow != null && numCol != null) {
            this._arr = new Array(numRow * numCol);
        } else {
            throw new Error("insufficient parameter");
        }

        if (numRow == null && numCol == null) {
            numRow = arr.length;
            numCol = numRow == 0 ? 0 : arr[0].length;
        } else if (numRow == null) {
            numRow = Math.floor(this._arr.length / numCol);
        } else if (numCol == null) {
            numCol = Math.floor(this._arr.length / numRow);
        }

        console.assert(
            numRow * numCol == this._arr.length,
            "Number of rows and columns doesn't match the number of data",
            numRow, numCol, this._arr.length
        );

        this._numRow = numRow;
        this._numCol = numCol;
    }

    _toIndex(row, col) {
        return row * this._numCol + col;
    }

    get(row, col) {
        return this._arr[this._toIndex(row, col)];
    }

    set(row, col, value) {
        console.assert(
            typeof (value) == "number",
            `Value error when setting element of row ${row} column ${col}.`,
            "Matrix can only hold numbers as elements. Given element: ",
            value
        );
        this._arr[this._toIndex(row, col)] = value;
        return this;
    }

    dim() {
        return [this._numRow, this._numCol];
    }

    add(arg) {
        this._arithmetic(Matrix._add, arg);
        return this;
    }

    radd(arg) {
        this._arithmetic(Matrix._radd, arg);
        return this;
    }

    sub(arg) {
        this._arithmetic(Matrix._sub, arg);
        return this;
    }

    rsub(arg) {
        this._arithmetic(Matrix._rsub, arg);
        return this;
    }

    // Element-wise multiplication.
    // For matrix multiplication see matMul and rmatMul
    mul(arg) {
        this._arithmetic(Matrix._mul, arg);
        return this;
    }

    rmul(arg) {
        this._arithmetic(Matrix._rmul, arg);
        return this;
    }

    matMul(matrix) {
        return Matrix.matMul(this, matrix);
    }

    rmatMul(matrix) {
        return Matrix.rmatMul(this, matrix);
    }

    div(arg) {
        this._arithmetic(Matrix._div, arg);
        return this;
    }

    rdiv(arg) {
        this._arithmetic(Matrix._rdiv, arg);
        return this;
    }

    neg() {
        this.mul(-1);
        return this;
    }

    abs() {
        Matrix._applyToAll(this, Math.abs);
        return this;
    }

    copy() {
        return new Matrix(this);
    }

    arr() {
        let result = new Array(this._numRow);
        for (let i = 0; i < this._numRow; i++) {
            result[i] = new Array(this._numCol);
            for (let j = 0; j < this._numCol; j++) {
                result[i][j] = this.get(i, j);
            }
        }
        return result;
    }

    arrFlat() {
        // return a copy of this._arr
        // this method works since
        // all elements of this._arr are numbers.
        return [...this._arr];
    }

    _arithmetic(operator, arg) {
        if (Array.isArray(arg)) {
            arg = new Matrix(arg, this._numRow, this._numCol);
        }

        if (arg instanceof Matrix) {
            Matrix._applyElementWise(this, operator, arg);
        } else if (typeof (arg) == "number") {
            Matrix._applyToAll(this, operator, arg);
        } else {
            throw new Error("Value error: given element are not Matrix nor scalar");
        }

        return this;
    }

    static _arithmetic(arg1, operator, roperator, arg2) {
        if (typeof (arg1) == "number") {
            if (typeof (arg2) == "number") {
                return operator(arg1, arg2);
            }
            return new Matrix(arg2)._arithmetic(roperator, arg1);
        }
        return new Matrix(arg1)._arithmetic(operator, arg2);
    }

    static add(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._add, Matrix._radd, arg2);
    }

    static radd(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._radd, Matrix._add, arg2);
    }

    static sub(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._sub, Matrix._rsub, arg2);
    }

    static rsub(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._rsub, Matrix._sub, arg2);
    }

    static mul(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._mul, Matrix._rmul, arg2);
    }

    static rmul(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._rmul, Matrix._mul, arg2);
    }

    static matMul(mat1, mat2) {
        // Matrices multipication

        console.assert(
            mat1 instanceof Matrix && mat2 instanceof Matrix,
            "given arguments are not matrices"
        );

        let [numRows1, numCols1] = mat1.dim(),
            [numRows2, numCols2] = mat2.dim();
        
        console.assert(
            numCols1 == numRows2,
            "invalid dimensions",
            "number of rows in the first matrix doesn't equal to the number of columns in the second matrix"
        );

        let result = Matrix.zeroes(numRows1, numCols2), tempVal;
        for (let i = 0; i < numRows1; i++) {
            for (let j = 0; j < numCols2; j++) {
                tempVal = 0;
                for (let k = 0; k < numCols1; k++) {
                    tempVal += mat1.get(i, k) * mat2.get(k, j);
                }
                result.set(i, j, tempVal);
            }
        }

        return result;
    }

    static rmatMul(mat1, mat2) {
        // Reversed matrices multipication
        return Matrix.matMul(mat2, mat1);
    }

    static div(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._div, Matrix._rdiv, arg2);
    }

    static rdiv(arg1, arg2) {
        return Matrix._arithmetic(arg1, Matrix._rdiv, Matrix._div, arg2);
    }

    static fill(row, col, value) {
        let mat = new Matrix(null, row, col);
        Matrix._applyToAll(mat, ()=>value);
        return mat;
    }

    static zeroes(row, col) {
        return Matrix.fill(row, col, 0);
    }

    static ones(row, col) {
        return Matrix.fill(row, col, 1);
    }

    static identity(size) {
        // Create identity square matrix
        let mat = Matrix.zeroes(size, size);

        // Set the diagonal to ones
        for (let i = 0; i < size; i++) {
            mat.set(i, i, 1);
        }

        return mat;
    }

    static copy() {
        return new Matrix([this._arr], this._numRow, this._numCol);
    }

    static _assertSameDims(mat1, mat2) {

        console.assert(Matrix.arrayIsEqual(mat1.dim(), mat2.dim()), "Different dimensions", mat1, mat2);
    }

    static arrayIsEqual(arr1, arr2) {
        if (arr1 === arr2) return true;
        if (arr1 == null || arr2 == null) return false;
        if (arr1.length !== arr2.length) return false;

        for (var i = 0; i < arr1.length; ++i) {
            if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
                // Recursive check
                if (!Matrix.arrayIsEqual(arr1[i], arr2[i]))
                    return false;
            }
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    static _applyElementWise(mat1, operator, mat2) {
        Matrix._assertSameDims(mat1, mat2);
        for (let i = 0; i < mat1._numRow; i++) {
            for (let j = 0; j < mat1._numCol; j++) {
                mat1.set(i, j, operator(mat1.get(i, j), mat2.get(i, j)));
            }
        }
    }

    static _applyToAll(mat, operator, ...args) {
        for (let i = 0; i < mat._numRow; i++) {
            for (let j = 0; j < mat._numCol; j++) {
                mat.set(i, j, operator(mat.get(i, j), ...args));
            }
        }
    }

    static _add(a, b) {
        return a + b;
    }

    static _radd(a, b) {
        return b + a;
    }

    static _sub(a, b) {
        return a - b;
    }

    static _rsub(a, b) {
        // reversed subtraction
        return b - a;
    }

    static _mul(a, b) {
        return a * b;
    }

    static _rmul(a, b) {
        return b * a;
    }

    static _div(a, b) {
        return a / b;
    }

    static _rdiv(a, b) {
        // reversed division
        return b / a;
    }
}