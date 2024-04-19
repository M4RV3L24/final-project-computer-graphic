function createLeonard(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const
        bodyHeight = 12, bodyWidth = 18,
        armsWidth = 6;

    let objs = {};
    objs.root = createNullObject();
    {
        objs.head = createNullObject();
        LIBS.translateY(objs.head.localMatrix, bodyHeight);
        {
            objs.baseHead = createObject(generateEllipsoid(100, 100, 30, 20, 15));
            LIBS.translateY(objs.baseHead.localMatrix, 10);

            objs.eyes = createNullObject();
            LIBS.translateY(objs.eyes.localMatrix, 10);
            {
                objs.leftEyeGroup = createNullObject();
                LIBS.rotateZ(objs.leftEyeGroup.localMatrix, LIBS.degToRad(5));
                LIBS.translateX(objs.leftEyeGroup.localMatrix, -12);
                LIBS.translateY(objs.leftEyeGroup.localMatrix, 19);
                {
                    objs.leftEyeOuter = createObject(generateEllipsoid(100, 100, 8, 12, 7));
                    LIBS.scale(objs.leftEyeOuter.localMatrix, 1.03);
                    {
                        objs.leftEyeBall = createObject(generateEllipsoid(100, 100, 6, 10, 7));
                        LIBS.translateZ(objs.leftEyeBall.localMatrix, 2);
                        {
                            objs.leftIris = createObject(generateEllipsoid(100, 100, 4, 7, 4));
                            LIBS.translateZ(objs.leftIris.localMatrix, 3.5);
                        }
                        objs.leftEyeBall.addChilds(objs.leftIris);
                    }
                    objs.leftEyeOuter.addChilds(objs.leftEyeBall);
                }
                objs.leftEyeGroup.addChilds(objs.leftEyeOuter);
                
                objs.rightEyeGroup = createNullObject();
                LIBS.rotateZ(objs.rightEyeGroup.localMatrix, LIBS.degToRad(-5));
                LIBS.translateX(objs.rightEyeGroup.localMatrix, 12);
                LIBS.translateY(objs.rightEyeGroup.localMatrix, 19);
                {
                    objs.rightEyeOuter = createObject(generateEllipsoid(100, 100, 8, 12, 7));
                    LIBS.scale(objs.rightEyeOuter.localMatrix, 1.03);
                    {
                        objs.rightEyeBall = createObject(generateEllipsoid(100, 100, 6, 10, 7));
                        LIBS.translateZ(objs.rightEyeBall.localMatrix, 2);
                        {
                            objs.rightIris = createObject(generateEllipsoid(100, 100, 4, 7, 4));
                            LIBS.translateZ(objs.rightIris.localMatrix, 3.5);
                        }
                        objs.rightEyeBall.addChilds(objs.rightIris);
                    }
                    objs.rightEyeOuter.addChilds(objs.rightEyeBall);
                }
                objs.rightEyeGroup.addChilds(objs.rightEyeOuter);
            }
            objs.eyes.addChilds(objs.leftEyeGroup, objs.rightEyeGroup)
        }
        objs.head.addChilds(objs.baseHead, objs.eyes);

        objs.body = createObject(generateUnitCylinder())
        LIBS.scaleX(objs.body.localMatrix, bodyWidth);
        LIBS.scaleY(objs.body.localMatrix, bodyHeight);
        LIBS.scaleZ(objs.body.localMatrix, 8);

        objs.legs = createNullObject();
        LIBS.translateY(objs.legs.localMatrix, -bodyHeight);
        {
            objs.leftLegGroup = createNullObject();
            LIBS.translateX(objs.leftLegGroup.localMatrix, -9);
            LIBS.translateY(objs.leftLegGroup.localMatrix, -8);
            LIBS.rotateZ(objs.leftLegGroup.localMatrix, LIBS.degToRad(-3));
            {
                objs.leftLeg = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.leftLeg.localMatrix, 9);
                LIBS.scaleY(objs.leftLeg.localMatrix, 8);
                LIBS.scaleZ(objs.leftLeg.localMatrix, 5);
                
                objs.leftFoot = createObject(generateEllipsoid(100, 100, 10, 5, 7));
                LIBS.translateY(objs.leftFoot.localMatrix, -8);
                LIBS.translateZ(objs.leftFoot.localMatrix, 1.2);
            }
            objs.leftLegGroup.addChilds(objs.leftLeg, objs.leftFoot);

            objs.rightLegGroup = createNullObject();
            LIBS.translateX(objs.rightLegGroup.localMatrix, 9);
            LIBS.translateY(objs.rightLegGroup.localMatrix, -8);
            LIBS.rotateZ(objs.rightLegGroup.localMatrix, LIBS.degToRad(3));
            {
                objs.rightLeg = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.rightLeg.localMatrix, 9);
                LIBS.scaleY(objs.rightLeg.localMatrix, 8);
                LIBS.scaleZ(objs.rightLeg.localMatrix, 5);
                
                objs.rightFoot = createObject(generateEllipsoid(100, 100, 10, 5, 7));
                LIBS.translateY(objs.rightFoot.localMatrix, -8);
                LIBS.translateZ(objs.rightFoot.localMatrix, 1.2);
            }
            objs.rightLegGroup.addChilds(objs.rightLeg, objs.rightFoot);
        }
        objs.legs.addChilds(objs.leftLegGroup, objs.rightLegGroup);

        objs.arms = createNullObject();
        {
            objs.leftArm = createNullObject();
            LIBS.rotateZ(objs.leftArm.localMatrix, -LIBS.degToRad(-90));
            LIBS.translateX(objs.leftArm.localMatrix, -bodyWidth)
            {
                objs.leftUpperArm = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.leftUpperArm.localMatrix, armsWidth);
                LIBS.scaleY(objs.leftUpperArm.localMatrix, armsWidth);
                LIBS.scaleZ(objs.leftUpperArm.localMatrix, armsWidth);
                LIBS.translateY(objs.leftUpperArm.localMatrix, armsWidth-5);

                objs.leftForeArm = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.leftForeArm.localMatrix, armsWidth);
                LIBS.scaleY(objs.leftForeArm.localMatrix, armsWidth);
                LIBS.scaleZ(objs.leftForeArm.localMatrix, armsWidth);
                LIBS.translateY(objs.leftForeArm.localMatrix, armsWidth*2);

                objs.leftHand = createObject(generateEllipsoid(100, 100, 8, 7.1, 8));
                LIBS.translateY(objs.leftHand.localMatrix, 18);
            }
            objs.leftArm.addChilds(objs.leftUpperArm, objs.leftForeArm, objs.leftHand);

            objs.rightArm = createNullObject();
            LIBS.rotateZ(objs.rightArm.localMatrix, -LIBS.degToRad(90));
            LIBS.translateX(objs.rightArm.localMatrix, bodyWidth)
            {
                objs.rightUpperArm = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.rightUpperArm.localMatrix, armsWidth);
                LIBS.scaleY(objs.rightUpperArm.localMatrix, armsWidth);
                LIBS.scaleZ(objs.rightUpperArm.localMatrix, armsWidth);
                LIBS.translateY(objs.rightUpperArm.localMatrix, armsWidth-5);

                objs.rightForeArm = createObject(generateUnitCylinder());
                LIBS.scaleX(objs.rightForeArm.localMatrix, armsWidth);
                LIBS.scaleY(objs.rightForeArm.localMatrix, armsWidth);
                LIBS.scaleZ(objs.rightForeArm.localMatrix, armsWidth);
                LIBS.translateY(objs.rightForeArm.localMatrix, armsWidth*2);

                objs.rightHand = createObject(generateEllipsoid(100, 100, 8, 7.1, 8));
                LIBS.translateY(objs.rightHand.localMatrix, 18);
            }
            objs.rightArm.addChilds(objs.rightUpperArm, objs.rightForeArm, objs.rightHand);
        }
        objs.arms.addChilds(objs.leftArm, objs.rightArm);
    }
    objs.root.addChilds(objs.head, objs.body, objs.arms, objs.legs);

    return objs;
}