function main() {
    var CANVAS = document.getElementById("canvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= CAPTURE MOUSE EVENTS ========================= */

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

    /*========================= GET WEBGL CONTEXT ========================= */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
        GL.getExtension("OES_element_index_uint");
        GL.getExtension('WEBGL_depth_texture');
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    /*========================= SHADERS ========================= */
    var vertexShaderSource = document.querySelector("#vertexShader").text;
    var fragmentShaderSource = document.querySelector("#fragmentShader").text;

    var shadowVertexShaderSource = document.querySelector("#shadowVertexShader").text;
    var shadowFragmentShaderSource = document.querySelector("#shadowFragmentShader").text;

    /*========================= THE OBJECTS ========================= */
    let renderProgramInfo;
    {
        vertexShader = createShader(GL, GL.VERTEX_SHADER, vertexShaderSource);
        fragmentShader = createShader(GL, GL.FRAGMENT_SHADER, fragmentShaderSource);
        program = createProgram(GL, vertexShader, fragmentShader);
        renderProgramInfo = new ProgramInfo(GL, program);

        let addUniform = (...prop)=>renderProgramInfo.uniformConfig.addUniform(...prop);
        addUniform("PMatrix", "Matrix4fv");
        addUniform("VMatrix", "Matrix4fv");
        addUniform("lightPMatrix", "Matrix4fv");
        addUniform("lightVMatrix", "Matrix4fv");
        addUniform("MMatrix", "Matrix4fv");
        addUniform("normalMatrix", "Matrix4fv");
        addUniform("color", "3fv");

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

    const defaultColor = [.7, .7, .7], yellow = [.7, .7, .3];

    let yellowUniformConfig = renderProgramInfo.createUniformConfig();
    yellowUniformConfig.addUniform("color", "3fv", yellow);

    let ellipsoidData = generateEllipsoid(100, 100, 30, 20, 10);
    let ellipsoid = new GLObject(GL, ellipsoidData.vertices, ellipsoidData.indices);

    let hyperboloid1Data = generateHyperboloid1(100, 100, 1, 1, 0.5);
    let hyperboloid1 = new GLObject(GL, hyperboloid1Data.vertices, hyperboloid1Data.indices);
    
    let hyperboloid2Data = generateHyperboloid2(100, 100, 1, 1, 1);
    let hyperboloid2 = new GLObject(GL, hyperboloid2Data.vertices, hyperboloid2Data.indices);
    
    let ellipticConeData = generateEllipticCone(100, 100, 1, 1, 1);
    let ellipticCone = new GLObject(GL, ellipticConeData.vertices, ellipticConeData.indices);
    
    let ellipticParaboloidData = generateEllipticParaboloid(500, 500, 2, 2, 5);
    let ellipticParaboloid = new GLObject(GL, ellipticParaboloidData.vertices, ellipticParaboloidData.indices);

    let hyperbolicParaboloidData = generateHyperbolicParaboloid(100, 100, 2, 2, 5);
    let hyperbolicParaboloid = new GLObject(GL, hyperbolicParaboloidData.vertices, hyperbolicParaboloidData.indices);

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

    objects = [ellipsoid, hyperboloid1, hyperboloid2, ellipticCone, ellipticParaboloid, hyperbolicParaboloid, floor];
    // objects = [ellipsoid, floor];
    
    objects.forEach(obj => {
        obj.setup();
    });

    /*========================= UNIFORMS ========================= */

    const projMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 500);

    const cameraPosition = [0.,30.,140.];
    const cameraTarget = [0., 0., 0.];
    const cameraMatrix = LIBS.look_at(cameraPosition, cameraTarget, [0, 1, 0]);
    const viewDirection = Vector.sub(cameraTarget, cameraPosition).normalize().arr();
    const viewMatrix = Matrix.inverse(Matrix.fromGLMatrix(cameraMatrix, 4, 4)).toGLMatrix();
    
    const lightSourceAmbientColor = [1.,1.,1.];
    const lightSourceDiffuseColor = [1.,1.,1.];
    const lightSourceSpecularColor = [1.,1.,1.];
    
    const matAmbientColor = [0.3,0.3,0.3];
    const matDiffuseColor = [1.,1.,1.];
    const matSpecularColor = [1.,1.,1.];
    const matShininess = 20.;

    const lightSourcePosition = [20., 10., 0.];
    const lightSourceTarget = [0., 0., 0.];
    const lightSourceDirection = Vector.sub(lightSourcePosition, lightSourceTarget).normalize().arr();

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
        let set = (...prop)=>renderProgramInfo.uniformConfig.setUniformValue(...prop);
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
        set("cellSize", 1/1000);
        set("spread", 2);
        set("bias", 0.05);

        set("view_direction", viewDirection);
    }

    {
        let set = (...prop)=>shadowProgramInfo.uniformConfig.setUniformValue(...prop);
        set("PMatrix", false, lightProjMatrix);
        set("VMatrix", false, lightViewMatrix);
    }

    var depthTexture = GL.createTexture();
    var depthTextureSize = 1024;
    GL.bindTexture(GL.TEXTURE_2D, depthTexture);
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
        depthTexture,         // texture
        0                     // mip level
    );
    
    // create a color texture of the same size as the depth texture
    const unusedTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, unusedTexture);
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
        unusedTexture,         // texture
        0                      // mip level
    );

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0., 0., 0., 0.);
    GL.clearDepth(1.);

    function animate() {
        /*========================= TRANSFORMATIONS ========================= */
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }

        objects.forEach(object => {
            object.transform.reset();
            object.transform.scaleUniform(0.3);
            object.transform.rotateY(THETA);
            object.transform.rotateX(PHI);
        });

        ellipsoid.transform.translateX(-20).translateZ(-50);
        hyperbolicParaboloid.transform.translateX(0);
        hyperbolicParaboloid.transform.rotateAlong(THETA, Vector.sub([0, 40, -20],[0, 0,-20]).normalize().arr(),[0, 0, -20]);

        hyperboloid1.transform.translateY(20);
        hyperboloid2.transform.translateY(-15);
        ellipticCone.transform.translateZ(-20);
        ellipticParaboloid.transform.translateX(-40);


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

            objects.forEach(object => {
                object.render();
            });
        }

        /*========================= RENDER FULL ========================= */
        function renderFull() {
            if (renderMode == 0) {
                GL.bindFramebuffer(GL.FRAMEBUFFER, null);
            } else if (renderMode == 1) {
                return;
            }

            GL.viewport(0, 0, CANVAS.width, CANVAS.height);
            GL.clearColor(0.0, 0.0, 0.0, 1.0);
            GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

            GL.bindTexture(GL.TEXTURE_2D, unusedTexture);

            objects.forEach(obj => {
                obj.programInfo = renderProgramInfo;
            });
        
            ellipticCone.objectUniformConfig = yellowUniformConfig;

            

            objects.forEach(object => {
                object.render();
            });
        }

        renderShadow();
        renderFull();

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);