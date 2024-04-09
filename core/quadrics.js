function generateEllipsoid(uCount, vCount, a, b, c) {
    var vertices = [];

    let insidePoint = [0, 0, 0];
    for (let i = 0; i < uCount; i++) {
        let u = LIBS.map(i, 0, uCount-1, -Math.PI, Math.PI);
        
        let cu = Math.cos(u), su = Math.sin(u);
        for (let j = 0; j < vCount; j++) {
            let v = LIBS.map(j, 0, vCount-1, -Math.PI/2, Math.PI/(1.9));

            let cv = Math.cos(v), sv = Math.sin(v);

            // Position
            let p = [
                a * cv * cu,
                b * cv * su,
                c * sv
            ];

            /* Calculate normal vector */
            // Calculate first tangent vector
            let dp_du = [
                -a * cv * su,
                b * cv * cu,
                0
            ];
            // Calculate second tangent vector
            let dp_dv = [
                -a * sv * cu,
                -b * sv * su,
                c * cv
            ];
            // Calculate cross product
            let n = LIBS.cross(dp_du, dp_dv);
            // Normalize the normal vector
            LIBS.normalize(n);
            // Determine orientation of normal vector
            if (LIBS.dot(n, LIBS.sub(p, insidePoint)) < 0)
                LIBS.neg(n);

            vertices.push(...p);
            vertices.push(...n);
        }
    }

    var indices = [];
    for (let i = 0; i < uCount - 1; i++) {
        for (let j = 0; j < vCount - 2; j++) {
            let k1 = i * vCount + j;
            let k2 = k1 + vCount;
            indices.push(k1, k1 + 1, k2);
            indices.push(k1 + 1, k2, k2 + 1);
        }
    }

    return {vertices, indices};
}

function generateHyperboloid1(uCount, vCount, a, b, c) {
    var vertices = [], indices = [];

    var insidePoint = [0, 0, 0];
    
    let vertexCount = 0, rowLength = 0, rowLengthBefore = 0;
    for (let i = 0; i < vCount; i++) {
        let v = LIBS.map(i, 0, vCount-1, -Math.PI/2, Math.PI/2);
        if (LIBS.undefinedTanAngle(v))
            continue;
        let cv = Math.cos(v), tv = Math.tan(v);
        
        rowLength = 0;
        for (let j = 0; j < uCount; j++) {
            let u = LIBS.map(j, 0, uCount-1, -Math.PI, Math.PI);
            
            let cu = Math.cos(u), su = Math.sin(u);

            let p = [
                a * cu / cv,
                b * su / cv,
                c * tv
            ];

            /* Calculate normal vector */
            // Calculate first tangent vector
            let dp_du = [
                -a * su / cv,
                b * cu / cv,
                0
            ];
            // Calculate second tangent vector
            let dp_dv = [
                a * cu * tv / cv,
                b * su * tv / cv,
                c / (cv*cv)
            ]
            // Calculate cross product
            let n = LIBS.cross(dp_du, dp_dv);
            // Normalize the normal vector
            LIBS.normalize(n);
            // Determine orientation of normal vector
            if (LIBS.dot(n, LIBS.sub(p, insidePoint)) < 0)
                LIBS.neg(n);

            vertices.push(...p);
            vertices.push(...n);

            rowLength++;
            vertexCount++;

            if (i >= 1 && j >= 1 && rowLength <= rowLengthBefore) {
                let k1, k2;
                k1 = (vertexCount - 1) - rowLengthBefore - 1;
                k2 = (vertexCount - 1) - 1;
                indices.push(k1, k1 + 1, k2);
                indices.push(k1 + 1, k2, k2 + 1);
            }
        }
        rowLengthBefore = rowLength;
    }

    return {vertices, indices};
}

function generateHyperboloid2(uCount, vCount, a, b, c) {
    var vertices = [], indices = [];

    var insidePoint = [
        [0, 0, c],
        [0, 0, -c]
    ];
    
    let vertexCount = 0;
    for (let part = 0; part < 2; part++) {
        let rowLength = 0, rowLengthBefore = 0;
        for (let i = 0; i <= uCount; i++) {
            let u = LIBS.map(i, 0, uCount-1, -Math.PI / 2, Math.PI / 2);
            if (part == 1)
                u += Math.PI;

            let cu = Math.cos(u), su = Math.sin(u);
            rowLength = 0;
            for (let j = 0; j < vCount; j++) {
                let v = LIBS.map(j, 0, vCount-1, -Math.PI / 2, Math.PI / 2);
                if (LIBS.undefinedTanAngle(v))
                    continue;

                let cv = Math.cos(v), tv = Math.tan(v);

                let x, y, z;

                x = a * tv * cu;
                y = b * tv * su;
                z = c / cv;

                if (part == 1)
                    z = -z;

                /* Calculate normal vector */
                // Calculate first tangent vector
                let dp_du = [
                    -a * tv * su,
                    b * tv * cu,
                    0
                ];
                // Calculate second tangent vector
                let dp_dv = [
                    a * cu / (cv*cv),
                    b * su / (cv*cv),
                    z * tv
                ];
                
                // Calculate cross product
                let n = LIBS.cross(dp_du, dp_dv);
                // Normalize the normal vector
                LIBS.normalize(n);
                // Determine orientation of normal vector
                if (LIBS.dot(n, LIBS.sub([x, y, z], insidePoint[part])) < 0)
                    LIBS.neg(n);

                vertices.push(x, y, z);
                vertices.push(...n);

                rowLength++;
                vertexCount++;

                if (i >= 1 && j >= 1 && rowLength <= rowLengthBefore) {
                    let k1, k2;
                    k1 = (vertexCount - 1) - rowLengthBefore - 1;
                    k2 = (vertexCount - 1) - 1;
                    // indices.push(k1, k1 + 1, k2);
                    indices.push(k1 + 1, k2, k2 + 1);
                    indices.push(k1 + 1, k1 + 2, k2 + 1);
                }
            }
            rowLengthBefore = rowLength;
        }
    }

    return {vertices, indices};
}

