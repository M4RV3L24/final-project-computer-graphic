function main() {
    var CANVAS = document.getElementById("canvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= CAPTURE EVENTS ========================= */

    var AMORTIZATION = 0.95;
    var drag = false;
    var x_prev, y_prev;
    var dX = 0, dY = 0;
    var renderMode = 0;

    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * Math.PI / CANVAS.width,
            dY = (e.pageY - y_prev) * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    var keyPress = function (e) {
        if (e.key == "c") {
            renderMode ^= 1;
        }
    };
    
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("keypress", keyPress);

    /*========================= WEBGL CONTEXT ========================= */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
        GL.getExtension("OES_element_index_uint");
        GL.getExtension('WEBGL_depth_texture');
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    /*========================= PROGRAMS ========================= */
    let renderProgramInfo;
    {
        let vertexShaderSource = document.querySelector("#vertexShader").text;
        let fragmentShaderSource = document.querySelector("#fragmentShader").text;
        let vertexShader = createShader(GL, GL.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = createShader(GL, GL.FRAGMENT_SHADER, fragmentShaderSource);
        let program = createProgram(GL, vertexShader, fragmentShader);
        renderProgramInfo = new ProgramInfo(GL, program);

        let addUniform = (...prop)=>renderProgramInfo.uniformConfig.addUniform(...prop);
        addUniform("color", "3fv");
        addUniform("sky_color", "3fv");
        addUniform("PMatrix", "Matrix4fv");
        addUniform("VMatrix", "Matrix4fv");
        addUniform("lightPMatrix", "Matrix4fv");
        addUniform("lightVMatrix", "Matrix4fv");
        addUniform("MMatrix", "Matrix4fv");
        addUniform("normalMatrix", "Matrix4fv");

        addUniform("light_source_direction", "3fv");
        addUniform("light_source_ambient_color", "3fv");
        addUniform("light_source_diffuse_color", "3fv");
        addUniform("light_source_specular_color", "3fv");

        addUniform("cellSize", "1f");
        addUniform("spread", "1i");
        addUniform("bias", "1f");
        addUniform("normal_bias", "1f");
        
        addUniform("mat_ambient_color", "3fv");
        addUniform("mat_diffuse_color", "3fv");
        addUniform("mat_specular_color", "3fv");
        addUniform("mat_shininess", "1f");
        
        addUniform("view_direction", "3fv");
        addUniform("fog_density", "1f");
    }

    let shadowProgramInfo;
    {
        let shadowVertexShaderSource = document.querySelector("#shadowVertexShader").text;
        let shadowFragmentShaderSource = document.querySelector("#shadowFragmentShader").text;
        let shadowVertexShader = createShader(GL, GL.VERTEX_SHADER, shadowVertexShaderSource);
        let shadowFragmentShader = createShader(GL, GL.FRAGMENT_SHADER, shadowFragmentShaderSource);
        let program = createProgram(GL, shadowVertexShader, shadowFragmentShader);
        shadowProgramInfo = new ProgramInfo(GL, program);

        let addUniform = (...prop)=>shadowProgramInfo.uniformConfig.addUniform(...prop);
        addUniform("PMatrix", "Matrix4fv");
        addUniform("VMatrix", "Matrix4fv");
        addUniform("MMatrix", "Matrix4fv");
        addUniform("normalMatrix", "Matrix4fv");
    }

    /*========================= OBJECTS ========================= */
    let island = createIsland(GL);
    let leonard = createLeonard(GL);

    let conny = createConny(GL);

    let tree1 = createTree1(GL);
    let tree2 = createTree2(GL);

    let mountain = createMountain(GL);

    let brown = createBrown(GL);
    let cloud = createCloud(GL);
    let baloon = createBaloon(GL);

    objects = [
        leonard.objs.root,
        island.objs.root,
        conny.objs.root,
        tree2.objs.root,
        tree1.objs.root,
        mountain.objs.root,
        brown.objs.root,
        cloud.root,
        baloon.root
    ];
    
    objects.forEach(obj => {    
        // obj.createBoundingBoxObject();
        obj.setup();
    });

    const depthTextureSize = 2048;

    /*========================= UNIFORMS ========================= */

    const backgroundColor = [165/255, 214/255, 255/255];
    const defaultColor = [0.7, 0.7, 0.7];
    const projMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 2000);

    const defaultCameraPosition = [0., -30., 420.];
    const defaultCameraTarget = [0., 0., 0.]
    const defaultCameraMatrix = LIBS.look_at(defaultCameraPosition, defaultCameraTarget, [0, 1, 0]);
    const defaultViewDirection = Vector.sub(defaultCameraTarget, defaultCameraPosition).normalize().arr();
    const defaultViewMatrix = Matrix.fromGLMatrix(defaultCameraMatrix, 4, 4).inverse().toGLMatrix();
    
    const lightSourceAmbientColor = [0.3,0.3,0.3];
    const lightSourceDiffuseColor = [1.,1.,1.];
    const lightSourceSpecularColor = [1.,1.,1.];
    
    const matAmbientColor = [1.,1.,1.];
    const matDiffuseColor = [1.,1.,1.];
    const matSpecularColor = [1.,1.,1.];
    const matShininess = 20.;

    const lightSourcePosition = [300., 300., 300.];
    const lightSourceTarget = [0., 0., 0.];
    const lightSourceDirection = Vector.sub(lightSourcePosition, lightSourceTarget).normalize().arr();

    const cellSize = 1/3000;
    const spread = 4;
    const bias = 0.01;
    const normalBias = 0.05;

    const fogDensity = 0.0002;

    const lightProjMatrix = LIBS.get_ortho_proj(45, 1, 1, 1000);
    const lightViewMatrix = Transform3.translate(
        Matrix.fromGLMatrix(
            LIBS.look_at(
                lightSourcePosition,
                lightSourceTarget,
                [0, 1, 0]
            ), 4, 4
        ).inverse()
    ).toGLMatrix();

    var THETA = 0, PHI = 0;

    {
        let set = (...prop)=>renderProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("color", defaultColor);
        set("sky_color", backgroundColor);
        set("PMatrix", false, projMatrix);
        set("VMatrix", false, defaultViewMatrix);
        set("lightPMatrix", false, lightProjMatrix);
        set("lightVMatrix", false, lightViewMatrix);
        set("light_source_direction", lightSourceDirection);
        set("light_source_ambient_color", lightSourceAmbientColor);
        set("light_source_diffuse_color", lightSourceDiffuseColor);
        set("light_source_specular_color", lightSourceSpecularColor);

        set("mat_ambient_color", matAmbientColor);
        set("mat_diffuse_color", matDiffuseColor);
        set("mat_specular_color", matSpecularColor);
        set("mat_shininess", matShininess);
        set("cellSize", cellSize);
        set("spread", spread);
        set("bias", bias);
        set("normal_bias", normalBias);
        
        set("view_direction", defaultViewDirection);
        set("fog_density", fogDensity);
    }
    
    const
        islandGrassColor = [65/255, 152/255, 10/255],
        islandDirtColor = [64/255, 41/255, 5/255],
        islandShininess = 4;

    let islandGrassConfig = renderProgramInfo.createUniformConfig();
    islandGrassConfig.addUniform("color", "3fv", islandGrassColor);
    islandGrassConfig.addUniform("mat_shininess", "1f", islandShininess);
    
    let islandDirtConfig = renderProgramInfo.createUniformConfig();
    islandDirtConfig.addUniform("color", "3fv", islandDirtColor);
    islandDirtConfig.addUniform("mat_shininess", "1f", islandShininess);

    let islandGrass = [island.objs.grass];
    let islandDirt = [island.objs.dirt1, island.objs.dirt2];

    function setIslandConfig() {
        islandGrass.forEach((obj) => {
            obj.objectUniformConfig = islandGrassConfig;
        })
        islandDirt.forEach((obj) => {
            obj.objectUniformConfig = islandDirtConfig;
        })
    }

    const
        leonardColor = [0.0, 0.6, 0.2],
        leonardEyeBallColor = [.9, .9, .9],
        leonardIrisColor = [.1, .1, .1],
        candyBodyColor = [.6, .1, .1],
        candyHeadTailColor = [.8, .3, .15];

    let leonardDefaultConfig = renderProgramInfo.createUniformConfig();
    leonardDefaultConfig.addUniform("color", "3fv", leonardColor);

    let leonardEyeBallConfig = renderProgramInfo.createUniformConfig();
    leonardEyeBallConfig.addUniform("color", "3fv", leonardEyeBallColor);

    let leonardIrisConfig = renderProgramInfo.createUniformConfig();
    leonardIrisConfig.addUniform("color", "3fv", leonardIrisColor);

    let leonardMouthConfig = leonardIrisConfig;

    let leonardNoseConfig = leonardMouthConfig;

    let candyBodyConfig = renderProgramInfo.createUniformConfig();
    candyBodyConfig.addUniform("color", "3fv", candyBodyColor);

    let candyHeadTailConfig = renderProgramInfo.createUniformConfig();
    candyHeadTailConfig.addUniform("color", "3fv", candyHeadTailColor);

    const leonardEyeBalls = [leonard.objs.leftEyeBall, leonard.objs.rightEyeBall];
    const leonardIris = [leonard.objs.leftIris, leonard.objs.rightIris];
    const leonardMouthParts = [leonard.objs.lipsLeft, leonard.objs.lipsRight, leonard.objs.cheekLeft, leonard.objs.cheekRight];
    const leonardNoseParts = [leonard.objs.leftNose, leonard.objs.rightNose];
    const candyBody = [leonard.objs.candyUpperBody, leonard.objs.candyLowerBody];
    function setLeonardConfig() {
        Object.values(leonard.objs).forEach((obj) => {
            obj.objectUniformConfig = leonardDefaultConfig;
        });
        leonardEyeBalls.forEach((obj) => {
            obj.objectUniformConfig = leonardEyeBallConfig;
        });
        leonardIris.forEach((obj) => {
            obj.objectUniformConfig = leonardIrisConfig;
        });
        leonardMouthParts.forEach((obj) => {
            obj.objectUniformConfig = leonardMouthConfig;
        })
        leonardNoseParts.forEach((obj) => {
            obj.objectUniformConfig = leonardNoseConfig;
        })
        candyBody.forEach((obj)=> {
            obj.objectUniformConfig = candyBodyConfig;
        })
        leonard.objs.candyHeadTail.objectUniformConfig = candyHeadTailConfig;
    }

    const
        connyColor = [1, 1, 1],
        connyPinkColor = [1, 0.57, 0.87],
        connyBlackColor = [.0, .0, .0],
        connyCheekColor = [0.94, 0.82, 0.9],
        connyRed = [1, 0.26, 0.26],
        connySoftRed = [1, 0.53, 0.53],
        connySolidPink = [1, 0.21, 0.41], 
        trunkColor = [0.6, 0.3, 0.1],
        leaveColor = [0.1, 0.6, 0.1],
        mountainColor = [0.25, 0.25, 0.3];

    let mountainColorConfig = renderProgramInfo.createUniformConfig();
    mountainColorConfig.addUniform("color", "3fv", mountainColor);
    let leaveColorConfig = renderProgramInfo.createUniformConfig();
    leaveColorConfig.addUniform("color", "3fv", leaveColor);

    let trunkColorConfig = renderProgramInfo.createUniformConfig();
    trunkColorConfig.addUniform("color", "3fv", trunkColor);

    let connySoftRedConfig = renderProgramInfo.createUniformConfig();
    connySoftRedConfig.addUniform("color", "3fv", connySoftRed);

    let connySolidPinkConfig = renderProgramInfo.createUniformConfig();
    connySolidPinkConfig.addUniform("color", "3fv", connySolidPink);

    let connyRedConfig = renderProgramInfo.createUniformConfig();
    connyRedConfig.addUniform("color", "3fv", connyRed);

    let connyDefaultConfig = renderProgramInfo.createUniformConfig();
    connyDefaultConfig.addUniform("color", "3fv", connyColor);

    let connyPinkConfig = renderProgramInfo.createUniformConfig();
    connyPinkConfig.addUniform("color", "3fv", connyPinkColor);

    let connyBlackConfig = renderProgramInfo.createUniformConfig();
    connyBlackConfig.addUniform("color", "3fv", connyBlackColor);

    let connyCheekConfig = renderProgramInfo.createUniformConfig();
    connyCheekConfig.addUniform("color", "3fv", connyCheekColor);
    const connyBlacks = [
        conny.objs.leftEyeGroup, 
        conny.objs.rightEyeGroup, 
        conny.objs.nose, 
        conny.objs.nose2, 
        conny.objs.line, 
        conny.objs.outerMouth1,
        conny.objs.outerMouth2
    ];

    const connyEars = [conny.objs.leftEarBottom, conny.objs.rightEarBottom];
    const connyCheek = [conny.objs.leftCheek, conny.objs.rightCheek];
    const connyReds = [conny.objs.mouth, conny.objs.tape2];
    const connySoftReds = [conny.objs.mouth2];
    const connySolidPinks = [conny.objs.tape];
    const TreeTrunks = [
        tree1.objs.trunk1, 
        tree1.objs.trunk2,
        tree1.objs.trunk3,
        tree1.objs.trunk4,
        tree1.objs.trunk5,
        tree2.objs.trunk
    ];

    const TreeLeaves = [
        tree1.objs.leaves1,
        tree1.objs.leaves2,
        tree1.objs.leaves3,
        tree1.objs.leaves4,
        tree2.objs.leaves1,
        tree2.objs.leaves2,
        tree2.objs.leaves
    ];

    
    function setConnyConfig() {
        Object.values(conny.objs).forEach((obj) => {
            obj.objectUniformConfig = connyDefaultConfig;
        });
        connyEars.forEach((obj) => {
            obj.objectUniformConfig = connyPinkConfig;
        });
        connyBlacks.forEach((obj) => {
            obj.objectUniformConfig = connyBlackConfig;
        });
        connyCheek.forEach((obj) => {
            obj.objectUniformConfig = connyCheekConfig;
        });

        connyReds.forEach((obj) => {
            obj.objectUniformConfig = connyRedConfig;
        });

        connySoftReds.forEach((obj) => {
            obj.objectUniformConfig = connySoftRedConfig;
        });
        
        connySolidPinks.forEach((obj) => {
            obj.objectUniformConfig = connySolidPinkConfig;
        });
    }

    function setTreeConfig() {
        TreeTrunks.forEach((obj) => {
            obj.objectUniformConfig = trunkColorConfig;
        });

        TreeLeaves.forEach((obj) => {
            obj.objectUniformConfig = leaveColorConfig;
        });
    }

    function setMountainConfig() {
        mountain.objs.mountBase.objectUniformConfig = mountainColorConfig;
        mountain.objs.mountTop.objectUniformConfig = connyDefaultConfig;
    }

    const
        brownColor = [139 / 255, 88 / 255, 73 / 255],
        brownBaseFaceColor = [195 / 255, 188 / 255, 191 / 255],
        brownFacialPartColor = [39 / 255, 11 / 255, 5 / 255],
        brownInnerEarColor = [79 / 255, 48 / 255, 33 / 255],
        brownRibbonColor = [139 / 255, 13 / 255, 9 / 255],
        brownLuckyCloverColor = [62 / 255, 160 / 255, 85 / 255],
        cloudDefaultColor = [255 / 255, 255 / 255, 255 / 255],
        outerBaloonColor = [112 / 255, 112 / 255, 112 / 255],
        innerBaloonColor = [234 / 255, 128 / 255, 12 / 255],
        lowerBaloonColor = [90 / 255, 90 / 255, 90 / 255],
        ropeColor = [175 / 255, 139 / 255, 115 / 255],
        passangerSeatColor = [99 / 255, 82 / 255, 69 / 255]
    ;


    let brownDefaultConfig = renderProgramInfo.createUniformConfig();
    brownDefaultConfig.addUniform("color", "3fv", brownColor);

    let brownBaseFaceConfig = renderProgramInfo.createUniformConfig();
    brownBaseFaceConfig.addUniform("color", "3fv", brownBaseFaceColor);

    let brownFacialPartConfig = renderProgramInfo.createUniformConfig();
    brownFacialPartConfig.addUniform("color", "3fv", brownFacialPartColor);

    let brownInnerEarConfig = renderProgramInfo.createUniformConfig();
    brownInnerEarConfig.addUniform("color", "3fv", brownInnerEarColor);

    let brownRibbonConfig = renderProgramInfo.createUniformConfig();
    brownRibbonConfig.addUniform("color", "3fv", brownRibbonColor);

    let brownLuckyCloverConfig = renderProgramInfo.createUniformConfig();
    brownLuckyCloverConfig.addUniform("color", "3fv", brownLuckyCloverColor);

    let cloudDefaultConfig = renderProgramInfo.createUniformConfig();
    cloudDefaultConfig.addUniform("color", "3fv", cloudDefaultColor);

    let outerBaloonConfig = renderProgramInfo.createUniformConfig();
    outerBaloonConfig.addUniform("color", "3fv", outerBaloonColor);

    let innerBaloonConfig = renderProgramInfo.createUniformConfig();
    innerBaloonConfig.addUniform("color", "3fv", innerBaloonColor);

    let lowerBaloonConfig = renderProgramInfo.createUniformConfig();
    lowerBaloonConfig.addUniform("color", "3fv", lowerBaloonColor);

    let ropeConfig = renderProgramInfo.createUniformConfig();
    ropeConfig.addUniform("color", "3fv", ropeColor);

    let passangerSeatConfig = renderProgramInfo.createUniformConfig();
    passangerSeatConfig.addUniform("color", "3fv", passangerSeatColor);

    const brownBaseFace = [brown.objs.baseFace];
    const brownFacialPart = [brown.objs.leftEye, brown.objs.rightEye, brown.objs.nose, brown.objs.leftMouth, brown.objs.rightMouth];
    const brownInnerEar = [brown.objs.leftInnerEar, brown.objs.rightInnerEar];
    const brownRibbon = [brown.objs.mainRibbon, brown.objs.middleRibbon];
    const brownLuckyClover = [brown.objs.luckyCloverStem, brown.objs.middleLeave, brown.objs.leave1, brown.objs.leave2, brown.objs.leave3, brown.objs.leave4];
    const outerBaloon = [baloon.outerBaloon];
    const innerBaloon = [baloon.innerBaloon];
    const lowerBaloon = [baloon.lowerBaloon];
    const rope = [baloon.rope1, baloon.rope2, baloon.rope3, baloon.rope4];
    const passangerSeat = [baloon.passangerSeatSide, baloon.passangerSeatBottom];
    function setbrownConfig() {
        Object.values(brown.objs).forEach((obj) => {
            obj.objectUniformConfig = brownDefaultConfig;
        });
        Object.values(cloud).forEach((obj) => {
            obj.objectUniformConfig = cloudDefaultConfig;
        });
        Object.values(baloon).forEach((obj) => {
            obj.objectUniformConfig = cloudDefaultConfig;
        });
        brownBaseFace.forEach((obj) => {
            obj.objectUniformConfig = brownBaseFaceConfig;
        });
        brownFacialPart.forEach((obj) => {
            obj.objectUniformConfig = brownFacialPartConfig;
        });
        brownInnerEar.forEach((obj) => {
            obj.objectUniformConfig = brownInnerEarConfig;
        });
        brownRibbon.forEach((obj) => {
            obj.objectUniformConfig = brownRibbonConfig;
        });
        brownLuckyClover.forEach((obj) => {
            obj.objectUniformConfig = brownLuckyCloverConfig;
        });
        outerBaloon.forEach((obj) => {
            obj.objectUniformConfig  = outerBaloonConfig;
        });
        innerBaloon.forEach((obj) => {
            obj.objectUniformConfig  = innerBaloonConfig;
        });
        lowerBaloon.forEach((obj) => {
            obj.objectUniformConfig  = lowerBaloonConfig;
        });
        rope.forEach((obj) => {
            obj.objectUniformConfig  = ropeConfig;
        });
        passangerSeat.forEach((obj) => {
            obj.objectUniformConfig  = passangerSeatConfig;
        });
    }

    {
        let set = (...prop)=>shadowProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("PMatrix", false, lightProjMatrix);
        set("VMatrix", false, lightViewMatrix);
    }

    /*========================= DEPTH FRAME BUFFER & TEXTURE ========================= */
    var unusedTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, unusedTexture);
    GL.texImage2D(
        GL.TEXTURE_2D,      // target
        0,                  // mip level
        GL.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        GL.DEPTH_COMPONENT, // format
        GL.UNSIGNED_INT,    // type
        null);              // data
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
    var depthFramebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, depthFramebuffer);
    GL.framebufferTexture2D(
        GL.FRAMEBUFFER,       // target
        GL.DEPTH_ATTACHMENT,  // attachment point
        GL.TEXTURE_2D,        // texture target
        unusedTexture,         // texture
        0                     // mip level
    );
    
    // create a color texture of the same size as the depth texture
    const depthTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, depthTexture);
    GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        depthTextureSize,       // width
        depthTextureSize,       // height
        0,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        null,
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
    // attach it to the framebuffer
    GL.framebufferTexture2D(
        GL.FRAMEBUFFER,        // target
        GL.COLOR_ATTACHMENT0,  // attachment point
        GL.TEXTURE_2D,         // texture target
        depthTexture,         // texture
        0                      // mip level
    );

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0., 0., 0., 0.);
    GL.clearDepth(1.);

    /*========================= RENDER SHADOW ========================= */
    function renderShadow() {
        if (renderMode == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, depthFramebuffer);
            GL.viewport(0, 0, depthTextureSize, depthTextureSize);
        } else if (renderMode == 1) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);
            GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        }

        objects.forEach(obj => {
            obj.programInfo = shadowProgramInfo;
        });
        
        GL.clearColor(1., 1., 1., 1.);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        
        objects.forEach(obj => {
            obj.render();
        });
    }

    function renderFull() {
        if (renderMode == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        } else if (renderMode == 1) {
            return;
        }

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clearColor(...backgroundColor, 1.);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.bindTexture(GL.TEXTURE_2D, depthTexture);

        objects.forEach(obj => {
            obj.programInfo = renderProgramInfo;
        });

        setIslandConfig();
        setLeonardConfig();
        setConnyConfig();
        setTreeConfig();
        setMountainConfig();
        setbrownConfig();

        objects.forEach(obj => {
            obj.render();
        });
    }

    /*========================= ANIMATIONS ========================= */
    function poseApplier({value}) {
        value.apply();
    }
    let transitionLeonard = new TransitionManager()
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.stand), 2000, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.walkRight), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkRight, leonard.pose.walkLeft), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkLeft, leonard.pose.walkRight), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkRight, leonard.pose.stand), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.sineInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 200, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.airborne), 350, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.airborne, leonard.pose.stand), 350, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 200, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.stand), 1000)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 500, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 100, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.backFlip1), 170, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip1, leonard.pose.backFlip2), 150)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip2, leonard.pose.backFlip3), 170)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip3, leonard.pose.backFlip4), 200)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip4, leonard.pose.stand), 300)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 500, Easing.quadraticInOut)
    .repeat(2);

    function leonardMove({value}) {
        leonard.objs.root.transform.setTranslationZ(value);
    }

    let transitionMoveLeonard = new TransitionManager()
    .delay(2000)
    .add(leonardMove, new NumberInterpolator(0, 80), 2800, Easing.quadraticInOut)
    .add(leonardMove, new NumberInterpolator(80, 80), 400)
    .add(leonardMove, new NumberInterpolator(80, 0), 700)
    .delay(3690)
    .repeat(2);
    

    function connyMove({value}){
        conny.objs.root.transform.setTranslationZ(value);
    }
    let connyWalkTransition = new TransitionManager()

    for(var i = 0; i < 1; i++){
        connyWalkTransition
        .add(poseApplier, new PoseInterpolator(conny.pose.T, conny.pose.stand), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.walkRight), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkRight, conny.pose.walkLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkLeft, conny.pose.walkRight), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkRight, conny.pose.walkLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkLeft, conny.pose.stand), 1000, Easing.sineInOut)

        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.greeting), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.greeting, conny.pose.stand), 1000, Easing.sineInOut)
        
        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.walkRight), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkRight, conny.pose.walkLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkLeft, conny.pose.walkRight), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkRight, conny.pose.walkLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.walkLeft, conny.pose.stand), 1000, Easing.sineInOut)

        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.turnLeft), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.turnLeft, conny.pose.stand), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.turnRight), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.turnRight, conny.pose.stand), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.turnUp), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.turnUp, conny.pose.turnDown), 2000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.turnDown, conny.pose.stand), 2000, Easing.sineInOut) 
         
        .add(poseApplier, new PoseInterpolator(conny.pose.stand, conny.pose.jumpStart), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.jumpStart, conny.pose.jumpEnd), 400, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(conny.pose.jumpEnd, conny.pose.stand), 600, Easing.sineInOut)
    }
    let connyMoveTransition =new TransitionManager()
    .add(connyMove, new NumberInterpolator(0, 0), 800, Easing.sineInOut)
    .add(connyMove, new NumberInterpolator(0, 50), 4400, Easing.sineInOut)
    .add(connyMove, new NumberInterpolator(50, 50), 2000, Easing.sineInOut)
    .add(connyMove, new NumberInterpolator(50, 0), 4400, Easing.sineInOut)
    
    function spinClover({value, prevValue}){
        brown.objs.luckyCloverLeaves.transform.rotateZ(value - prevValue);
    }
    function moveEnvObject({value}){
        cloud.root.transform.setTranslationX(value);
        baloon.root.transform.setTranslationX(-value).setTranslationZ(value * 20);
    }
    function brownWalk({value}) {
        brown.objs.root.transform.setTranslationZ(value);
    }
   
    let brownTransition = new TransitionManager()
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.nod), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.nod, brown.pose.initial), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.nod), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.nod, brown.pose.initial), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.initial), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.waveRightHand), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.waveRightHand, brown.pose.initial), 1000, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.initial), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.showLuckyClover), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.showLuckyClover, brown.pose.luckyCloverLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverLeft, brown.pose.luckyCloverRight), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverRight, brown.pose.luckyCloverLeft), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverLeft, brown.pose.luckyCloverRight), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverRight, brown.pose.showLuckyClover), 800, Easing.sineInOut)
        .add(spinClover, new NumberInterpolator(0, 3600), 25000)

    let brownTransition2 = new TransitionManager()
        .add(moveEnvObject, new NumberInterpolator(0, 200), 100000)

    let brownWalkTransition = new TransitionManager()
        .delay(2000)
        .add(brownWalk, new NumberInterpolator(0, 70), 4000)
        .add(brownWalk, new NumberInterpolator(70, 70), 2000)
        .add(brownWalk, new NumberInterpolator(70, 0), 4000)

    function updateCameraPosition({value}) {
        let cameraPosition = value.arr();
        let cameraTarget = [0., 0., 0.]
        let cameraMatrix = LIBS.look_at(cameraPosition, cameraTarget, [0, 1, 0]);
        let viewDirection = Vector.sub(cameraTarget, cameraPosition).normalize().arr();
        let viewMatrix = Matrix.fromGLMatrix(cameraMatrix, 4, 4).inverse().toGLMatrix();

        renderProgramInfo.uniformConfig.setAndApplyUniformValue("VMatrix", false, viewMatrix);
        renderProgramInfo.uniformConfig.setAndApplyUniformValue("view_direction", viewDirection);
    }
    let cameraTransition = new TransitionManager()
    .add(updateCameraPosition, new VectorInterpolator([-100, -30, 420], [100, -30, 420]), 10000)
    .add(updateCameraPosition, new VectorInterpolator([-100, 30, 230], [-100, 30, 200]), 2000)
    .add(updateCameraPosition, new VectorInterpolator([0, 50, 230], [0, 50, 200]), 2000)
    .add(updateCameraPosition, new VectorInterpolator([200, -30, 420], [0, -30, 420]), 3000)
    .add(updateCameraPosition, new VectorInterpolator([300, 50, 420], [100, 50, 310]), 3000)
    .add(updateCameraPosition, new VectorInterpolator([-200, 30, 420], [0, -30, 420]), 2000, Easing.quadraticInOut);

    let prevTime = 0, delay = 3000;
    function animate(time) {
        /*========================= TRANSFORMATIONS ========================= */
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }

        let dt = time - prevTime;
        if (time < delay) {
            dt = 0;
        }
        prevTime = time;
        
        objects.forEach((obj) => {
            obj.transform.reset();
        });

        island.objs.root.transform.scaleUniform(500).translateY(-50);

        transitionLeonard.step(dt);
        transitionMoveLeonard.step(dt);
        leonard.objs.root.transform.translateY(-20).translateX(90).translateZ(100);

        connyWalkTransition.step(dt);
        connyMoveTransition.step(dt);
        conny.objs.root.transform.scale(0.9, 0.9, 0.9).translateX(-90).translateZ(100);

        mountain.objs.root.transform.scaleUniform(60).translate(-1000, 50, 2000);

        tree1.objs.root.transform.scaleUniform(4).translate(20, 40, -200);
        tree2.objs.root.transform.scaleUniform(4).translate(20, 80, -270);
        
        brownTransition.step(dt);
        brownTransition2.step(dt);
        brownWalkTransition.step(dt);

        brown.objs.root.transform.translateY(13).translateZ(100);
        baloon.root.transform.scaleUniform(1.2).rotateY(Math.PI/6).translate(-40, 200, -1500);
        cloud.root.transform.scaleUniform(.2).translate(20, -70, 300);

        cameraTransition.step(dt);

        objects.forEach((obj) => {
            obj.transform.rotateY(THETA);
            obj.transform.rotateX(PHI);
        });
        
        renderShadow();
        renderFull();

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);