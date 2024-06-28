function createBrown(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const bodyHeight = 25;
    const eyeSize = 1.8, eyeDistance = 3.7;
    const baseFaceSizeX = 6, baseFaceSizeY = 6.8;
    const earSize = 2.1, earDegree = 30, earDistance = 20;
    const legPosY = -40, legDistance = 14;
    const armPosY = -12, armDistance = 26;

    let objs = {};
    objs.root = createNullObject();
    {
        objs.head = createNullObject();
        objs.head.transform.translateY(bodyHeight);
        {
            objs.baseHead = createObject(generateEllipsoid(100,100,30,27,30));
            
            objs.eyes = createNullObject();
            {
                objs.leftEye = createObject(generateEllipsoid(100,100,eyeSize,eyeSize,eyeSize));
                objs.rightEye = createObject(generateEllipsoid(100,100,eyeSize,eyeSize,eyeSize));

                objs.leftEye.transform.translateX(-eyeDistance);
                objs.rightEye.transform.translateX(eyeDistance);
            }
            objs.eyes.addChilds(objs.leftEye, objs.rightEye);
            objs.eyes.transform.translateZ(29);
            objs.eyes.transform.translateY(5);

            objs.face = createNullObject();
            {
                objs.baseFace = createObject(generateEllipsoid(100, 100, baseFaceSizeX, baseFaceSizeY, 2));
                objs.baseFace.transform.translateZ(29);
                objs.baseFace.transform.translateY(-4);

                objs.nose = createObject(generateEllipticParaboloid(100, 100, 2.4, 2, 1.5));
                objs.nose.transform.translateZ(-32);
                objs.nose.transform.translateY(-2);
                objs.nose.transform.rotateY(LIBS.degToRad(180));

                objs.mouth = createNullObject();
                {
                    objs.leftMouth = createObject(generateBSpline([
                        0, 0, 0, 
                        0, -1, 0,
                        -0.5, -1.5, 0, 
                        -1, -1, 0
                    ], 100, 2));
                    objs.leftMouth.setDrawMode(GL.LINE_STRIP);

                    objs.rightMouth = createObject(generateBSpline([
                        0, 0, 0, 
                        0, -1, 0,
                        0.5, -1.5, 0, 
                        1, -1, 0
                    ], 100, 2));
                    objs.rightMouth.setDrawMode(GL.LINE_STRIP);
                }
                objs.mouth.addChilds(objs.leftMouth, objs.rightMouth);
                objs.mouth.transform.scaleUniform(4);
                objs.mouth.transform.translateZ(31).translateY(-2.5);
            }
            objs.face.addChilds(objs.baseFace, objs.nose, objs.mouth);

            objs.ears = createNullObject();
            {
                objs.outerEars = createNullObject();
                {
                    objs.leftOuterEar = createObject(generateEllipsoid(100, 100, 5, 4, 6));
                    objs.leftOuterEar.transform.translateX(-earDistance);
                    objs.leftOuterEar.transform.scaleUniform(earSize);
                    objs.leftOuterEar.transform.rotateX(LIBS.degToRad(90));
                    objs.leftOuterEar.transform.rotateZ(LIBS.degToRad(earDegree));
    
                    objs.rightOuterEar = createObject(generateEllipsoid(100, 100, 5, 4, 6));
                    objs.rightOuterEar.transform.translateX(earDistance);
                    objs.rightOuterEar.transform.scaleUniform(earSize);
                    objs.rightOuterEar.transform.rotateX(LIBS.degToRad(90));
                    objs.rightOuterEar.transform.rotateZ(LIBS.degToRad(-earDegree));
                }
                objs.outerEars.addChilds(objs.leftOuterEar, objs.rightOuterEar);

                objs.innerEars = createNullObject();
                {
                    objs.leftInnerEar = createObject(generateEllipsoid(100, 100, 5.4, 4.3, 6.3));
                    objs.leftInnerEar.transform.translateX(-earDistance);
                    objs.leftInnerEar.transform.scaleUniform(earSize * 0.8);
                    objs.leftInnerEar.transform.rotateX(LIBS.degToRad(90));
                    objs.leftInnerEar.transform.rotateZ(LIBS.degToRad(earDegree));

                    objs.rightInnerEar = createObject(generateEllipsoid(100, 100, 5.4, 4.3, 6.3));
                    objs.rightInnerEar.transform.translateX(earDistance);
                    objs.rightInnerEar.transform.scaleUniform(earSize * 0.8);
                    objs.rightInnerEar.transform.rotateX(LIBS.degToRad(90));
                    objs.rightInnerEar.transform.rotateZ(LIBS.degToRad(-earDegree));
                }
                objs.innerEars.addChilds(objs.leftInnerEar, objs.rightInnerEar);
                objs.innerEars.transform.translateZ(2.4);
            }
            objs.ears.addChilds(objs.outerEars, objs.innerEars);
            objs.ears.transform.translateY(26)
        } 
        objs.head.addChilds(objs.baseHead, objs.eyes, objs.face, objs.ears);
        
        objs.body = createNullObject();
        {
            objs.baseBody = createObject(generateEllipsoid(100, 100, 28, 34, 28));
            objs.baseBody.transform.translateY(-8);

            objs.ribbonGroup = createNullObject();
            {
                objs.mainRibbon = createObject(generateHyperboloid1(100, 100, .015, .2, .3));
                objs.middleRibbon = createObject(generateEllipsoid(100, 100, 3, 3, 2.4));
            }
            objs.ribbonGroup.addChilds(objs.mainRibbon, objs.middleRibbon);
            objs.ribbonGroup.transform.translateX(-27);
            objs.ribbonGroup.transform.rotateY(LIBS.degToRad(90));
            objs.ribbonGroup.transform.rotateX(LIBS.degToRad(-20));
            objs.ribbonGroup.transform.scaleUniform(0.7);

            objs.tail = createObject(generateEllipsoid(100, 100, 5, 5, 5));
            objs.tail.transform.translateZ(-26);
            objs.tail.transform.translateY(-25);
        }
        objs.body.addChilds(objs.ribbonGroup, objs.baseBody, objs.tail);
        objs.body.transform.translateY(-10);

        objs.legs = createNullObject();
        {
            objs.leftLegGroup = createNullObject();
            {
                objs.leftLeg = createObject(generateEllipsoid(100, 100, 10, 18, 10));
                objs.leftLeg.transform.translateX(-legDistance);
                objs.leftLeg.transform.translateY(legPosY);

                objs.leftFoot = createObject(generateEllipsoid(100, 100, 10, 10, 12));
                objs.leftFoot.transform.translateX(-legDistance - 2);
                objs.leftFoot.transform.translateY(legPosY - 20);
            }
            objs.leftLegGroup.addChilds(objs.leftLeg, objs.leftFoot);

            objs.rightLegGroup = createNullObject();
            {
                objs.rightLeg = createObject(generateEllipsoid(100, 100, 10, 18, 10));
                objs.rightLeg.transform.translateX(legDistance);
                objs.rightLeg.transform.translateY(legPosY);

                objs.rightFoot = createObject(generateEllipsoid(100, 100, 10, 10, 12));
                objs.rightFoot.transform.translateX(legDistance + 2);
                objs.rightFoot.transform.translateY(legPosY - 20);
            }
            objs.rightLegGroup.addChilds(objs.rightLeg, objs.rightFoot);
        }
        objs.legs.addChilds(objs.leftLegGroup, objs.rightLegGroup);

        objs.arms = createNullObject();
        {
            objs.leftArmGroup = createNullObject();
            {
                objs.leftArm = createObject(generateEllipsoid(100, 100, 12, 21, 12));
                objs.leftArm.transform.rotateZ(LIBS.degToRad(-35));
            }
            objs.leftArmGroup.addChilds(objs.leftArm);
            objs.leftArmGroup.transform.translateX(-armDistance);
        
            objs.rightArmGroup = createNullObject();
            {
                objs.rightArm = createObject(generateEllipsoid(100, 100, 12, 21, 12));
                objs.rightArm.transform.rotateZ(LIBS.degToRad(35));

                objs.luckyCloverGroup = createNullObject();
                {
                    objs.luckyCloverStem = createObject(generateBSpline([
                        0, 0, 0, 
                        0.3, 0.5, 0,
                        0.35, 1.5, 0,
                        0.32, 1.75, 0, 
                    ], 100, 2));
                    objs.luckyCloverStem.setDrawMode(GL.LINE_STRIP);
                    objs.luckyCloverStem.transform.scaleUniform(7);

                    objs.luckyCloverLeaves = createNullObject();
                    {
                        objs.middleLeave = createObject(generateEllipsoid(100, 100, .3, .3, .3));

                        objs.leave1 = createObject(generateBSpline([
                            0, 0, 0,

                            .1, 1.2, 0,
                            .3, 1.5, 0,
                            .7, 1.6, 0,
                            .9, 1.2, 0,
                            .95, .8, 0,
                            .7, .7, 0,
                            .8, .95, 0,
                            1.2, .9, 0,
                            1.6, .7, 0,
                            1.5, .3, 0,
                            1.2, .1, 0,

                            0, 0, 0
                        ], 100, 2))
                        objs.leave1.setDrawMode(GL.TRIANGLE_FAN);

                        objs.leave2 = createObject(generateBSpline([
                            0, 0, 0,

                            .1, -1.2, 0,
                            .3, -1.5, 0,
                            .7, -1.6, 0,
                            .9, -1.2, 0,
                            .95, -.8, 0,
                            .7, -.7, 0,
                            .8, -.95, 0,
                            1.2, -.9, 0,
                            1.6, -.7, 0,
                            1.5, -.3, 0,
                            1.2, -.1, 0,

                            0, 0, 0
                        ], 100, 2))
                        objs.leave2.setDrawMode(GL.TRIANGLE_FAN);

                        objs.leave3 = createObject(generateBSpline([
                            0, 0, 0,

                            -.1, -1.2, 0,
                            -.3, -1.5, 0,
                            -.7, -1.6, 0,
                            -.9, -1.2, 0,
                            -.95, -.8, 0,
                            -.7, -.7, 0,
                            -.8, -.95, 0,
                            -1.2, -.9, 0,
                            -1.6, -.7, 0,
                            -1.5, -.3, 0,
                            -1.2, -.1, 0,

                            0, 0, 0
                        ], 100, 2))
                        objs.leave3.setDrawMode(GL.TRIANGLE_FAN);

                        objs.leave4 = createObject(generateBSpline([
                            0, 0, 0,

                            -.1, 1.2, 0,
                            -.3, 1.5, 0,
                            -.7, 1.6, 0,
                            -.9, 1.2, 0,
                            -.95, .8, 0,
                            -.7, .7, 0,
                            -.8, .95, 0,
                            -1.2, .9, 0,
                            -1.6, .7, 0,
                            -1.5, .3, 0,
                            -1.2, .1, 0,

                            0, 0, 0
                        ], 100, 2))
                        objs.leave4.setDrawMode(GL.TRIANGLE_FAN);
                    }
                    objs.luckyCloverLeaves.addChilds(objs.middleLeave, objs.leave1, objs.leave2, objs.leave3, objs.leave4);
                    objs.luckyCloverLeaves.transform.scaleUniform(2.5);
                }
                objs.luckyCloverGroup.addChilds(objs.luckyCloverStem, objs.luckyCloverLeaves);
                objs.luckyCloverGroup.transform.scaleUniform(2).translateX(7).translateY(-30).localRotateX(LIBS.degToRad(-60)).translateZ(23);
            }
            objs.rightArmGroup.addChilds(objs.rightArm, objs.luckyCloverGroup);
            objs.rightArmGroup.transform.translateX(armDistance);
        }
        objs.arms.addChilds(objs.leftArmGroup, objs.rightArmGroup);
        objs.arms.transform.translateY(armPosY);

        objs.coba = createObject(generateHyperboloid2(100,100,10,10,10, 2));
    }
    objs.root.addChilds(objs.head, objs.body, objs.legs, objs.arms);
    objs.root.createBoundingBoxObject();
    // objs.root.addChilds(objs.luckyCloverGroup);

    
    let pose = {};
    let objsArr = Object.values(objs);
    pose.initial = new Pose(objsArr);

    objs.head.transform.rotateX(LIBS.degToRad(20));
    objs.eyes.transform.scaleUniform(0.9);
    pose.nod = new Pose(objsArr);
    pose.initial.apply();

    objs.leftArmGroup.transform.rotateX(LIBS.degToRad(-60));
    objs.rightLegGroup.transform.rotateX(LIBS.degToRad(-20));
    objs.body.transform.translateY(-1);
    objs.head.transform.translateY(-2);
    pose.rightFootWalk = new Pose(objsArr);
    pose.initial.apply();

    objs.rightArmGroup.transform.rotateX(LIBS.degToRad(-60));
    objs.leftLegGroup.transform.rotateX(LIBS.degToRad(-20));
    objs.body.transform.translateY(1);
    objs.head.transform.translateY(2);
    pose.leftFootWalk = new Pose(objsArr);
    pose.initial.apply();

    objs.head.transform.rotateZ(LIBS.degToRad(-15))
    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(90), [1, 0, 0], [26, 7, 0]);
    objs.eyes.transform.scaleUniform(1.2);
    pose.waveRightHand = new Pose(objsArr);
    pose.initial.apply();

    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(90), [4, -2, 0], [26, 7, 0]);
    objs.luckyCloverLeaves.transform.rotateZ(LIBS.degToRad(180));

    objs.leftEye.transform
    .scaleUniform(1.2);

    objs.rightEye.transform
    .scaleUniform(1.2);

    pose.showLuckyClover = new Pose(objsArr);
    pose.initial.apply();

    objs.head.transform.rotateZ(LIBS.degToRad(10));
    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(90), [4, -2, 0], [26, 7, 0]);
    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(-45), [0, 0, 1], [23, 2, 4]);
    objs.luckyCloverLeaves.transform.rotateZ(LIBS.degToRad(0));
    objs.eyes.transform.scaleUniform(0.9);

    objs.leftEye.transform
    .scaleUniform(1.2);

    objs.rightEye.transform
    .scaleUniform(1.2);

    pose.luckyCloverLeft = new Pose(objsArr);
    pose.initial.apply();

    objs.head.transform.rotateZ(LIBS.degToRad(-10));
    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(90), [4, -2, 0], [26, 7, 0]);
    objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(45), [0, 0, 1], [23, 2, 4]);
    objs.luckyCloverLeaves.transform.rotateZ(LIBS.degToRad(180));
    pose.luckyCloverRight = new Pose(objsArr);

    objs.leftEye.transform
    .scaleUniform(1.2);

    objs.rightEye.transform
    .scaleUniform(1.2);

    pose.initial.apply();

    return {objs, pose};
}