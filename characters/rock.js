function bumpy({ vertices, indices }, maxDist = 1) {
    const size = 6;
    let n = vertices.length / size;
    for (let i = 0, k = 0; i < n; i++, k += size) {
        if (Math.random() < 0.5)
            continue;
        vertices[k] += maxDist * (2 * Math.random()**100 - 1);
        vertices[k + 1] += maxDist * (2 * Math.random()**100 - 1);
        vertices[k + 1] += maxDist * (2 * Math.random()**100 - 1);
    }
    return { vertices, indices };
}

function createRock(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    let objs = {};
    objs.root = createNullObject();
    {
        objs.rock1 = createObject(bumpy(generateEllipticParaboloid(100, 100, 5, 5, 5), 2));
        objs.rock1.transform.rotateX(Math.PI/2);

        objs.rock2 = createObject(bumpy(generateEllipticParaboloid(100, 100, 5, 5, 5), 3));
        objs.rock2.transform.rotateZ(Math.PI);
    }
    objs.root.addChilds(objs.rock1);

    return { objs }
}