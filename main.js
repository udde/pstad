var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var stats = new Stats();
stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;

renderer.shadowCameraNear = 3;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;

renderer.shadowMapBias = 0.0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;

document.body.appendChild( renderer.domElement );

controls = new THREE.OrbitControls( camera );
controls.addEventListener( 'change', render );

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 100 );
spotLight.castShadow = true;

scene.add(spotLight);

var geometry = new THREE.TorusKnotGeometry( 3 , 1, 100, 16 );
var material = new THREE.MeshPhongMaterial( { color: 0xbbbbbb, specular: 0xeeeeee, shininess: 2 } );
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
scene.add( cube );

var geometry2 = new THREE.PlaneGeometry( 25, 25, 32 );
var material2 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry2, material );
plane.position.set(0,0,-5);
plane.receiveShadow = true;
scene.add( plane );

camera.position.z = 20;
camera.position.x = 1;

function render() {
	stats.begin();

	stats.end();
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();
