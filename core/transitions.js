var GL;

class MyObject{
	canvas = null;
	vertex = [];
	faces = [];

	SHADER_PROGRAM = null;
	_color = null;
	_position = null;

	_MMatrix = LIBS.get_I4();
	_PMatrix = LIBS.get_I4();
	_VMatrix = LIBS.get_I4();
	_greyScality = 0;

	TRIANGLE_VERTEX = null;
	TRIANGLE_FACES = null;

	MODEL_MATRIX = LIBS.get_I4();

	childs = [];


	constructor(vertex, faces, source_shader_vertex, source_shader_fragment){
		this.vertex = vertex;
		this.faces = faces;

		var compile_shader = function(source, type, typeString) {
			var shader = GL.createShader(type);
			GL.shaderSource(shader, source);
			GL.compileShader(shader);
			if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
			alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
			return false;
			}
			return shader;
		};
	
		var shader_vertex = compile_shader(source_shader_vertex, GL.VERTEX_SHADER, "VERTEX");
		var shader_fragment = compile_shader(source_shader_fragment, GL.FRAGMENT_SHADER, "FRAGMENT");
	
		this.SHADER_PROGRAM = GL.createProgram();
		GL.attachShader(this.SHADER_PROGRAM, shader_vertex);
		GL.attachShader(this.SHADER_PROGRAM, shader_fragment);
		GL.linkProgram(this.SHADER_PROGRAM);


		//vao
		this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "color");
		this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");

		//uniform
		this._PMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"PMatrix"); //projection
		this._VMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"VMatrix"); //View
		this._MMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"MMatrix"); //Model
		this._greyScality = GL.getUniformLocation(this.SHADER_PROGRAM, "greyScality");//GreyScality

		GL.enableVertexAttribArray(this._color);
		GL.enableVertexAttribArray(this._position);
		GL.useProgram(this.SHADER_PROGRAM);

		this.TRIANGLE_VERTEX = GL.createBuffer();
		this.TRIANGLE_FACES = GL.createBuffer();
	}


	setup(){
		GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
		GL.bufferData(GL.ARRAY_BUFFER,
		new Float32Array(this.vertex),
		GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(this.faces),
		GL.STATIC_DRAW);

		this.childs.forEach(child => {
			child.setup();
		})
	}


	render(VIEW_MATRIX, PROJECTION_MATRIX){
		GL.useProgram(this.SHADER_PROGRAM);  
		GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
		GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4*(3+3), 0);
		GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4*(3+3), 3*4);

		GL.uniformMatrix4fv(this._PMatrix,false,PROJECTION_MATRIX);
		GL.uniformMatrix4fv(this._VMatrix,false,VIEW_MATRIX);
		GL.uniformMatrix4fv(this._MMatrix,false,this.MODEL_MATRIX);
		GL.uniform1f(this._greyScality, 1);

		GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);

		this.childs.forEach(child => {
			child.render(VIEW_MATRIX, PROJECTION_MATRIX);
		})
	}
}

class Transition{
	callback = null
	value = null
	totalTime = null

	constructor(callback, value, totalTime){
		this.callback = callback
		this.value = value
		this.totalTime = totalTime
	}
}

// class untuk memanage transisi dalam suatu model matrix
// transitions akan dijalankan satu per satu dari awal hingga akhir
// untuk membuat animasi pararel, buat beberapa TransitionManager 
// dengan model matrix yang sama
class TransitionManager{
	_transitions = []
	_MMatrix = null
	_timePassed = 0
	_curIndex = 0

	// model matrix yang ingin ditransisikan
	constructor(MODEL_MATRIX){
		this._MMatrix = MODEL_MATRIX
	}

	// menjalankan transisi dengan duration tertentu (dalam ms)
	step(duration){		
		if(this.isFinished()) return

		let callback = this._transitions[this._curIndex].callback
		let value = this._transitions[this._curIndex].value
		let totalTime = this._transitions[this._curIndex].totalTime
		
		let diff = duration / totalTime * value
		callback(this._MMatrix, diff)

		this._timePassed += duration
		if(this._timePassed >= totalTime){
			let remainder = this._timePassed - totalTime
			this._timePassed = 0
			this._curIndex++
			this.step(remainder)
		}
	}

	// menambah transisi
	addTransition(callback, value, duration){
		this._transitions.push(new Transition(callback, value, duration))
		return this
	}

	// cek apakah seluruh transisi telah dijalankan
	isFinished(){
		if(this._curIndex >= this._transitions.length) return true
		return false
	}
}
	
