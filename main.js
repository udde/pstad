var SCREEN_WIDTH = window.innerWidth - 10;
var SCREEN_HEIGHT = window.innerHeight - 10;

var camera, scene;
var canvasRenderer, webglRenderer;

var container, mesh, geometry, plane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;



var stats = new Stats();

stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = SCREEN_WIDTH+'px';
// stats.domElement.style.top = '0px';

// document.getElementById("log").appendChild( stats.domElement);


init();
animate();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.x = 10;
	camera.position.y = 10;
	camera.position.z = 1500;
	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});

	scene = new THREE.Scene();

	// LIGHTS
	scene.add(new THREE.AmbientLight(0xeeeeee));

	var light;

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
	//scene.add( new THREE.DirectionalLightHelper(light, 100.0) );

	var groundMaterial = new THREE.MeshPhongMaterial({
		color: 0x6C6C6C
	});

	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			uLight: {type: "v3", value: light.position },
			uCamera: {type: "v3", value: camera.position },
			uPlaneSegmentsSize: {type : "f", value: 50.0}
		},
		vertexShader: document.getElementById( 'groundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'groundFragmentShader' ).textContent,
		// shading: THREE.FlatShading,
		// wireframe: true
	}
);
var flatMaterial = new THREE.MeshPhongMaterial({shading: THREE.FlatShading});

plane = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 1*16, 1*12), shaderMaterial);

plane.receiveShadow = true;
scene.add(plane);

water = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 32, 24),new THREE.MeshPhongMaterial( { color: 0x77bbee, shading: THREE.FlatShading } ));
water.material.transparent = true;
water.material.opacity = 0.5;
scene.add(water);


var geometry = new THREE.TorusGeometry( 120, 40, 6, 6 );
var material = new THREE.MeshPhongMaterial( { color: 0xffff00, shading: THREE.FlatShading } );
var torus = new THREE.Mesh( geometry, shaderMaterial );
// scene.add( torus );
var ns = geometry.computeFaceNormals ();
console.log(ns);
var groundVertices = plane.geometry.vertices;
console.log(groundVertices);

var geometry = new THREE.SphereGeometry(800, 60, 40);
var uniforms = {
  //texture: { type: 't', value: loadTexture('../pek.png') }
};

var material = new THREE.ShaderMaterial( {
  //uniforms:       uniforms,
  //vertexShader:   document.getElementById('sky-vertex').textContent,
  //fragmentShader: document.getElementById('sky-fragment').textContent
});

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
	stats.end();
	webglRenderer.render(scene, camera);
}
