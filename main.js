var SCREEN_WIDTH = window.innerWidth - 200;
var SCREEN_HEIGHT = window.innerHeight - 100;

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

document.getElementById("log").appendChild( stats.domElement);


init();
animate();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.x = 10;
	camera.position.y = 10;
	camera.position.z = 1200;
	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});

	scene = new THREE.Scene();

	// LIGHTS
	scene.add(new THREE.AmbientLight(0x666666));

	var light;

	light = new THREE.DirectionalLight(0xdfebff, 1.75);
	light.position.set(1000.0, 400.0, 1000.0);
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
	scene.add( new THREE.DirectionalLightHelper(light, 100.0) );

	var groundMaterial = new THREE.MeshPhongMaterial({
		color: 0x6C6C6C
	});

	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			uLight: {type: "v3", value: light.position },
			uCamera: {type: "v3", value: camera.position }
		},
		vertexShader: document.getElementById( 'groundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'groundFragmentShader' ).textContent,
		// shading: THREE.FlatShading,
		// wireframe: true
	}
);
var flatMaterial = new THREE.MeshPhongMaterial({shading: THREE.FlatShading});

plane = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 16, 12), shaderMaterial);
// debugger;
// plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;

scene.add(plane);
// debugger;

var geometry = new THREE.TorusGeometry( 120, 40, 6, 6 );
var material = new THREE.MeshPhongMaterial( { color: 0xffff00, shading: THREE.FlatShading } );
var torus = new THREE.Mesh( geometry, shaderMaterial );
// scene.add( torus );

var groundVertices = plane.geometry.vertices;
console.log(groundVertices);

var geometry = new THREE.BufferGeometry();
var vertexPositions = [
	[-1.0, -1.0,  1.0],
	[ 1.0, -1.0,  -1.0],
	[ 1.0,  1.0,  1.0],

	[ 1.0,  1.0,  1.0],
	[-1.0,  1.0,  1.0],
	[-1.0, -1.0,  1.0]
];
var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
// var normals = new Float32Array( vertexPositions.length * 3 ); // three components per vertex

// var c3 = new THREE.Vector3();
// var j = 0;
// for(var i = 0; i < vertexPositions.length - 2; i+=3){
// 	// var a = new THREE.Vector3(vertexPositions[i][0],vertexPositions[i][1],vertexPositions[i][2]);
// 	// var b = new THREE.Vector3(vertexPositions[i+1][0],vertexPositions[i+1][1],vertexPositions[i+1][2]);
// 	// var c = new THREE.Vector3(vertexPositions[i+2][0],vertexPositions[i+2][1],vertexPositions[i+2][2]);
//
// 	// if(i%3 == 0){
// 	// 	var c1 = new THREE.Vector3();
// 	// 	c1.subVectors(a,b);
// 	// 	var c2 = new THREE.Vector3();
// 	// 	c2.subVectors(c,b);
// 	// 	c3.crossVectors(c1,c2);
// 	// }
// 	//
// 	//
// 	// normals[ i*3 + 0 ] = c3.x;
// 	// normals[ i*3 + 1 ] = c3.y;
// 	// normals[ i*3 + 2 ] = c3.z;
// }
// console.log(normals);
for ( var i = 0; i < vertexPositions.length; i++ )
{
	vertices[ i*3 + 0 ] = vertexPositions[i][0];
	vertices[ i*3 + 1 ] = vertexPositions[i][1];
	vertices[ i*3 + 2 ] = vertexPositions[i][2];
}
geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
var material = new THREE.MeshBasicMaterial( { color: 0xff00aa } );
var mesh = new THREE.Mesh( geometry, material );

scene.add(mesh);


var boxgeometry = new THREE.CubeGeometry(100, 100, 100);
var boxmaterial = new THREE.MeshLambertMaterial({
	color: 0x0aeedf
});
var cube = new THREE.Mesh(boxgeometry, shaderMaterial);
cube.castShadow = true;
cube.position.x = 0;
cube.position.y = 100;
cube.position.z = 0;

// scene.add(cube);

// RENDERER
webglRenderer = new THREE.WebGLRenderer();
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

function render() {
	camera.lookAt(scene.position);
	stats.begin();
	stats.end();
	webglRenderer.render(scene, camera);
}
