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

function generateCylinderCurvedSurface(radius1=1, radius2=radius1, sectorCount=100, stepCount=360) {
    let vertices = [], indices = [], numVertices = 0;

    // Curved surface
    for(let i = 0; i < sectorCount; i++){
        let radius = radius1 + (radius2 - radius1) * (i / (sectorCount - 1));

        for(let j = 0; j < stepCount; j++){
            let alpha = LIBS.map(j, 0, stepCount, 0, 2*Math.PI);
            let ca = Math.cos(alpha), sa = Math.sin(alpha);

            let x = ca * radius;
            let z = sa * radius;
            let y = i / (sectorCount - 1);

            vertices.push(x, y, z);
            vertices.push(x, 0, z);
            numVertices++;
        }

        if(i != 0){
            let firstVertexIndex = i * stepCount;
            let lastVertexIndex = (i + 1) * stepCount - 1;

            for(let j = firstVertexIndex; j < lastVertexIndex; j++){
                indices.push(j, j - stepCount, j - stepCount + 1);
                indices.push(j - stepCount + 1, j, j + 1);
            }

            indices.push(firstVertexIndex, firstVertexIndex - stepCount, firstVertexIndex - 1);
            indices.push(firstVertexIndex - 1, lastVertexIndex, firstVertexIndex);
        }
    }
    return {vertices, indices};
}

function generateCylinderFlatSurface(radius=1, stepCount=360){
    let vertices = [], indices = [], numVertices = 0;

    // Circular plane
    let y = 1
    vertices.push(0, y, 0);  // position
    vertices.push(0, y, 0);  // normal
    numVertices++;

    let anchorIndex = numVertices - 1;
    for (let i = 0; i < stepCount; i++) {
        let alpha = LIBS.map(i, 0, stepCount, 0, 2*Math.PI);
        let ca = Math.cos(alpha), sa = Math.sin(alpha);

        x = ca * radius;
        z = sa * radius;
        vertices.push(x, y, z);  // position
        vertices.push(0, y, 0);  // normal
        numVertices++;

        if (i == 0)
            continue;
        indices.push(anchorIndex, numVertices-2, numVertices-1);
    }
    indices.push(anchorIndex, numVertices-1, anchorIndex+1);

    return {vertices, indices}
}