function createMountain(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }


    let objs = {};

    objs.root = createNullObject();
    {
        objs.mountBase = createObject(generateEllipticParaboloid(12, 12, 1, 1, 1));
        objs.mountBase.transform.rotateX(LIBS.degToRad(90)).translateZ(-50).scale(10, 10, 10);
        objs.mountTop = createObject(generateUnitCone(8, 8, 1, 1, 1));
        objs.mountTop.transform.translateZ(-50).translateY(2).scale(6, 6, 6);
    }
    objs.root.addChilds(objs.mountBase, objs.mountTop);

    let pose = {}, objsArr = Object.values(objs);
    return {objs, pose};

}