function main(){
	var CANVAS = document.getElementById("myCanvas");
	CANVAS.width = window.innerWidth;
	CANVAS.height = window.innerHeight;

	try{
		GL = CANVAS.getContext("webgl", {antialias: true});
	}catch(e){
		alert("WebGL context cannot be initialized");
		return false;
	}


	//shaders
	var shader_vertex_source=`
		attribute vec3 position;
		attribute vec3 color;

		uniform mat4 PMatrix;
		uniform mat4 VMatrix;
		uniform mat4 MMatrix;
		
		varying vec3 vColor;
		void main(void) {
		gl_Position = PMatrix*VMatrix*MMatrix*vec4(position, 1.);
		vColor = color;

		gl_PointSize=20.0;
	}`;
	var shader_fragment_source =`
		precision mediump float;
		varying vec3 vColor;
		// uniform vec3 color;

		uniform float greyScality;

		void main(void) {
		float greyScaleValue = (vColor.r + vColor.g + vColor.b)/3.;
		vec3 greyScaleColor = vec3(greyScaleValue, greyScaleValue, greyScaleValue);
		vec3 color = mix(greyScaleColor, vColor, greyScality);
		gl_FragColor = vec4(color, 1.);
	}`;
	

	/*========================= THE TRIANGLE ========================= */
	// POINTS:
	var cube = [
		//belakang
		-1,-1,-1,   1,1,0,
		1,-1,-1,     1,1,0,
		1,1,-1,     1,1,0,
		-1,1,-1,    1,1,0,


		//depan
		-1,-1,1,    0,0,1,
		1,-1,1,     0,0,1,
		1,1,1,      0,0,1,
		-1,1,1,     0,0,1,


		//kiri
		-1,-1,-1,   0,1,1,
		-1,1,-1,    0,1,1,
		-1,1,1,     0,1,1,
		-1,-1,1,    0,1,1,


		//kanan
		1,-1,-1,    1,0,0,
		1,1,-1,     1,0,0,
		1,1,1,      1,0,0,
		1,-1,1,     1,0,0,


		//bawah
		-1,-1,-1,   1,0,1,
		-1,-1,1,    1,0,1,
		1,-1,1,     1,0,1,
		1,-1,-1,    1,0,1,


		//atas
		-1,1,-1,    0,1,0,
		-1,1,1,     0,1,0,
		1,1,1,      0,1,0,
		1,1,-1,     0,1,0
	]
	// FACES:
	var cube_faces = [
		0,1,2,
		0,2,3,


		4,5,6,
		4,6,7,


		8,9,10,
		8,10,11,


		12,13,14,
		12,14,15,


		16,17,18,
		16,18,19,


		20,21,22,
		20,22,23
	];


	//matrix
	var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1,100);
	var VIEW_MATRIX = LIBS.get_I4();
	var MODEL_MATRIX = LIBS.get_I4();
	var MODEL_MATRIX2 = LIBS.get_I4();


	LIBS.translateZ(VIEW_MATRIX,-15);
	LIBS.translateX(MODEL_MATRIX, -4);
	LIBS.translateX(MODEL_MATRIX2, 3);


	var object = new MyObject(cube, cube_faces, shader_vertex_source, shader_fragment_source);
	var object2 = new MyObject(cube, cube_faces, shader_vertex_source, shader_fragment_source);
	//   object2.setup();
	object.childs.push(object2);
	object.setup();
	/*========================= DRAWING ========================= */
	GL.clearColor(0.0, 0.0, 0.0, 0.0);


	GL.enable(GL.DEPTH_TEST);
	GL.depthFunc(GL.LEQUAL);


	let transitions = new TransitionManager(MODEL_MATRIX)
	transitions.addTransition(LIBS.translateX, 3, 2000)
	.addTransition(LIBS.translateY, 3, 2000)
	.addTransition(LIBS.translateZ, 3, 2000)

	let transitions2 = new TransitionManager(MODEL_MATRIX)
	transitions2.addTransition(LIBS.rotateX, LIBS.degToRad(90), 3000)
	.addTransition(LIBS.rotateZ, LIBS.degToRad(90), 3000)

	let transitions3 = new TransitionManager(MODEL_MATRIX2)
	transitions3.addTransition(LIBS.translateX, -3, 2000)
	.addTransition(LIBS.translateY, -3, 2000)
	.addTransition(LIBS.translateZ, -3, 2000)

	let transitions4 = new TransitionManager(MODEL_MATRIX2)
	transitions4.addTransition(LIBS.rotateX, LIBS.degToRad(180), 3000)
	.addTransition(LIBS.rotateZ, LIBS.degToRad(180), 3000)


	var time_prev = 0;
	var animate = function(time) {
		GL.viewport(0, 0, CANVAS.width, CANVAS.height);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);

		var dt = time-time_prev;
		time_prev=time;
		transitions.step(dt)
		transitions2.step(dt)
		transitions3.step(dt)
		transitions4.step(dt)


		object.MODEL_MATRIX = MODEL_MATRIX;
		object2.MODEL_MATRIX = MODEL_MATRIX2;
		object.render(VIEW_MATRIX, PROJECTION_MATRIX);

		window.requestAnimationFrame(animate);
	};


	animate(0);
}
window.addEventListener('load',main);
