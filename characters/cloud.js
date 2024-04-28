function createCloud(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    function ellipsoid(size, size2 = size, size3 = size){
        return createObject(generateEllipsoid(100, 100, size, size2, size3));
    }


    let objs = {};
    objs.root = createNullObject();
    {   
        objs.cloudGroup = createNullObject();
        {
            objs.cloudPart1 = ellipsoid(85, 70);
            objs.cloudPart1.transform.translateX(50);

            objs.cloudPart2 = ellipsoid(65, 65, 70);
            objs.cloudPart2.transform.translateX(-40).translateY(-20);

            objs.cloudPart3 = ellipsoid(70, 60, 65);
            objs.cloudPart3.transform.translateX(130).translateY(-10);

            objs.cloudPart4 = ellipsoid(60, 40, 40);
            objs.cloudPart4.transform.translateX(140).translateY(-30).translateZ(45);

            objs.cloudPart5 = ellipsoid(80, 50, 70);
            objs.cloudPart5.transform.translateX(180).translateY(-40).translateZ(0);

            objs.cloudPart6 = ellipsoid(90, 50, 50);
            objs.cloudPart6.transform.translateX(-45).translateY(-35).translateZ(30);

            objs.cloudPart7 = ellipsoid(100, 55, 50);
            objs.cloudPart7.transform.translateX(30).translateY(-28).translateZ(50);

            objs.cloudPart8 = ellipsoid(70, 50, 50);
            objs.cloudPart8.transform.translateX(100).translateY(0).translateZ(30);

            objs.cloudPart9 = ellipsoid(70, 50, 50);
            objs.cloudPart9.transform.translateX(100).translateY(-30).translateZ(-50);

            objs.cloudPart10 = ellipsoid(90, 50, 50);
            objs.cloudPart10.transform.translateX(-45).translateY(-35).translateZ(-35);

            objs.cloudPart11 = ellipsoid(100, 55, 60);
            objs.cloudPart11.transform.translateX(-65).translateY(-30).translateZ(0);

            objs.cloudPart12 = ellipsoid(100, 55, 60);
            objs.cloudPart12.transform.translateX(0).translateY(-40).translateZ(-40);
        }
        objs.cloudGroup.addChilds(objs.cloudPart1, objs.cloudPart2, objs.cloudPart3, objs.cloudPart4, objs.cloudPart5, objs.cloudPart6, objs.cloudPart7, objs.cloudPart8, objs.cloudPart9, objs.cloudPart10, objs.cloudPart11, objs.cloudPart12);
    }
    objs.root.addChilds(objs.cloudGroup);

    return objs;
}