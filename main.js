var SCREEN_WIDTH = window.innerWidth - 10;
var SCREEN_HEIGHT = window.innerHeight - 10;

var camera, scene, light;
var canvasRenderer, webglRenderer;

var container, mesh, geometry, plane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var stats = new Stats();

stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = SCREEN_WIDTH+'px';
// stats.domElement.style.top = '0px';
//document.getElementById("log").appendChild( stats.domElement);

init();
animate();

function init() {
	container = document.createElement('div');
	document.body.appendChild(container);


	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.x = 10;
	camera.position.y = 10;
	camera.position.z = 1800;
	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});
	scene = new THREE.Scene();
	// LIGHTS
	scene.add(new THREE.AmbientLight(0xeeeeee));

	light = new THREE.DirectionalLight(0xdfebff, 1.75);
	light.position.set(0.0, 0.0, 400.0);
	light.position.set(-100.0, -200.0, 100.0);
	light.position.multiplyScalar(1.3);
	light.castShadow = true;
	light.shadowCameraVisible = true;
	light.shadowMapWidth = 512;
	light.shadowMapHeight = 512;
	var d = 200;
	light.shadowCameraLeft = -d;
	light.shadowCameraRight = d;
	light.shadowCameraTop = d;
	light.shadowCameraBottom = -d;
	light.shadowCameraFar = 1000;
	light.shadowDarkness = 0.2;
	scene.add(light);

	var gvs = require('./shaders/groundVertexShader.glsl');
	var gfs = require('./shaders/groundFragmentShader.glsl');

	var wvs = require('./shaders/waterVertexShader.glsl');
	var wfs = require('./shaders/waterFragmentShader.glsl');

	//GROUND MATERIAL
	var uniforms =  {
		uTime: {type: "f", value: 0.0 },
		uLight: {type: "v3", value: light.position },
		uCamera: {type: "v3", value: camera.position },
		uPlaneSegmentsSize: {type : "f", value: 50.0}
	};

	var groundMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: gvs(),
		fragmentShader: gfs(),
	});

	plane = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 800/50, 600/50), groundMaterial);

	scene.add(plane);



	//WATER MATERIAL
	uniforms =  {
		uTime: {type: "f", value: 0.0 },
		uLight: {type: "v3", value: light.position },
		uCamera: {type: "v3", value: camera.position }
	};

	var waterMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: wvs(),
		fragmentShader: wfs(),
	});

	water = new THREE.Mesh(new THREE.PlaneGeometry(2800,2600,32,24), waterMaterial);
	water.material.transparent = true;

	// scene.add(water);

	var boxgeometry = new THREE.CubeGeometry(100, 100, 100);
	var boxmaterial = new THREE.MeshLambertMaterial({
		color: 0x771122
	});
	var cube = new THREE.Mesh(boxgeometry, boxmaterial);
	cube.castShadow = true;
	cube.position.x = 100;
	cube.position.y = -100;
	cube.position.z = 200;

	scene.add(cube);

	var flatMaterial = new THREE.MeshPhongMaterial({shading: THREE.FlatShading});

	var groundVertices = plane.geometry.vertices;
	console.log(groundVertices);

	skyBox = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { color: 0x77ddee, shading: THREE.FlatShading } ));
	skyBox.scale.set(-1, 1, 1);
	skyBox.eulerOrder = 'XZY';
	skyBox.renderDepth = 1000.0;
	scene.add(skyBox);

	// RENDERER
	webglRenderer = new THREE.WebGLRenderer({ antialias: true } );
	webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	webglRenderer.domElement.style.position = "relative";
	webglRenderer.shadowMap.enabled = true;
	webglRenderer.shadowMapSoft = true;


	// MIRROR plane
	var planeGeo = new THREE.PlaneBufferGeometry( 800,600,32,24);
	groundMirror = new THREE.Mirror( webglRenderer, camera, { clipBias: 0.003,
	textureWidth: SCREEN_WIDTH, textureHeight: SCREEN_HEIGHT, color: 0x777777 } );
	groundMirror.material.transparent = true;
	mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
	mirrorMesh.add( groundMirror );
	// mirrorMesh.rotateX( - Math.PI / 1 );
	scene.add( mirrorMesh );

	composer = new THREE.EffectComposer(webglRenderer);
	var renderWorld = new THREE.RenderPass(scene, camera);
	var toScreen = new THREE.ShaderPass(THREE.CopyShader);
	toScreen.renderToScreen = true;
	var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
	fxaa.uniforms.resolution.value.set(1 / (SCREEN_WIDTH), 1 / (SCREEN_HEIGHT));

	composer.renderTarget1.stencilBuffer = true;
	composer.renderTarget2.stencilBuffer = true;

	composer.addPass(renderWorld);
	composer.addPass(fxaa);
	composer.addPass(toScreen);
	container.appendChild(webglRenderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	webglRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	var timer = Date.now() * 0.001;
	// camera.position.x = Math.cos(timer) * 1000;
	// camera.position.z = Math.sin(timer) * 1000;
	requestAnimationFrame(animate);
	render();
}
function renderTxture(){

}
function render() {
	camera.lookAt(scene.position);
	stats.begin();
	water.material.uniforms.uTime.value += 1.0 / 100.0;
	groundMirror.material.uniforms.time.value += 1.0 / 100.0;
	groundMirror.render();
	// webglRenderer.render(scene, camera);
	composer.render();
	stats.end();
}
