class Matrix {
    _arr = null;
    _isTransposed = false;

    constructor(data = null, numRow = null, numCol = null) {
        if (data == null && numRow == null && numCol == null) {
            return new Matrix([[]]);
        }
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

        this._isTransposed = false;

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
                this._isTransposed = data._isTransposed;
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
        if (this._isTransposed)
            return col * this._numCol + row;
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
        if (this._isTransposed)
            return [this._numCol, this._numRow];
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
        // matrix multiplication
        let result = Matrix.matMul(this, matrix);
        this.load(result);
        return this;
    }

    rmatMul(matrix) {
        // reverse matrix multiplication
        // inplace and reverse matrix multiplication
        let result = Matrix.rmatMul(this, matrix);
        this.load(result);
        return this;
    }

    div(arg) {
        this._arithmetic(Matrix._div, arg);
        return this;
    }

    rdiv(arg) {
        this._arithmetic(Matrix._rdiv, arg);
        return this;
    }

    inverse(precision=1e-9) {
        this.load(Matrix.inverse(this, precision));
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

    transpose() {
        this._isTransposed = !this._isTransposed;
        return this;
    }

    swap(row1, col1, row2, col2) {
        if (row1 == row2 && col1 == col2)
            return this;

        let temp = this.get(row1, col1);
        this.set(row1, col1, this.get(row2, col2));
        this.set(row2, col2, temp);

        return this;
    }

    swapRow(row1, row2) {
        if (row1 == row2)
            return this;

        let cols = this.dim()[1];
        for (let j = 0; j < cols; j++) {
            this.swap(row1, j, row2, j);
        }

        return this;
    }

    swapCol(col1, col2) {
        if (col1 == col2)
            return this;

        let rows = this.dim()[0];
        for (let i = 0; i < rows; i++) {
           this.swap(i, col1, i, col2);
        }

        return this;
    }

    isSquare() {
        let dim = this.dim();
        return dim[0] == dim[1];
    }

    copy() {
        return new Matrix(this);
    }

    load(mat) {
        if (!mat instanceof Matrix)
            throw new Error("value error: expected matrix");

        this._arr = [...mat._arr];
        this._numRow = mat._numRow;
        this._numCol = mat._numCol;
        this._isTransposed = mat._isTransposed;

        return this;
    }

    arr() {
        let [row, col] = this.dim();
        let result = new Array(row);
        for (let i = 0; i < row; i++) {
            result[i] = new Array(col);
            for (let j = 0; j < col; j++) {
                result[i][j] = this.get(i, j);
            }
        }
        return result;
    }

    arrFlat() {
        // return a copy of all element
        // as 1D array in row major order
        if (this._isTransposed)
            return this.arr().flat();

        // this method works since
        // all elements of this._arr are numbers.
        return [...this._arr];
    }

    toGLMatrix() {
        // Matrix in WebGL follows column major order
        let result = this.transpose().arrFlat();
        this.transpose();
        return result
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

    static inverse(mat, precision=1e-9) {
        // source: http://web.archive.org/web/20210406035905/http://blog.acipo.com/matrix-inversion-in-javascript/
        
        // Using Gaussian Elimination to calculate the inverse:
        // (1) 'augment' the matrix (left) by the identity (on the right)
        // (2) Turn the matrix on the left into the identity by elemetry row ops
        // (3) The matrix on the right is the inverse (was the identity matrix)
        // There are 3 elemtary row ops: (b and c are combined in this code)
        // (a) Swap 2 rows
        // (b) Multiply a row by a scalar
        // (c) Add 2 rows

        //if the matrix isn't square: exit (error)
        if (!mat.isSquare()) {
            throw new Error("cannot find inverse of non-square matrix");
        }

        //create the identity matrix (I), and a copy (C) of the original
        var i, j, ii, e, dim = mat.dim()[0];
        var I = Matrix.identity(dim), C = mat.copy();

        // Perform elementary row operations
        for (i = 0; i < dim; i += 1) {
            // get the element e on the diagonal
            e = C.get(i, i);

            // if we have a 0 on the diagonal (we'll need to swap with a lower row)
            if (e < precision) {
                //look through every row below the i'th row
                for (ii = i + 1; ii < dim; ii += 1) {
                    //if the ii'th row has a non-0 in the i'th col
                    if (C.get(ii, i) != 0) {
                        //it would make the diagonal have a non-0 so swap it
                        C.swapRow(ii, i);
                        I.swapRow(ii, i);
                        //don't bother checking other rows since we've swapped
                        break;
                    }
                }
                //get the new diagonal
                e = C.get(i, i);
                //if it's still 0, not invertable (error)
                if (e == 0) {
                    throw new Error("the given matrix is not invertible");
                }
            }

            // Scale this row down by e (so we have a 1 on the diagonal)
            for (j = 0; j < dim; j++) {
                C.set(i, j, C.get(i, j) / e); //apply to original matrix
                I.set(i, j, I.get(i, j) / e); //apply to identity
            }

            // Subtract this row (scaled appropriately for each row) from ALL of
            // the other rows so that there will be 0's in this column in the
            // rows above and below this one
            for (ii = 0; ii < dim; ii++) {
                // Only apply to other rows (we want a 1 on the diagonal)
                if (ii == i) { continue; }

                // We want to change this element to 0
                e = C.get(ii, i);

                // Subtract (the row above(or below) scaled by e) from (the
                // current row) but start at the i'th column and assume all the
                // stuff left of diagonal is 0 (which it should be if we made this
                // algorithm correctly)
                for (j = 0; j < dim; j++) {
                    C.set(ii, j, C.get(ii, j) - e * C.get(i, j)); //apply to original matrix
                    I.set(ii, j, I.get(ii, j) - e * I.get(i, j)); //apply to identity
                }
            }
        }

        //we've done all operations, C should be the identity
        //matrix I should be the inverse:
        return I;
    }

    static fill(row, col, value) {
        let mat = new Matrix(null, row, col);
        Matrix._applyToAll(mat, () => value);
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

    static fromGLMatrix(mat, row, col) {
        return new Matrix([mat], row, col).transpose();
    }

    static _assertSameDims(mat1, mat2) {
        let dim1 = mat1.dim();
        let dim2 = mat2.dim()
        console.assert(
            (dim1[0] == dim2[0]) && (dim1[1] == dim2[1]),
            "Different dimensions",
            mat1, mat2
        );
    }

    static _applyElementWise(mat1, operator, mat2) {
        Matrix._assertSameDims(mat1, mat2);
        let [row, col] = mat1.dim();
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                mat1.set(i, j, operator(mat1.get(i, j), mat2.get(i, j)));
            }
        }
    }

    static _applyToAll(mat, operator, ...args) {
        let [row, col] = mat.dim();
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
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