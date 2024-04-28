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
        
        console.log(e.pageX, e.pageY);
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

        addUniform("mat_ambient_color", "3fv");
        addUniform("mat_diffuse_color", "3fv");
        addUniform("mat_specular_color", "3fv");
        addUniform("mat_shininess", "1f");

        addUniform("view_direction", "3fv");
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
    let floorData = {
        vertices: [
            -500., -200.,  500.,     0., 1., 0.,
            500., -200.,  500.,     0., 1., 0.,
            500., -200., -500.,     0., 1., 0.,
           -500., -200., -500.,     0., 1., 0.
        ],
        indices: [
            0, 1, 2,
            2, 0, 3,
        ]
    };

  
    let floor = new GLObject(GL, floorData.vertices, floorData.indices);

    let conny = createConny(GL);

    let tree1 = createTree1(GL);
    let tree2 = createTree2(GL);

    let mountain = createMountain(GL);

    objects = [conny.objs.root, floor,tree2.objs.root, tree1.objs.root, mountain.objs.root];
    
    objects.forEach(obj => {
        obj.setup();
    });

    /*========================= UNIFORMS ========================= */

    const defaultColor = [0.7, 0.7, 0.7];
    const projMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 500);

    const cameraPosition = [0.,30.,140.];
    const cameraTarget = [0., 0., 0.]
    const cameraMatrix = LIBS.look_at(cameraPosition, cameraTarget, [0, 1, 0]);
    const viewDirection = Vector.sub(cameraTarget, cameraPosition).normalize().arr();
    const viewMatrix = Matrix.fromGLMatrix(cameraMatrix, 4, 4).inverse().toGLMatrix();
    
    const lightSourceAmbientColor = [0.3,0.3,0.3];
    const lightSourceDiffuseColor = [1.,1.,1.];
    const lightSourceSpecularColor = [1.,1.,1.];
    
    const matAmbientColor = [1.,1.,1.];
    const matDiffuseColor = [1.,1.,1.];
    const matSpecularColor = [1.,1.,1.];
    const matShininess = 20.;

    const lightSourcePosition = [20., 20., 20.];
    const lightSourceTarget = [0., 0., 0.];
    const lightSourceDirection = Vector.sub(lightSourcePosition, lightSourceTarget).normalize().arr();

    const cellSize = 1/1000;
    const spread = 2;
    const bias = 0.15;

    const lightProjMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 1000);
    const lightViewMatrix = Transform3.translateZ(
        Matrix.fromGLMatrix(
            LIBS.look_at(
                lightSourcePosition,
                lightSourceTarget,
                [0, 1, 0]
            ), 4, 4
        ).inverse(),
        -60
    ).toGLMatrix();

    var THETA = 0, PHI = 0;

    {
        let set = (...prop)=>renderProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("color", defaultColor);
        set("PMatrix", false, projMatrix);
        set("VMatrix", false, viewMatrix);
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

        set("view_direction", viewDirection);
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

        TreeTrunks.forEach((obj) => {
            obj.objectUniformConfig = trunkColorConfig;
        });

        TreeLeaves.forEach((obj) => {
            obj.objectUniformConfig = leaveColorConfig;
        });

        mountain.objs.mountBase.objectUniformConfig = mountainColorConfig;
        mountain.objs.mountTop.objectUniformConfig = connyDefaultConfig;
    }





    {
        let set = (...prop)=>shadowProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("PMatrix", false, lightProjMatrix);
        set("VMatrix", false, lightViewMatrix);
    }

    /*========================= DEPTH FRAME BUFFER & TEXTURE ========================= */
    var unusedTexture = GL.createTexture();
    var depthTextureSize = 1024;
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
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.bindTexture(GL.TEXTURE_2D, depthTexture);

        objects.forEach(obj => {
            obj.programInfo = renderProgramInfo;
        });

        setConnyConfig();

        objects.forEach(obj => {
            obj.render();
        });
    }

    /*========================= ANIMATIONS ========================= */
    function poseApplier({value}) {
        value.apply();
    }

    function connyWalk({value}){
        conny.objs.root.transform.translateZ(value);
    }
    let transition = new TransitionManager()

    for(var i = 0; i < 1; i++){
        transition
        .add(poseApplier, new PoseInterpolator(conny.pose.T, conny.pose.stand), 2000, Easing.sineInOut)
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
    }
    let walkTransition =new TransitionManager()
    .add(connyWalk, new NumberInterpolator(0, 0), 2000, Easing.sineInOut)
    .add(connyWalk, new NumberInterpolator(0, 50), 4400, Easing.sineInOut)
    .add(connyWalk, new NumberInterpolator(50, 50), 2000, Easing.sineInOut)
    .add(connyWalk, new NumberInterpolator(50, 0), 4400, Easing.sineInOut)
    let prevTime = 0;

    function animate(time) {
        /*========================= TRANSFORMATIONS ========================= */
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }
        let dt = time - prevTime;
        prevTime = time;

        
        objects.forEach((obj) => {
            obj.transform.reset();
        });
        transition.step(dt);
        walkTransition.step(dt);


        objects.forEach((obj) => {
            conny.objs.root.transform.scale(0.9, 0.9, 0.9);
            obj.transform.rotateY(THETA);
            obj.transform.rotateX(PHI);
        });
        mountain.objs.root.transform.scale(5, 5, 5).translateZ(100);
            
        

        renderShadow();
        renderFull();

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);