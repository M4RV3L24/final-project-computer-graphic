


// CS Computer Graphics
// Using WebGL to render a 3D object
// siapkan semua data
// lalu render semua data

function main() {
    // setup
    const CANVAS = document.getElementById('myCanvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var drag = false;
    var X_prev = 0;
    var Y_prev = 0;

    var dx = 0;
    var dy = 0;

    var THETA = 0;
    var ALPHA = 0;

    var FRICTION = 0.95;

    var vert = [];
    var kurv = [];
    var clickCount = 0;
    var click = function (e) {
        console.log(e.pageX, e.pageY);
        clickCount+=1;
        pos_x = e.pageX;
        pos_y = e.pageY;
        vert = vert.concat(normalizeScreen(pos_x, pos_y, 0, CANVAS.width, CANVAS.height));
        // vert = vert.concat([1.0, 0.0, 0.0]); //red
        console.log(vert);
        kurv = generateBSpline(vert, 100, 2);

    }
    var mouseDown = function(e) {
        console.log(e);
        drag = true;
        X_prev = e.pageX;
        Y_prev = e.pageY;
    }

    var mouseMove = function(e) {
        // console.log("Mouse Move");
        if(!drag) {return false;}

        dx = e.pageX - X_prev;
        dy = e.pageY - Y_prev;
        console.log(dx+" "+ dy);
        X_prev = e.pageX;
        Y_prev = e.pageY;

        THETA += dx * 2 * Math.PI / CANVAS.width;
        ALPHA += dy * 2 * Math.PI / CANVAS.height;
    }

    var mouseUp = function(e) {
        console.log("Mouse Up");
        drag = false;

    }
    CANVAS.addEventListener('mousedown', mouseDown, false);
    CANVAS.addEventListener('mouseup', mouseUp, false);
    CANVAS.addEventListener('mousemove', mouseMove, false);
   
    

    vert = [0.5,0.5,0.5, 0,0,0, -0.5, 0.5, 0];
    kurv = generateBSpline(vert, 100, 2);

    var circle = generateCircle(1, 1, 1, 3);
    console.log(circle);

    CANVAS.addEventListener('click', click, false);

   
    var GL;

    try {
        // antialias = true, supaya lebih halus (kayak di blur)
        // jadi kalo false, maka akan lebih kasar
        GL = CANVAS.getContext('webgl', { antialias: true });
    } catch (e) {
        alert('You are not webgl compatible :(');
        return false;
    }

    // Shader
    var shader_vertex_source = `
            attribute vec3 position;
            uniform mat4 PMatrix; //projection
            uniform mat4 VMatrix; //View
            uniform mat4 MMatrix; //Model
            void main(){
                gl_PointSize = 10.0;
                gl_Position = PMatrix * VMatrix * MMatrix * vec4(position, 1);
                
            }
            `;

    // set warna 0 - 1
    // R G B A
    var shader_fragment_source = `
        precision mediump float;
        uniform vec3 outColor;

        void main(){

            gl_FragColor = vec4(outColor, 1.0);

        }
        `;

    // kita compile 
    var compile_shader = function (source, type, typeString) {

        var shader = GL.createShader(type);

        GL.shaderSource(shader, source);

        GL.compileShader(shader);

        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {

            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));

            return false;

        }
        return shader;
    };

    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, 'VERTEX');
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, 'FRAGMENT');

    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    // vao = vertex array object
    var position_vao = GL.getAttribLocation(SHADER_PROGRAM, "position");
    // var color_vao = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(position_vao);

    // GL.enableVertexAttribArray(color_vao);

    var uniform_color = GL.getUniformLocation(SHADER_PROGRAM, "outColor"); 
    var P_Matrix = GL.getUniformLocation(SHADER_PROGRAM, "PMatrix");
    var V_Matrix = GL.getUniformLocation(SHADER_PROGRAM, "VMatrix");
    var M_Matrix = GL.getUniformLocation(SHADER_PROGRAM, "MMatrix");


 

    GL.useProgram(SHADER_PROGRAM);
    // Coord

    var circle_vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, circle_vbo);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle), GL.STATIC_DRAW);
    GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);

    var vert_vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vert_vbo);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vert), GL.STATIC_DRAW);
    GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);

    var kurv_vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, kurv_vbo);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(kurv), GL.STATIC_DRAW);
    GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);

    var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width/ CANVAS.height, 1, 100);
    var MODEL_MATRIX = LIBS.get_I4();
    var VIEW_MATRIX = LIBS.get_I4();

    console.log(MODEL_MATRIX);

    //cek kedalaman
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);


    // supaya saat bikin animasi jeda antar framenya sama.
    var prevTime = 0;
    var animate = function (time) {
        
        window.requestAnimationFrame(animate);

        var dt = time-prevTime;
        prevTime = time;

        if (!drag) {
            dx *= FRICTION;
            dy *= FRICTION;
            THETA += dx * 2 * Math.PI / CANVAS.width;
            ALPHA += dy * 2 * Math.PI / CANVAS.height;
        }
        GL.clearColor(0.75, 0.85, 1, 1);
        GL.clear(GL.COLOR_BUFFER_BIT |GL.DEPTH_BUFFER_BIT);

        var radius = 1;
        var pos_x = radius * Math.cos(ALPHA) * Math.cos(THETA);
        var pos_y = radius * Math.sin(ALPHA);
        var pos_z = radius * Math.cos(ALPHA)*Math.sin(THETA);
        
        LIBS.rotateX(MODEL_MATRIX, ALPHA);
        LIBS.rotateY(MODEL_MATRIX, THETA);
        // LIBS.setPosition(MODEL_MATRIX, pos_x, pos_y, pos_z-2);
        
        
        GL.uniformMatrix4fv(P_Matrix, false, PROJECTION_MATRIX);
        GL.uniformMatrix4fv(M_Matrix, false, MODEL_MATRIX);
        GL.uniformMatrix4fv(V_Matrix, false, VIEW_MATRIX);

        GL.bindBuffer(GL.ARRAY_BUFFER, vert_vbo);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vert), GL.STATIC_DRAW);
        GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);
        GL.uniform3f(uniform_color, 1,0,0); 
        GL.drawArrays(GL.POINTS, 0, vert.length/3);
        
        GL.bindBuffer(GL.ARRAY_BUFFER, vert_vbo);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vert), GL.STATIC_DRAW);
        GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);
        GL.uniform3f(uniform_color, 1,0,0); 
        GL.drawArrays(GL.LINE_STRIP, 0, vert.length/3);
        
        GL.bindBuffer(GL.ARRAY_BUFFER, kurv_vbo);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(kurv), GL.STATIC_DRAW);
        GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);
        GL.uniform3f(uniform_color, 1,0,0); 
        GL.drawArrays(GL.LINE_STRIP, 0, kurv.length/3);

        GL.bindBuffer(GL.ARRAY_BUFFER, circle_vbo);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle), GL.STATIC_DRAW);
        GL.vertexAttribPointer(position_vao, 3, GL.FLOAT, false, 3 * 4, 0);
        GL.uniform3f(uniform_color, 1,0,0);
        GL.drawArrays(GL.TRIANGLES, 0, circle.length/3);
        GL.flush();

    }
    animate();
}

window.addEventListener('load', main);
