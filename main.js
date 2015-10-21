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
document.body.appendChild( renderer.domElement );

controls = new THREE.OrbitControls( camera );
controls.addEventListener( 'change', render );

var geometry = new THREE.TorusKnotGeometry( 3 , 1, 100, 16 );
var material = new THREE.MeshPhongMaterial( { ambient: 0x999999, color: 0xbbbbbb, specular: 0xeeeeee, shininess: 30 } );

var light = new THREE.DirectionalLight(0xeeeeee, 1, 100);
light.position.set(10,0,50);
scene.add(light);

var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 20;
camera.position.x = 1;

function render() {
	stats.begin();

	stats.end();
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();
