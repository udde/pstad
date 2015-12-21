
var SCREEN_WIDTH = window.innerWidth - 10;
var SCREEN_HEIGHT = window.innerHeight - 10;

var camera, scene;
var canvasRenderer, webglRenderer;
var container, mesh, geometry, plane, water, water2;
var clock;
var composer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var stats = new Stats();

stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = SCREEN_WIDTH+'px';
// stats.domElement.style.top = '0px';
// document.getElementById("log").appendChild( stats.domElement);

var gvs = require('./groundVertexShader.glsl'), gfs = require('./groundFragmentShader.glsl');

init();
render();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.x = 0;
	camera.position.y = -2300;
	camera.position.z = 900;
	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});

	scene = new THREE.Scene();

	// LIGHTS
	var light;

	light = new THREE.DirectionalLight(0xdfebff, 1.75);
	light.position.set(0.0, 0.0, 400.0);
	light.position.set(200.0, -200.0, 100.0);
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
	// scene.add( new THREE.DirectionalLightHelper(light, 100.0) );

	var groundMaterial = new THREE.MeshPhongMaterial({
		color: 0x6C6C6C
	});
	var uniforms =  {
		uTime: {type: "f", value: 0.2},
		uLight: {type: "v3", value: light.position },
		uCamera: {type: "v3", value: camera.position },
		uPlaneSegmentsSize: {type : "f", value: 50.0}
	};
	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: gvs(),
		fragmentShader: gfs(),
		// shading: THREE.FlatShading,
		// wireframe: true
	}
);
var waterMaterial = new THREE.ShaderMaterial( {
	uniforms: {
		// uLight: {type: "v3", value: light.position },
		// uCamera: {type: "v3", value: camera.position },
		// uPlaneSegmentsSize: {type : "f", value: 50.0}
	},
	vertexShader: document.getElementById( 'skyVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'skyFragmentShader' ).textContent,
	// shading: THREE.FlatShading,
	// wireframe: true
}
);
waterMaterial.transparent = true;

plane = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1600, 1800/50, 1600/50), shaderMaterial);
// debugger;
// plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;

scene.add(plane);

treeMaterial  = new THREE.ShaderMaterial( {
	uniforms: {
		uLight: {type: "v3", value: light.position },
		uCamera: {type: "v3", value: camera.position },
		// uPlaneSegmentsSize: {type : "f", value: 50.0}
	},
	vertexShader: document.getElementById( 'treeVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'treeFragmentShader' ).textContent,
	// shading: THREE.FlatShading,
	// wireframe: true
}
);
geometry = new THREE.BufferGeometry();
var vertexPositions = [
	[-1.0, -1.0,  1.0],
	[ 1.0, -1.0,  -1.0],
	[ 1.0,  1.0,  1.0],

	[ 1.0,  1.0,  1.0],
	[-1.0,  1.0,  1.0],
	[-1.0, -1.0,  1.0]
];
var vertices = new Float32Array( vertexPositions.length * 3 );
for ( var i = 0; i < vertexPositions.length; i++ )
{
	vertices[ i*3 + 0 ] = 100*vertexPositions[i][0];
	vertices[ i*3 + 1 ] = 100*vertexPositions[i][1];
	vertices[ i*3 + 2 ] = 100*vertexPositions[i][2];
}
geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
tree = new THREE.Mesh(new THREE.SphereGeometry(20, 10 , 10), treeMaterial);
tree.translateY(-100);
tree.translateZ(-10);
tree.rotateX(1.5);
// scene.add(tree);

tree2 = new THREE.Mesh(new THREE.CylinderGeometry( 6, 12, 50, 32 ), groundMaterial);
tree2.translateY(-100);
tree2.translateZ(-30);
tree2.rotateX(1.5);
// scene.add(tree2);


createTree = function(){
	var top =  new THREE.Mesh(new THREE.SphereGeometry(20, 10 , 10), treeMaterial);


	var bottom = new THREE.Mesh(new THREE.CylinderGeometry( 6, 12, 50, 32 ), groundMaterial);


	return {top: top, bottom: bottom};
};
placeTree = function(tree, position, scene){
	tree.top.translateX(position.x);
	tree.top.translateY(position.y);
	tree.top.translateZ(position.z);
	tree.bottom.translateX(position.x);
	tree.bottom.translateY(position.y);
	tree.bottom.translateZ(position.z - 20);
	tree.top.rotateX(1.5);
	tree.bottom.rotateX(1.5);

	scene.add(tree.top);
	scene.add(tree.bottom);
	console.log("added tree to scene.. at: " + position.x + " " + position.y+ " " + position.z);
};

// placeTree(createTree(), {x: 40, y: -150, z: 0 }, scene);

water = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 32, 24), waterMaterial);
water2 = new THREE.Mesh(new THREE.PlaneGeometry(800, 600, 32, 24),new THREE.MeshPhongMaterial( { color: 0x77bbee, shading: THREE.FlatShading } ));
water.translateZ(-10);
// scene.add(water);

// debugger;

var groundVertices = plane.geometry.vertices;
console.log(groundVertices);

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

// geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
material = new THREE.MeshBasicMaterial( { color: 0xff00aa } );
var mesh = new THREE.Mesh( geometry, material );

// scene.add(mesh);

var boxgeometry = new THREE.CubeGeometry(100, 100, 100);
var boxmaterial = new THREE.MeshLambertMaterial({
	color: 0x0aeedf
});
var cube = new THREE.Mesh(boxgeometry, boxmaterial);
cube.castShadow = true;
cube.position.x = 0;
cube.position.y = 100;
cube.position.z = 200;

// scene.add(cube);

var geometry = new THREE.BoxGeometry( 100, 100, 100 );
var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var cube = new THREE.Mesh( geometry, material );
cube.translateZ(300);
cube.translateY(-10);
cube.translateX(200);
scene2 = new THREE.Scene();
scene2.add(light);
// scene.add( cube );




// RENDERER
webglRenderer = new THREE.WebGLRenderer( { antialias: true} );
webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
webglRenderer.setClearColor( 0xeeeeee );
webglRenderer.domElement.style.position = "relative";
webglRenderer.shadowMap.enabled = true;
webglRenderer.shadowMapSoft = true;
webglRenderer.autoClear = false;

camera.lookAt(scene.position);

geometry = new THREE.SphereGeometry(3800, 60, 40);
var uniforms = {
	// texture: { type: 't', value: loadTexture('/path/to/my_image.jpg') }
};

material = new THREE.ShaderMaterial( {
	// uniforms:       uniforms,
	vertexShader:   document.getElementById('skyVertexShader').textContent,
	fragmentShader: document.getElementById('skyFragmentShader').textContent
});

skyBox = new THREE.Mesh(geometry, material);
skyBox.scale.set(-1, 1, 1);
skyBox.eulerOrder = 'XZY';
skyBox.renderDepth = 1000.0;
scene.add(skyBox);

var planeGeo = new THREE.PlaneBufferGeometry( 1800, 1600 );

// MIRROR planes
groundMirror = new THREE.Mirror( webglRenderer, camera, { clipBias: 0.003,
	textureWidth: SCREEN_WIDTH, textureHeight: SCREEN_HEIGHT, color: 0x777777 } );
	groundMirror.material.transparent = true;
	mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
	mirrorMesh.add( groundMirror );
	// mirrorMesh.rotateX( - Math.PI / 1 );
	scene.add( mirrorMesh );
	// scene.add(water);

	composer = new THREE.EffectComposer(webglRenderer);

	//en mask i vattnet för spegling
	sceneWater = new THREE.Scene();
	// water2.transparent = true;
	sceneWater.add(water2);

	var waterMask =  new THREE.MaskPass(sceneWater, camera);
	// waterMask.renderToScreen = false;
	// waterMask.clear = false;

	var clearMask = new THREE.ClearMaskPass();
	// clearMask.clear = false;

	var renderWorld = new THREE.RenderPass(scene, camera);
	// renderWorld.clear = false;

	var renderWorld2 = new THREE.RenderPass(scene, camera);
	renderWorld2.clear = false;

	var renderWater = new THREE.RenderPass(sceneWater, camera);
	renderWater.clear = false;

	var renderBox = new THREE.RenderPass(scene2, camera);
	renderBox.clear = false;

	var toScreen = new THREE.ShaderPass(THREE.CopyShader);
	toScreen.renderToScreen = true;

	var effectCopy2 = new THREE.ShaderPass(THREE.CopyShader);
	// effectCopy2.renderToScreen = true;

	var effectCopy3 = new THREE.ShaderPass(THREE.CopyShader);
	// effectCopy2.renderToScreen = true;
	// effectCopy2.clear = false;

	var effectMirror = new THREE.ShaderPass(THREE.MirrorShader);
	// effectMirror.renderToScreen = true;
	// effectMirror.clear = false;

	var dotPass = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.6 );
	// dotPass.renderToScreen = true;
	// dotPass.clear = false;

	composer.renderTarget1.stencilBuffer = true;
	composer.renderTarget2.stencilBuffer = true;

	var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
	fxaa.uniforms.resolution.value.set(1 / (SCREEN_WIDTH), 1 / (SCREEN_HEIGHT));


	composer.addPass(renderWorld);

	composer.addPass(fxaa);

	// composer.addPass(renderWater);
	// composer.addPass(renderBox);
	// composer.addPass(dotPass);
	// composer.addPass(waterMask);
	// Här måste världen in som textur eller något till mirrorshadern
	// den kan inte rita ut transparens utan ritar om hela pixlarna i masken
	// composer.addPass(dotPass);
	// composer.addPass(effectMirror);
	// composer.addPass(clearMask);
	// composer.addPass(renderBox);
	// composer.addPass(renderWorld2);
	composer.addPass(toScreen);

	// composer.render();
	clock = new THREE.Clock();
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
	// camera.lookAt(scene.position);
	stats.begin();
	var delta = clock.getDelta();
	stats.end();
	plane.material.uniforms.uTime.value += 1.0/100.0;
	mirrorMesh.material.uniforms.time.value += 1.0/100.0;
	groundMirror.render();
	// webglRenderer.render(scene, camera);
	composer.render();
}
