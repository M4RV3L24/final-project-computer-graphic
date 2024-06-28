function createTree1 (GL, programInfo = null){
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }
    let objs = {};
    objs.root = createNullObject();
    objs.root.transform.translateX(40).translateZ(30).scale(0.5, 0.5, 0.5);
    {
        objs.trunks = createNullObject();
        {
            objs.trunk1 = createObject(generateUnitCylinder(6));
            objs.trunk1.transform.translateX(-40).translateZ(30).scale(3, 24, 3);
            objs.trunk2 = createObject(generateUnitCylinder(6));
            objs.trunk2.transform.rotateZ(LIBS.degToRad(-30)).translateX(-34).translateZ(30).translateY(-0).scale(2.5, 10, 2.5);
            objs.trunk3 = createObject(generateUnitCylinder(6));
            objs.trunk3.transform.rotateZ(LIBS.degToRad(20)).translateX(-43).translateZ(30).translateY(9).scale(2, 10, 2);
            objs.trunk4 = createObject(generateUnitCylinder(6));
            objs.trunk4.transform.rotateX(LIBS.degToRad(40)).translateX(-40).translateZ(35).translateY(7).scale(1.5, 7, 1.5);
            objs.trunk5 = createObject(generateUnitCylinder(6));    
            objs.trunk5.transform.rotateX(LIBS.degToRad(-40)).rotateY(LIBS.degToRad(15)).translateX(-42).translateZ(25).translateY(5).scale(1.8, 8, 1.8);
        }
        objs.trunks.addChilds(objs.trunk1, objs.trunk2, objs.trunk3, objs.trunk4, objs.trunk5);

        objs.leaves = createNullObject();
        {
            objs.leaves1 = createObject(generateEllipsoid(100, 100, 20, 15, 20));
            objs.leaves1.transform.translateZ(27).translateX(-40).translateY(34);
            objs.leaves2 = createObject(generateEllipsoid(100, 100, 15, 10, 15));
            objs.leaves2.transform.translateZ(35).translateX(-40).translateY(20);
            objs.leaves3 = createObject(generateEllipsoid(100, 100, 10, 10, 10));
            objs.leaves3.transform.translateZ(27).translateX(-25).translateY(10);
            objs.leaves4 = createObject(generateEllipsoid(100, 100, 15, 10, 15));
            objs.leaves4.transform.translateZ(20).translateX(-50).translateY(16);
        
        }
        objs.leaves.addChilds(objs.leaves1, objs.leaves2, objs.leaves3, objs.leaves4);
    }
    objs.root.addChilds(objs.trunks, objs.leaves);
    objs.root.createBoundingBoxObject();

    let pose = {}, objsArr = Object.values(objs);
    return {objs, pose};

}

function createTree2 (GL, programInfo = null){
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }
    let objs = {};
    objs.root = createNullObject();
    {
        objs.leaves = createObject(generateUnitCone(5));
        // objs.baseLeaves.setDrawMode(GL.TRIANGLES);
        objs.leaves.transform.translateZ(30).translateX(30).scaleX(10). scaleY(20). scaleZ(10);
        {
            objs.leaves1 = createObject(generateUnitCone(6));
            objs.leaves1.transform.translateY(0.5).rotateY(LIBS.degToRad(30));
            objs.leaves2 = createObject(generateUnitCone(5));
            objs.leaves2.transform.translateY(1.5);
        }
        objs.leaves.addChilds(objs.leaves1, objs.leaves2);

        objs.trunk = createObject(generateHyperboloid1(10, 10, 2, 2, 5));
        objs.trunk.transform.rotateX(LIBS.degToRad(90)).translateZ(30).translateX(30).translateY(-21);
    }
    objs.root.addChilds(objs.leaves, objs.trunk);
    
    let pose = {}, objsArr = Object.values(objs);
    
    return {objs, pose};

}



function createTree3 (GL, programInfo = null){
        
}