function generateEllipticCone(uCount, vCount, a, b, c) {
    var vertices = [];
    for (let i = 0; i < uCount; i++) {
        let u = LIBS.map(i, 0, uCount-1, -Math.PI, Math.PI);
        let cu = Math.cos(u), su = Math.sin(u);
        for (let j = 0; j < vCount; j++) {
            let v = LIBS.map(j, 0, vCount-1, -20, 20);
            
            // Position
            let p = [
                a * v * cu,
                b * v * su,
                c * v
            ];

            /* Calculate normal vector */
            // Calculate first tangent vector
            let dp_du = [
                -a * v * su,
                b * v * cu,
                0
            ];
            // Calculate second tangent vector
            let dp_dv = [
                a * cu,
                b * su,
                c
            ];
            // Calculate cross product
            let n = LIBS.cross(dp_du, dp_dv);
            // Normalize the normal vector
            LIBS.normalize(n);

            vertices.push(...p);
            vertices.push(...n);
        }
    }

    var indices = [];
    for (let i = 0; i < uCount - 1; i++) {
        for (let j = 0; j < vCount - 1; j++) {
            let k1 = i * vCount + j;
            let k2 = k1 + vCount;
            indices.push(k1, k1 + 1, k2);
            indices.push(k1 + 1, k2, k2 + 1);
        }
    }

    return {vertices, indices};
}

function generateEllipticParaboloid(uCount, vCount, a, b, c) {
    var vertices = [];
    for (let i = 0; i < uCount; i++) {
        let u = LIBS.map(i, 0, uCount-1, -Math.PI, Math.PI);
        let cu = Math.cos(u), su = Math.sin(u);
        for (let j = 0; j < vCount; j++) {
            let v = LIBS.map(j, 0, vCount-1, 0, c);

            // Position
            let p = [
                a * v * cu,
                b * v * su,
                v*v
            ];

            /* Calculate normal vector */
            // Calculate first tangent vector
            let dp_du = [
                -a * v * su,
                b * v * cu,
                0
            ];
            // Calculate second tangent vector
            let dp_dv = [
                a * cu,
                b * su,
                2*v
            ];
            // Calculate cross product
            let n = LIBS.cross(dp_du, dp_dv);
            // Normalize the normal vector
            LIBS.normalize(n);

            vertices.push(...p);
            vertices.push(...n);
        }
    }

    var indices = [];
    for (let i = 0; i < uCount - 1; i++) {
        for (let j = 0; j < vCount - 1; j++) {
            let k1 = i * vCount + j;
            let k2 = k1 + vCount;
            indices.push(k1, k1 + 1, k2);
            indices.push(k1 + 1, k2, k2 + 1);
        }
    }

    return {vertices, indices};
}

function generateHyperbolicParaboloid(uCount, vCount, a, b, c) {
    var vertices = [];

    let outsidePoint = [0, 0, 0];
    for (let i = 0; i < uCount; i++) {
        let u = LIBS.map(i, 0, uCount-1, -Math.PI, Math.PI);
        let cu = Math.cos(u), tu = Math.tan(u);
        for (let j = 0; j < vCount; j++) {
            let v = LIBS.map(j, 0, vCount-1, 0, c);

            // Position
            let p = [
                a * v * tu,
                b * v / cu,
                v*v
            ];

            /* Calculate normal vector */
            // Calculate first tangent vector
            let dp_du = [
                a * v / (cu*cu),
                p[1] * tu,
                0
            ];
            // Calculate second tangent vector
            let dp_dv = [
                a * tu,
                b / cu,
                2*v
            ];
            // Calculate cross product
            let n = LIBS.cross(dp_du, dp_dv);
            // Normalize the normal vector
            LIBS.normalize(n);
            if (LIBS.dot(n, LIBS.sub(outsidePoint, p)) < 0)
                LIBS.neg(n);

            vertices.push(...p);
            vertices.push(...n);
        }
    }

    var indices = [];
    // Separate into 4 parts
    for (let k = 0; k < 4; k++) {
        let lb = Math.round(uCount * k / 4),
            ub = Math.round(uCount * (k+1) / 4);
        for (let i = lb; i < ub - 1; i++) {
            for (let j = 0; j < vCount - 1; j++) {
                let k1 = i * vCount + j;
                let k2 = k1 + vCount;
                indices.push(k1, k1 + 1, k2);
                indices.push(k1 + 1, k2, k2 + 1);
            }
        }
    }
    // Connect the upper parts (part 2 and 3)
    let i = Math.round(uCount * 2/4) - 1
    for (let j = 0; j < vCount - 1; j++) {
        let k1 = i * vCount + j;
        let k2 = k1 + vCount;
        indices.push(k1, k1 + 1, k2);
        indices.push(k1 + 1, k2, k2 + 1);
    }

    return {vertices, indices};
}