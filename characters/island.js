function extrudeY(polygon, yOffset, scaleTop = 1, scaleBottom = 1) {
    const size = 3;
    let n = polygon.length / size;

    let vertices = [];

    // Top
    for (let i = 0, k = 0; i < n; i++, k += 3) {
        vertices.push(polygon[k] * scaleTop, polygon[k + 1], polygon[k + 2] * scaleTop);
        vertices.push(0, 1, 0);
    }

    for (let i = 0, k = 0; i < n; i++, k += 3) {
        vertices.push(polygon[k] * scaleBottom, polygon[k + 1] + yOffset, polygon[k + 2] * scaleBottom);
        vertices.push(0, -1, 0);
    }

    // Side
    for (let i = 0, k = 0; i < n; i++, k += 3) {
        let pTop = [polygon[k] * scaleTop, polygon[k + 1], polygon[k + 2] * scaleTop];
        let pBottom = [polygon[k] * scaleBottom, polygon[k + 1] + yOffset, polygon[k + 2] * scaleBottom];
        let pTopBefore, pBottomBefore;
        if (i == 0) {
            pTopBefore = [polygon[size * n - 3] * scaleTop, polygon[size * n - 3 + 1], polygon[size * n - 3 + 2] * scaleTop];
            pBottomBefore = [polygon[size * n - 3] * scaleBottom, polygon[size * n - 3 + 1] + yOffset, polygon[size * n - 3 + 2] * scaleBottom];
        } else {
            pTopBefore = [polygon[k - 3] * scaleTop, polygon[k - 3 + 1], polygon[k - 3 + 2] * scaleTop];
            pBottomBefore = [polygon[k - 3] * scaleBottom, polygon[k - 3 + 1] + yOffset, polygon[k - 3 + 2] * scaleBottom];
        }
        let normal = Vector.sub(pTopBefore, pTop).cross(Vector.sub(pBottomBefore, pTopBefore)).normalize().arr();

        vertices.push(...pTopBefore);
        vertices.push(...normal);
        vertices.push(...pBottomBefore);
        vertices.push(...normal);
        vertices.push(...pTop);
        vertices.push(...normal);
        vertices.push(...pBottom);
        vertices.push(...normal);
    }

    let indices = [];

    // Top
    for (let i = 2; i < n; i++) {
        indices.push(0, i - 1, i);
    }

    // Bottom
    for (let i = n + 2; i < 2 * n; i++) {
        indices.push(n, i - 1, i);
    }

    // Side
    {
        let i = 2 * n
        let j = 6 * n - 2;
        indices.push(i, j, j + 1);
        indices.push(j + 1, i + 1, i);
    }
    for (let i = 2 * n + 2; i < 6 * n; i += 2) {
        let j = i - 2;
        indices.push(i, j, j + 1);
        indices.push(j + 1, i + 1, i);
    }

    return { vertices, indices };
}

function createIsland(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const polygon = [
        -0.4062780269058296, 0., 0.34609720176730485,
        0.020627802690583064, 0., 0.5023564064801179,
        0.31659192825112115, 0., 0.37260677466863035,
        0.44932735426008974, 0., 0.08689248895434465,
        0.5587443946188342, 0., -0.26951399116347563,
        0.40448430493273535, 0., -0.6229749631811488,
        -0.14260089686098654, 0., -0.8232695139911634,
        -0.2932735426008969, 0., -0.5846833578792341,
        -0.5264573991031389, 0., -0.26067746686303384,
        -0.49058295964125564, 0., 0.19293078055964652,
    ];

    const grassThickness = 0.01, dirt1Thickness = 0.1, dirt2Thickness = 0.1;

    let objs = {};
    objs.root = createNullObject();
    {
        objs.grass = createObject(extrudeY(polygon, -grassThickness, 0.99, 1));
        objs.dirt = createNullObject();
        objs.dirt.transform.translateY(-grassThickness);
        {
            objs.dirt1 = createObject(extrudeY(polygon, -dirt1Thickness, 1, 0.8));
            objs.dirt2 = createObject(extrudeY(polygon, -dirt2Thickness, 0.8, 0.5));
            objs.dirt2.transform.translateY(-dirt1Thickness);
        }
        objs.dirt.addChilds(objs.dirt1, objs.dirt2);
    }
    objs.root.addChilds(objs.grass, objs.dirt);

    return { objs };
}