var SCREEN_WIDTH = window.innerWidth - 10;
var SCREEN_HEIGHT = window.innerHeight - 10;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time = 0.0;
var camera, scene, light, webglRenderer, container, ground;
var gvs = require('../shaders/ground.vert'), gfs = require('../shaders/ground.frag');

init();
render();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 20;
    camera.lookAt({
        x: 0,
        y: 0,
        z: 0
    });


    scene = new THREE.Scene();

    light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(0.0, 0.0, 400.0);
    light.position.set(100.0, -200.0, 100.0);

    scene.add(light);
    scene.add( new THREE.DirectionalLightHelper(light, 100.0) );

    var basicMaterial = new THREE.MeshPhongMaterial({
        color: 0x6C6C6C
    });

    var uniforms =  {
		uTime: {type: "f", value: 0.0},
		uLight: {type: "v3", value: light.position },
		uCamera: {type: "v3", value: camera.position }
	};

    var groundMaterial = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: gvs(),
		fragmentShader: gfs(),
		wireframe: true
    });

    var material = new THREE.MeshBasicMaterial( {
        color: 0xff0000,
        wireframe: true,
    });

    // ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 200, 10, 20), basicMaterial);
    groundGeometry = threeData(8);
    var groundMesh = new THREE.Mesh( groundGeometry, material );
    scene.add(groundMesh);

    var material = new THREE.MeshBasicMaterial( {
        color: 0xffff00,
        wireframe: false,
        shading: THREE.FlatShading,
    });
    var groundMesh2 = new THREE.Mesh( groundGeometry, material );
    groundMesh2.translateY(-0.1);
    scene.add(groundMesh2);

    var geometry = new THREE.BoxGeometry( 5, 10, 2 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );

    webglRenderer = new THREE.WebGLRenderer( { antialias: true} );
    webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    webglRenderer.setClearColor( 0xeeeeee );
    webglRenderer.domElement.style.position = "relative";

    container.appendChild(webglRenderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

    controls = new THREE.OrbitControls( camera );
	// controls.addEventListener( 'change', render );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function render() {
    time += 0.01;
    controls.update();
    requestAnimationFrame( render );
    webglRenderer.render( scene, camera );
}
