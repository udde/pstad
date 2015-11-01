function scene(){
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
    scene.add( new THREE.DirectionalLightHelper(light, 100.0) );

}
