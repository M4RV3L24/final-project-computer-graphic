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
            -500., -200., -500.,     0., 1., 0.,
        ],
        indices: [
            0, 1, 2,
            2, 0, 3,
        ]
    };
    let floor = new GLObject(GL, floorData.vertices, floorData.indices);

    let brown = createBrown(GL);

    objects = [brown.objs.root, floor];
    
    objects.forEach(obj => {
        obj.setup();
    });

    /*========================= UNIFORMS ========================= */

    const defaultColor = [0.7, 0.7, 0.7];
    const projMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 500);

    const cameraPosition = [0.,30.,200.];
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
        brownColor = [139 / 255, 88 / 255, 73 / 255],
        brownBaseFaceColor = [195 / 255, 188 / 255, 191 / 255],
        brownFacialPartColor = [39 / 255, 11 / 255, 5 / 255],
        brownInnerEarColor = [79 / 255, 48 / 255, 33 / 255],
        brownRibbonColor = [139 / 255, 13 / 255, 9 / 255],
        brownLuckyCloverColor = [62 / 255, 160 / 255, 85 / 255]
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


    const brownBaseFace = [brown.objs.baseFace];
    const brownFacialPart = [brown.objs.leftEye, brown.objs.rightEye, brown.objs.nose, brown.objs.leftMouth, brown.objs.rightMouth];
    const brownInnerEar = [brown.objs.leftInnerEar, brown.objs.rightInnerEar];
    const brownRibbon = [brown.objs.mainRibbon, brown.objs.middleRibbon];
    const brownLuckyClover = [brown.objs.luckyCloverStem, brown.objs.middleLeave, brown.objs.leave1, brown.objs.leave2, brown.objs.leave3, brown.objs.leave4];
    function setbrownConfig() {
        Object.values(brown.objs).forEach((obj) => {
            obj.objectUniformConfig = brownDefaultConfig;
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
        GL.clearColor(0.4, 0.4, 0.4, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.bindTexture(GL.TEXTURE_2D, depthTexture);

        objects.forEach(obj => {
            obj.programInfo = renderProgramInfo;
        });

        setbrownConfig();

        objects.forEach(obj => {
            obj.render();
        });
    }

    /*========================= ANIMATIONS ========================= */
    function poseApplier({value}) {
        value.apply();
    }
    function spinClover({value, prevValue}){
        brown.objs.luckyCloverLeaves.transform.rotateZ(value - prevValue);
    }
   
    let transition = new TransitionManager()
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.nod), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.nod, brown.pose.initial), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.nod), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.nod, brown.pose.initial), 500, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.leftFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.leftFootWalk, brown.pose.rightFootWalk), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.rightFootWalk, brown.pose.initial), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.waveRightHand), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.waveRightHand, brown.pose.initial), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.initial, brown.pose.showLuckyClover), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.showLuckyClover, brown.pose.luckyCloverLeft), 800, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverLeft, brown.pose.luckyCloverRight), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverRight, brown.pose.luckyCloverLeft), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverLeft, brown.pose.luckyCloverRight), 1600, Easing.sineInOut)
        .add(poseApplier, new PoseInterpolator(brown.pose.luckyCloverRight, brown.pose.showLuckyClover), 800, Easing.sineInOut)
        .add(spinClover, new NumberInterpolator(0, 3600), 25000)



    let prev_time = 0;
    function animate(time) {
        // brown.objs.rightArmGroup.transform.rotateAlong(LIBS.degToRad(1), [0, 0, 1], [23, 2, 4]);
        /*========================= TRANSFORMATIONS ========================= */
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }

        objects.forEach(object => {
            object.transform.reset();
        });
        let dt = time - prev_time;
        transition.step(dt);
        prev_time = time;
        objects.forEach(object => {
            object.transform.scaleUniform(0.5);
            object.transform.rotateY(THETA);
            object.transform.rotateX(PHI);
        });

        renderShadow();
        renderFull();

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);