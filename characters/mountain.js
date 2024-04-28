function createMountain(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const
        bodyHeight = 23, bodyWidth = 16,
        armsWidth = 6;

    let objs = {};
    let pose = {}, objsArr = Object.values(objs);
    return {objs, pose};

}