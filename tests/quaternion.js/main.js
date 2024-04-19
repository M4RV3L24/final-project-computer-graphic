function main() {
    let q, q1, q2, q3;

    // Constructor
    {
        // Default
        q = new Quaternion();
        assertArrayEqual(q.arr(), [0, 0, 0, 0]);

        // All Number
        q1 = new Quaternion(3, 8943, -24, -2);
        assertArrayEqual(q1.arr(), [3, 8943, -24, -2]);

        // Copy
        q2 = new Quaternion(q1);
        q2.w = 10;
        q2.x = -288
        q2.y = -2;
        q2.z = 3761;
        assertArrayEqual(q1.arr(), [3, 8943, -24, -2]);
        assertArrayEqual(q2.arr(), [10, -288, -2, 3761]);
        
        // Number, Vector
        let imaj = new Vector(8943, -24, -2);
        q = new Quaternion(3, imaj);
        assertArrayEqual(q.arr(), [3, 8943, -24, -2]);
        imaj.set(0, 100);
        assertArrayEqual(q.arr(), [3, 8943, -24, -2]);  // unchanged
    }
    
    // Add
    {
        // Add all with scalar
        q1 = new Quaternion(3, 8943, -24, -2);
        q1.add(3);
        assertArrayEqual(q1.arr(), [6, 8946, -21, 1]);
        
        // Add element-wise another Quaternion
        q1 = new Quaternion(3, 8943, -24, -2);
        q2 = new Quaternion(10, -288, -2, 3761);
        q1.add(q2);
        assertArrayEqual(q1.arr(), [13, 8655, -26, 3759]);
    }

    // Sub
    {
        // Sub all with scalar
        q1 = new Quaternion(3, 8943, -24, -2);
        q1.sub(3);
        assertArrayEqual(q1.arr(), [0, 8940, -27, -5]);
        
        // Sub element-wise another Quaternion
        q1 = new Quaternion(3, 8943, -24, -2);
        q2 = new Quaternion(10, -288, -2, 3761);
        q1.sub(q2);
        assertArrayEqual(q1.arr(), [-7, 9231, -22, -3763]);
    }

    // Mul
    {
        // Mul all with scalar
        q1 = new Quaternion(3, 8943, -24, -2);
        q1.mul(3);
        assertArrayEqual(q1.arr(), [9, 26829, -72, -6]);
        
        // Quaternion multiplication
        q1 = new Quaternion(3, 8943, -24, -2);
        q2 = new Quaternion(10, -288, -2, 3761);
        q3 = Quaternion.qmul(q1, q2);
        assertArrayEqual(q3.arr(), [2583088, -1702, -33634293, -13535]);
    }

    // Multiplicative Inverse
    {
        q1 = new Quaternion(3, 8943, -24, -2);
        q2 = Quaternion.inverse(q1);
        q3 = Quaternion.qmul(q1, q2);
        assertArrayFloatEqual(q3.arr(), [1, 0, 0, 0]);
        q3 = Quaternion.qmul(q2, q1);
        assertArrayFloatEqual(q3.arr(), [1, 0, 0, 0]);
    }

    // Div
    {
        // Div all with scalar
        q1 = new Quaternion(3, 8943, -24, -2);
        q1.div(3);
        assertArrayEqual(q1.arr(), [1, 8943/3, -8, -2/3]);
        
        // Quaternion division
        q1 = new Quaternion(3, 8943, -24, -2);
        q2 = new Quaternion(10, -288, -2, 3761);
        q1.div(q2);
        assertArrayFloatEqual(q1.arr(), [
            -0.18154324706151578,
            0.012690459327549454,
            2.3638890569826656,
            0.0009484706008201055
        ]);
    }
    
    console.log("All quaternion tests done!");
}

window.onload = main;