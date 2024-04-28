function createBaloon(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const baloonSizeX = 100, baloonSizeY = 100, baloonSizeZ = 110;
    const ropeRadius = 88, ropeSize = 120, ropeRotate = Math.PI / 16;

    let objs = {};
    objs.root = createNullObject();
    {      
        objs.baloon = createNullObject();
        {
            objs.outerBaloon = createObject(generateEllipsoid(30, 30, baloonSizeX, baloonSizeY, baloonSizeZ));
            objs.outerBaloon.setDrawMode(GL.LINE_STRIP);
    
            objs.innerBaloon = createObject(generateEllipsoid(100, 100, baloonSizeX, baloonSizeY, baloonSizeZ));
            objs.innerBaloon.transform.scaleUniform(.97);

            objs.lowerBaloon = createObject(generateCylinderCurvedSurface(9.75, 6));
            objs.lowerBaloon.transform.translateZ(30).scaleUniform(10).scaleY(10).localRotateX(Math.PI / 2);
        }
        objs.baloon.addChilds(objs.outerBaloon, objs.innerBaloon, objs.lowerBaloon);
        objs.baloon.transform.translateY(280).scaleUniform(1.5).localRotateX(Math.PI / 2);

        objs.connector = createNullObject();
        {
            objs.rope1 = createObject(generateUnitCylinder());
            objs.rope1.transform.scaleUniform(1).scaleY(ropeSize).translateX(-ropeRadius).translateY(80).localRotateZ(ropeRotate);

            objs.rope2 = createObject(generateUnitCylinder());
            objs.rope2.transform.scaleUniform(1).scaleY(ropeSize).translateZ(-ropeRadius).translateY(80).localRotateX(-ropeRotate);

            objs.rope3 = createObject(generateUnitCylinder());
            objs.rope3.transform.scaleUniform(1).scaleY(ropeSize).translateX(ropeRadius).translateY(80).localRotateZ(-ropeRotate);

            objs.rope4 = createObject(generateUnitCylinder());
            objs.rope4.transform.scaleUniform(1).scaleY(ropeSize).translateZ(ropeRadius).translateY(80).localRotateX(ropeRotate);
        }
        objs.connector.addChilds(objs.rope1, objs.rope2, objs.rope3, objs.rope4);

        objs.passangerSeat = createNullObject();
        {
            objs.passangerSeatSide = createObject(generateCylinderCurvedSurface(4.5, 4, 100, 4));
            objs.passangerSeatSide.transform.scaleUniform(18).scaleY(6).translateY(-140);
    
            objs.passangerSeatBottom = createObject(generateCylinderFlatSurface(4.5, 4));
            objs.passangerSeatBottom.transform.scaleUniform(18).translateY(-158);
        }
        objs.passangerSeat.addChilds(objs.passangerSeatBottom, objs.passangerSeatSide);
    }
    objs.root.addChilds(objs.baloon, objs.connector, objs.passangerSeat);

    return objs;
}