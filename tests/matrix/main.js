function main() {
    let mat;
    // Simple initialization
    {
        mat = new Matrix([[2983, 9435, 93095, 24]]);
        assertArrayEqual(mat.arr(), [[2983, 9435, 93095, 24]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 93095, 24]);
    }

    // Simple initialization with size
    {
        mat = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        assertArrayEqual(mat.arr(), [[2983, 9435], [93095, 24]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 93095, 24]);
    }

    // Copy constructor
    {
        mat = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        assertArrayEqual(mat.arr(), new Matrix(mat).arr());
    }

    // Automated column size
    {
        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], 2);
        assertArrayEqual(mat.arr(), [[2983, 9435, 93095, 24], [50, 2345, 999, 40]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 93095, 24, 50, 2345, 999, 40]);
    }

    // Automated row size
    {
        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], null, 4);
        assertArrayEqual(mat.arr(), [[2983, 9435, 93095, 24], [50, 2345, 999, 40]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 93095, 24, 50, 2345, 999, 40]);

        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], null, 2);
        assertArrayEqual(mat.arr(), [[2983, 9435], [93095, 24], [50, 2345], [999, 40]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 93095, 24, 50, 2345, 999, 40]);
    }
    
    // Get
    {
        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], 2, 4);
        assertValueEqual(mat.get(0, 0), 2983);
        assertValueEqual(mat.get(0, 1), 9435);
        assertValueEqual(mat.get(0, 2), 93095);
        assertValueEqual(mat.get(0, 3), 24);
        assertValueEqual(mat.get(1, 0), 50);
        assertValueEqual(mat.get(1, 1), 2345);
        assertValueEqual(mat.get(1, 2), 999);
        assertValueEqual(mat.get(1, 3), 40);
    }

    // Set
    {
        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], 2, 4);
        assertValueEqual(mat.get(0, 2), 93095);
        mat.set(0, 2, 489)
        assertValueEqual(mat.get(0, 2), 489);

        assertValueEqual(mat.get(1, 0), 50);
        mat.set(1, 0, 4950)
        assertValueEqual(mat.get(1, 0), 4950);

        assertValueEqual(mat.get(1, 1), 2345);
        mat.set(1, 1, 7948)
        assertValueEqual(mat.get(1, 1), 7948);

        assertArrayEqual(mat.arr(), [[2983, 9435, 489, 24], [4950, 7948, 999, 40]]);
        assertArrayEqual(mat.arrFlat(), [2983, 9435, 489, 24, 4950, 7948, 999, 40]);
    }

    // Dimensions
    {
        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], 2, 4);
        assertArrayEqual(mat.dim(), [2, 4]);

        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]], 4, 2);
        assertArrayEqual(mat.dim(), [4, 2]);

        mat = new Matrix([[2983, 9435, 93095, 24, 50, 2345, 999, 40]]);
        assertArrayEqual(mat.dim(), [1, 8]);
    }

    let mat1, mat2;

    // Add
    {
        mat1 = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        mat2 = new Matrix([[50, 2345, 999, 40]], 2, 2);

        mat1.add(mat2);
        assertArrayEqual(mat1.arrFlat(), [3033, 11780, 94094, 64]);

        mat2.add(mat1);
        assertArrayEqual(mat2.arrFlat(), [3083, 14125, 95093, 104]);
    }

    // Sub
    {
        mat1 = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        mat2 = new Matrix([[50, 2345, 999, 40]], 2, 2);

        mat1.sub(mat2);
        assertArrayEqual(mat1.arrFlat(), [2933, 7090, 92096, -16]);

        mat2.sub(mat1);
        assertArrayEqual(mat2.arrFlat(), [-2883, -4745, -91097, 56]);
    }

    // Mul
    {
        mat1 = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        mat2 = new Matrix([[50, 2345, 999, 40]], 2, 2);

        mat1.mul(mat2);
        assertArrayEqual(mat1.arrFlat(), [149150, 22125075, 93001905, 960]);

        mat2.mul(mat1);
        assertArrayEqual(mat2.arrFlat(), [7457500, 51883300875, 92908903095, 38400]);
    }

    // Div
    {
        mat1 = new Matrix([[72, 40824, 47616768, 10918583]], 2, 2);
        mat2 = new Matrix([[6, 54, 3984, 689]], 2, 2);

        mat1.div(mat2);
        assertArrayEqual(mat1.arrFlat(), [12, 756, 11952, 15847]);

        mat1.div(mat2);
        assertArrayEqual(mat1.arrFlat(), [2, 14, 3, 23]);
    }

    // Zeroes
    {
        mat = Matrix.zeroes(5, 3);
        assertArrayEqual(mat.arr(), [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);

        mat = Matrix.zeroes(2, 9);
        assertArrayEqual(mat.arr(), [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]]);

        mat = Matrix.zeroes(3, 3);
        assertArrayEqual(mat.arr(), [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    }

    // Ones
    {
        mat = Matrix.ones(5, 3);
        assertArrayEqual(mat.arr(), [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]]);

        mat = Matrix.ones(2, 9);
        assertArrayEqual(mat.arr(), [[1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1]]);

        mat = Matrix.ones(3, 3);
        assertArrayEqual(mat.arr(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    }

    // Identity
    {
        mat = Matrix.identity(2);
        assertArrayEqual(mat.arr(), [
            [1, 0],
            [0, 1]
        ]);

        mat = Matrix.identity(4);
        assertArrayEqual(mat.arr(), [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
        
        mat = Matrix.identity(3);
        assertArrayEqual(mat.arr(), [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
    }

    // Neg
    {
        mat = new Matrix([[2983, 9435, -93095, 24, -50, -2345, 999, 40]], 2, 4);
        mat.neg();
        assertArrayEqual(mat.arrFlat(), [-2983, -9435, 93095, -24, 50, 2345, -999, -40]);

        mat = Matrix.zeroes(2, 4);
        mat.neg();
        assertArrayEqual(mat.arrFlat(), [0, 0, 0, 0, 0, 0, 0, 0]);
    }

    let mat3;

    // Matrix multiplication
    {
        mat1 = new Matrix([[2983, 9435, 93095, 24, 78, 9927]], 2, 3);
        mat2 = new Matrix([[50, 2345, 999]], 3, 1);

        mat3 = Matrix.matMul(mat1, mat2);
        arrayIsEqual(mat3.arr(), [[115276130], [10101183]]);

        mat3 = Matrix.matMul(mat1, Matrix.identity(3));
        arrayIsEqual(mat3.arr(), mat1.arr());

        mat3 = Matrix.rmatMul(Matrix.identity(3), mat1);
        arrayIsEqual(mat3.arr(), mat1.arr());
    }

    // Swap row
    {
        mat = new Matrix([[72, 47616768, 40824, 10918583]], 2, 2);
        mat.swapRow(0, 1);
        assertArrayEqual(mat.arr(), [[40824, 10918583], [72, 47616768]]);
    }

    // Swap col
    {
        mat = new Matrix([[72, 47616768, 40824, 10918583]], 2, 2);
        mat.swapCol(0, 1);
        assertArrayEqual(mat.arr(), [[47616768, 72], [10918583, 40824]]);
    }

    // Matrix Multiplicative Inverse
    {
        mat1 = new Matrix([[72, 47616768, 40824, 10918583]], 2, 2);
        mat2 = Matrix.matMul(mat1, Matrix.inverse(mat1));
        assertArrayFloatEqual(mat2.arr(), Matrix.identity(2).arr());

        mat1 = new Matrix([[6, 3984, 54, 689]], 2, 2);
        mat2 = Matrix.matMul(mat1, Matrix.inverse(mat1));
        assertArrayFloatEqual(mat2.arr(), Matrix.identity(2).arr());
    }

    // Transpose
    {
        // Copy contructor

        mat = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        mat.transpose();
        assertArrayEqual(mat.arr(), new Matrix(mat).arr());


        // Square

        mat = new Matrix([[2983, 9435, 93095, 24]], 2, 2);
        mat.transpose();
        assertArrayEqual(mat.arr(), [[2983, 93095], [9435, 24]]);
        mat.transpose();
        assertArrayEqual(mat.arr(), [[2983, 9435], [93095, 24]]);

        
        // General

        mat = new Matrix([[2983, 9435, 93095, 24, 89, 3374]], 2, 3);
        mat.transpose();
        assertArrayEqual(mat.arr(), [[2983, 24], [9435, 89], [93095, 3374]]);
        mat.transpose();
        assertArrayEqual(mat.arr(), [[2983, 9435, 93095], [24, 89, 3374]]);


        // Add

        mat1 = new Matrix([[2983, 93095, 9435, 24]], 2, 2);
        mat2 = new Matrix([[50, 999, 2345, 40]], 2, 2);
        mat1.transpose();
        mat2.transpose();

        mat1.add(mat2);
        assertArrayEqual(mat1.arrFlat(), [3033, 11780, 94094, 64]);

        mat2.add(mat1);
        assertArrayEqual(mat2.arrFlat(), [3083, 14125, 95093, 104]);
    

        // Sub
    
        mat1 = new Matrix([[2983, 93095, 9435, 24]], 2, 2);
        mat2 = new Matrix([[50, 999, 2345, 40]], 2, 2);
        mat1.transpose();
        mat2.transpose();

        mat1.sub(mat2);
        assertArrayEqual(mat1.arrFlat(), [2933, 7090, 92096, -16]);

        mat2.sub(mat1);
        assertArrayEqual(mat2.arrFlat(), [-2883, -4745, -91097, 56]);
    

        // Mul
    
        mat1 = new Matrix([[2983, 93095, 9435, 24]], 2, 2);
        mat2 = new Matrix([[50, 999, 2345, 40]], 2, 2);
        mat1.transpose();
        mat2.transpose();

        mat1.mul(mat2);
        assertArrayEqual(mat1.arrFlat(), [149150, 22125075, 93001905, 960]);

        mat2.mul(mat1);
        assertArrayEqual(mat2.arrFlat(), [7457500, 51883300875, 92908903095, 38400]);
    

        // Div
    
        mat1 = new Matrix([[72, 47616768, 40824, 10918583]], 2, 2);
        mat2 = new Matrix([[6, 3984, 54, 689]], 2, 2);
        mat1.transpose();
        mat2.transpose();

        mat1.div(mat2);
        assertArrayEqual(mat1.arrFlat(), [12, 756, 11952, 15847]);

        mat1.div(mat2);
        assertArrayEqual(mat1.arrFlat(), [2, 14, 3, 23]);
    

        // Matrix multiplication
    
        mat1 = new Matrix([[2983, 24, 9435, 78, 93095, 9927]], 3, 2);
        mat2 = new Matrix([[50, 2345, 999]], 1, 3);
        mat1.transpose();
        mat2.transpose();
        
        mat3 = Matrix.matMul(mat1, mat2);
        arrayIsEqual(mat3.arr(), [[115276130], [10101183]]);


        // Swap row

        mat = new Matrix([[72, 40824, 47616768, 10918583]], 2, 2);
        mat.transpose();
        mat.swapRow(0, 1);
        assertArrayEqual(mat.arr(), [[40824, 10918583], [72, 47616768]]);


        // Swap col
    
        mat = new Matrix([[72, 40824, 47616768, 10918583]], 2, 2);
        mat.transpose();
        mat.swapCol(0, 1);
        assertArrayEqual(mat.arr(), [[47616768, 72], [10918583, 40824]]);


        // Matrix Multiplicative Inverse
        mat1 = new Matrix([[72, 47616768, 40824, 10918583]], 2, 2);
        mat1.transpose();
        mat2 = Matrix.matMul(mat1, Matrix.inverse(mat1));
        assertArrayFloatEqual(mat2.arr(), Matrix.identity(2).arr());
    }
    

    console.log("All matrix tests done!");
}

window.onload = main;