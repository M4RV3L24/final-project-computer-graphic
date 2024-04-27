function createTree1 (GL, programInfo = null){
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }
    let objs = {};
    objs.root = createNullObject();
    {
        objs.trunk = createNullObject();
        objs.trunk.transform.translateY(0);
        {
            objs.baseTrunk = createObject(generateUnitCone());
            objs.baseTrunk.transform.translateY(10);
        }
        objs.trunk.addChilds(objs.baseTrunk);
    }
    objs.root.addChilds(objs.trunk);

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
        objs.trunk = createNullObject();
        objs.trunk.transform.translateY(0);
        {
            objs.baseLeaves = createObject(generateUnitCone(5));
            // objs.baseLeaves.setDrawMode(GL.TRIANGLES);
            objs.baseLeaves.transform.translateZ(30).translateX(30).scaleX(10). scaleY(20). scaleZ(10);
            {
                objs.leaves1 = createObject(generateUnitCone(5));
                objs.leaves1.transform.translateY(-5)
                objs.baseLeaves.addChilds(objs.leaves1);
            
            }
        }
        objs.trunk.addChilds(objs.baseLeaves);    
    }
    objs.root.addChilds(objs.trunk);
    
    let pose = {}, objsArr = Object.values(objs);
    
    return {objs, pose};

}
