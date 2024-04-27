function generateUnitCube() {
    let vertices = [
        // back
        -1,-1,-1,     0, 0, -1,
         1,-1,-1,     0, 0, -1,
         1, 1,-1,     0, 0, -1,
        -1, 1,-1,     0, 0, -1,
    
        // front
        -1,-1, 1,     0, 0, 1,
         1,-1, 1,     0, 0, 1,
         1, 1, 1,     0, 0, 1,
        -1, 1, 1,     0, 0, 1,
    
        // left
        -1,-1,-1,     -1, 0, 0,
        -1, 1,-1,     -1, 0, 0,
        -1, 1, 1,     -1, 0, 0,
        -1,-1, 1,     -1, 0, 0,
    
        // right
         1,-1,-1,     1, 0, 0,
         1, 1,-1,     1, 0, 0,
         1, 1, 1,     1, 0, 0,
         1,-1, 1,     1, 0, 0,
    
        // bottom
        -1,-1,-1,     0, -1, 0,
        -1,-1, 1,     0, -1, 0,
         1,-1, 1,     0, -1, 0,
         1,-1,-1,     0, -1, 0,
    
        // top
        -1, 1,-1,     0, 1, 0,
        -1, 1, 1,     0, 1, 0,
         1, 1, 1,     0, 1, 0,
         1, 1,-1,     0, 1, 0
    ]
    
    
    let indices = [
        // back
        0,1,2,
        0,2,3,

        // front
        4,5,6,
        4,6,7,

        // left
        8,9,10,
        8,10,11,

        // right
        12,13,14,
        12,14,15,

        // bottom
        16,17,18,
        16,18,19,

        // top
        20,21,22,
        20,22,23
    ];

    return {vertices, indices};
}

function generateUnitCylinder(stepCount=360) {
    let vertices = [], indices = [], numVertices = 0;

    // Circular plane
    for (let y = -1; y <= 1; y+=2) {
        vertices.push(0, y, 0);  // position
        vertices.push(0, y, 0);  // normal
        numVertices++;

        let anchorIndex = numVertices - 1;
        for (let i = 0; i < stepCount; i++) {
            let alpha = LIBS.map(i, 0, stepCount, 0, 2*Math.PI);
            let ca = Math.cos(alpha), sa = Math.sin(alpha);

            x = ca;
            z = sa;
            vertices.push(x, y, z);  // position
            vertices.push(0, y, 0);  // normal
            numVertices++;

            if (i == 0)
                continue;
            indices.push(anchorIndex, numVertices-2, numVertices-1);
        }
        indices.push(anchorIndex, numVertices-1, anchorIndex+1);
    }

    // Curved surface
    let firstVertexIndex = numVertices;
    for (let i = 0; i < stepCount; i++) {
        let alpha = LIBS.map(i, 0, stepCount, 0, 2*Math.PI);
        let ca = Math.cos(alpha), sa = Math.sin(alpha);

        x = ca;
        z = sa;
        vertices.push(x, 1, z);  // position
        vertices.push(x, 0, z);  // normal
        numVertices++;
        vertices.push(x, -1, z);  // position
        vertices.push(x, 0, z);  // normal
        numVertices++;

        if (i == 0)
            continue;

        indices.push(numVertices-2, numVertices-4, numVertices-3);
        indices.push(numVertices-3, numVertices-2, numVertices-1);
    }
    indices.push(firstVertexIndex, numVertices-2, numVertices-1);
    indices.push(numVertices-1, firstVertexIndex, firstVertexIndex+1);

    return {vertices, indices};
}

function generateUnitCone(stepCount=360) {
    let vertices = [], indices = [], numVertices = 0;

    // Base of the cone
    vertices.push(0, -1, 0);  // position
    vertices.push(0, -1, 0);  // normal
    numVertices++;

    let baseAnchorIndex = numVertices - 1;
    for (let i = 0; i < stepCount; i++) {
        let alpha = LIBS.map(i, 0, stepCount, 0, 2*Math.PI);
        let ca = Math.cos(alpha), sa = Math.sin(alpha);

        x = ca;
        z = sa;
        vertices.push(x, -1, z);  // position
        vertices.push(0, -1, 0);  // normal
        numVertices++;

        if (i == 0)
            continue;
        indices.push(baseAnchorIndex, numVertices-2, numVertices-1);
    }
    indices.push(baseAnchorIndex, numVertices-1, baseAnchorIndex+1);

    // Side of the cone
    let firstVertexIndex = numVertices;
    vertices.push(0, 1, 0);  // position
    vertices.push(0, 1, 0);  // normal
    numVertices++;

    let tipIndex = numVertices - 1;
    for (let i = 0; i < stepCount; i++) {
        let alpha = LIBS.map(i, 0, stepCount, 0, 2*Math.PI);
        let ca = Math.cos(alpha), sa = Math.sin(alpha);

        x = ca;
        z = sa;
        vertices.push(x, -1, z);  // position
        vertices.push(x, 0, z);  // normal
        numVertices++;

        if (i == 0)
            continue;

        indices.push(tipIndex, numVertices-2, numVertices-1);
    }
    indices.push(tipIndex, numVertices-1, firstVertexIndex+1);

    console.log(indices);
    return {vertices, indices};
}