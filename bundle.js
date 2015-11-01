(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	camera.position.z = 3500;
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

	plane = new THREE.Mesh(new THREE.PlaneGeometry(2800, 2600, 2800/50, 2600/50), groundMaterial);

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

	scene.add(water);

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
	water.material.uniforms.uTime.value += 1.0 / 100.0;
	webglRenderer.render(scene, camera);
}

},{"./shaders/groundFragmentShader.glsl":2,"./shaders/groundVertexShader.glsl":3,"./shaders/waterFragmentShader.glsl":4,"./shaders/waterVertexShader.glsl":5}],2:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D/3D/4D simplex \n" +
"//               noise functions. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : ijm \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"// \n" +
" \n" +
"vec3 mod289(vec3 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"    return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"    return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
"vec2 mod289(vec2 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
"vec3 permute(vec3 x) { \n" +
"    return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
"float testa(){ \n" +
" \n" +
"    return 1.0; \n" +
"} \n" +
"float snoise(vec3 v) \n" +
"{ \n" +
"    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ; \n" +
"    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); \n" +
" \n" +
"    // First corner \n" +
"    vec3 i  = floor(v + dot(v, C.yyy) ); \n" +
"    vec3 x0 =   v - i + dot(i, C.xxx) ; \n" +
" \n" +
"    // Other corners \n" +
"    vec3 g = step(x0.yzx, x0.xyz); \n" +
"    vec3 l = 1.0 - g; \n" +
"    vec3 i1 = min( g.xyz, l.zxy ); \n" +
"    vec3 i2 = max( g.xyz, l.zxy ); \n" +
" \n" +
"    //   x0 = x0 - 0.0 + 0.0 * C.xxx; \n" +
"    //   x1 = x0 - i1  + 1.0 * C.xxx; \n" +
"    //   x2 = x0 - i2  + 2.0 * C.xxx; \n" +
"    //   x3 = x0 - 1.0 + 3.0 * C.xxx; \n" +
"    vec3 x1 = x0 - i1 + C.xxx; \n" +
"    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y \n" +
"    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y \n" +
" \n" +
"    // Permutations \n" +
"    i = mod289(i); \n" +
"    vec4 p = permute( permute( permute( \n" +
"        i.z + vec4(0.0, i1.z, i2.z, 1.0 )) \n" +
"        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n" +
"        + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
" \n" +
"        // Gradients: 7x7 points over a square, mapped onto an octahedron. \n" +
"        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294) \n" +
"        float n_ = 0.142857142857; // 1.0/7.0 \n" +
"        vec3  ns = n_ * D.wyz - D.xzx; \n" +
" \n" +
"        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7) \n" +
" \n" +
"        vec4 x_ = floor(j * ns.z); \n" +
"        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N) \n" +
" \n" +
"        vec4 x = x_ *ns.x + ns.yyyy; \n" +
"        vec4 y = y_ *ns.x + ns.yyyy; \n" +
"        vec4 h = 1.0 - abs(x) - abs(y); \n" +
" \n" +
"        vec4 b0 = vec4( x.xy, y.xy ); \n" +
"        vec4 b1 = vec4( x.zw, y.zw ); \n" +
" \n" +
"        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0; \n" +
"        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0; \n" +
"        vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"        vec4 s1 = floor(b1)*2.0 + 1.0; \n" +
"        vec4 sh = -step(h, vec4(0.0)); \n" +
" \n" +
"        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; \n" +
"        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; \n" +
" \n" +
"        vec3 p0 = vec3(a0.xy,h.x); \n" +
"        vec3 p1 = vec3(a0.zw,h.y); \n" +
"        vec3 p2 = vec3(a1.xy,h.z); \n" +
"        vec3 p3 = vec3(a1.zw,h.w); \n" +
" \n" +
"        //Normalise gradients \n" +
"        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"        p0 *= norm.x; \n" +
"        p1 *= norm.y; \n" +
"        p2 *= norm.z; \n" +
"        p3 *= norm.w; \n" +
" \n" +
"        // Mix final noise value \n" +
"        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); \n" +
"        m = m * m; \n" +
"        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n" +
"        dot(p2,x2), dot(p3,x3) ) ); \n" +
"    } \n" +
"    float snoise(vec2 v) \n" +
"    { \n" +
"        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0 \n" +
"        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0) \n" +
"        -0.577350269189626,  // -1.0 + 2.0 * C.x \n" +
"        0.024390243902439); // 1.0 / 41.0 \n" +
"        // First corner \n" +
"        vec2 i  = floor(v + dot(v, C.yy) ); \n" +
"        vec2 x0 = v -   i + dot(i, C.xx); \n" +
" \n" +
"        // Other corners \n" +
"        vec2 i1; \n" +
"        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0 \n" +
"        //i1.y = 1.0 - i1.x; \n" +
"        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \n" +
"        // x0 = x0 - 0.0 + 0.0 * C.xx ; \n" +
"        // x1 = x0 - i1 + 1.0 * C.xx ; \n" +
"        // x2 = x0 - 1.0 + 2.0 * C.xx ; \n" +
"        vec4 x12 = x0.xyxy + C.xxzz; \n" +
"        x12.xy -= i1; \n" +
" \n" +
"        // Permutations \n" +
"        i = mod289(i); // Avoid truncation effects in permutation \n" +
"        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) \n" +
"        + i.x + vec3(0.0, i1.x, 1.0 )); \n" +
" \n" +
"        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); \n" +
"        m = m*m ; \n" +
"        m = m*m ; \n" +
" \n" +
"        // Gradients: 41 points uniformly over a line, mapped onto a diamond. \n" +
"        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287) \n" +
" \n" +
"        vec3 x = 2.0 * fract(p * C.www) - 1.0; \n" +
"        vec3 h = abs(x) - 0.5; \n" +
"        vec3 ox = floor(x + 0.5); \n" +
"        vec3 a0 = x - ox; \n" +
" \n" +
"        // Normalise gradients implicitly by scaling m \n" +
"        // Approximation of: m *= inversesqrt( a0*a0 + h*h ); \n" +
"        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); \n" +
" \n" +
"        // Compute final noise value at P \n" +
"        vec3 g; \n" +
"        g.x  = a0.x  * x0.x  + h.x  * x0.y; \n" +
"        g.yz = a0.yz * x12.xz + h.yz * x12.yw; \n" +
"        return 130.0 * dot(m, g); \n" +
"    } \n" +
" \n" +
"    /* --------------- */ \n" +
"    /* --------------- */ \n" +
"    /* Fragment SHADER */ \n" +
"    /* --------------- */ \n" +
"    /* --------------- */ \n" +
"    #extension GL_OES_standard_derivatives : enable \n" +
" \n" +
"    uniform vec3 uLight; \n" +
"    uniform vec3 uCamera; \n" +
"    varying vec3 vPos; \n" +
"    varying vec3 vNormal; \n" +
"    varying vec2 vUv ; \n" +
"    varying float vHeight; \n" +
"    varying float vSnow; \n" +
" \n" +
"    varying vec3 vColor; \n" +
" \n" +
"    varying vec3 vViewPosition; \n" +
" \n" +
"    void main() { \n" +
"        vec3 red = vec3(0.8,0.1,0.1); \n" +
"        vec3 blue = vec3(0.2, 0.6, 0.9); \n" +
"        vec3 green = vec3(0.1, 0.9, 0.1); \n" +
"        vec3 white = vec3(0.91,0.95,0.95); \n" +
"        vec3 brown = vec3(252,198,120)/255.0; \n" +
"        vec3 dark = vec3(93.0,69.0,47.0)/255.0; \n" +
" \n" +
"        // brown += snoise(0.4*vec2(vPos.x,0.2*vPos.y)) * dark; \n" +
" \n" +
"        vec3 c = red; \n" +
"        c += sin(100.0*vUv.x) * blue; \n" +
"        c += sin(100.0*vUv.y) * green; \n" +
" \n" +
"        c = green * vUv.x * vUv.y + 0.3; \n" +
"        // c *= vHeight; \n" +
" \n" +
"        c = mix(green, brown, 0.1); \n" +
"        // c = green; \n" +
"        float fd = dot(uLight - vPos, uCamera - vPos); \n" +
"        fd = clamp(fd,0.0, 1.0); \n" +
"        fd += 0.2; \n" +
" \n" +
"        // vec3 light = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 1.0); \n" +
"        vec3 n = vec3(0.0, 1.0, 0.0); \n" +
"        // vec3 l = vec3(0.0, 0.5, 1.0); \n" +
"        n = normalize(vNormal); \n" +
"        // vec3 l = normalize(vec3(0.0,3.0,10.0)); \n" +
"        vec3 l = normalize(uLight); \n" +
" \n" +
"        c = vHeight > -0.3 ? green : brown; \n" +
"        c = vHeight < 0.5 ? c : dark; \n" +
"        c = vSnow < 2.0 ? c : white; \n" +
"        vec3 ambient = 0.2 * c; \n" +
" \n" +
"        //polygon flat normal \n" +
"        vec3 fdx = normalize(dFdx( uCamera - vPos )); \n" +
"        vec3 fdy = normalize(dFdy( uCamera - vPos )); \n" +
"        vec3 nn = normalize( cross( fdx, fdy ) ); \n" +
" \n" +
"        float kd = 0.7 * clamp(dot(nn, l), 0.0, 1.0); \n" +
"        float kd2 = 0.0 * clamp(dot(n, l), 0.0, 1.0); \n" +
"        vec3 diffuse =  (kd + kd2) * c; \n" +
" \n" +
"        // blue = blue + 0.125*snoise(100.0*vec2(0.1*vUv.x, vUv.y)); \n" +
" \n" +
" \n" +
"        // r = 2n(n*l) - l \n" +
"        vec3 r = normalize(2.0*nn*(dot(nn,l)) - l); \n" +
"        vec3 v = normalize(uCamera - vPos); \n" +
"        float ks = 0.1 * pow(dot(r,v),8.0); \n" +
"        //ks * (r*v)^a \n" +
"        vec3 spec = ks * (vec3(1.0,1.0,1.0) + c); \n" +
"        spec = vHeight < 0.5 ? spec * 0.1 : spec; \n" +
"        spec = vSnow < 2.0 ? spec : 2.0 * spec; \n" +
"        // c = ambient + diffuse;// + spec; \n" +
"        c = ambient + diffuse + spec; \n" +
"        gl_FragColor = vec4(c, 1.0); \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],3:[function(require,module,exports){
module.exports = function parse(params){
      var template = "vec3 mod289(vec3 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"    return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"    return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
"vec2 mod289(vec2 x) { \n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
"vec3 permute(vec3 x) { \n" +
"    return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
"float testa(){ \n" +
" \n" +
"    return 1.0; \n" +
"} \n" +
"float snoise(vec3 v) \n" +
"{ \n" +
"    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ; \n" +
"    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); \n" +
" \n" +
"    // First corner \n" +
"    vec3 i  = floor(v + dot(v, C.yyy) ); \n" +
"    vec3 x0 =   v - i + dot(i, C.xxx) ; \n" +
" \n" +
"    // Other corners \n" +
"    vec3 g = step(x0.yzx, x0.xyz); \n" +
"    vec3 l = 1.0 - g; \n" +
"    vec3 i1 = min( g.xyz, l.zxy ); \n" +
"    vec3 i2 = max( g.xyz, l.zxy ); \n" +
" \n" +
"    //   x0 = x0 - 0.0 + 0.0 * C.xxx; \n" +
"    //   x1 = x0 - i1  + 1.0 * C.xxx; \n" +
"    //   x2 = x0 - i2  + 2.0 * C.xxx; \n" +
"    //   x3 = x0 - 1.0 + 3.0 * C.xxx; \n" +
"    vec3 x1 = x0 - i1 + C.xxx; \n" +
"    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y \n" +
"    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y \n" +
" \n" +
"    // Permutations \n" +
"    i = mod289(i); \n" +
"    vec4 p = permute( permute( permute( \n" +
"        i.z + vec4(0.0, i1.z, i2.z, 1.0 )) \n" +
"        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n" +
"        + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
" \n" +
"        // Gradients: 7x7 points over a square, mapped onto an octahedron. \n" +
"        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294) \n" +
"        float n_ = 0.142857142857; // 1.0/7.0 \n" +
"        vec3  ns = n_ * D.wyz - D.xzx; \n" +
" \n" +
"        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7) \n" +
" \n" +
"        vec4 x_ = floor(j * ns.z); \n" +
"        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N) \n" +
" \n" +
"        vec4 x = x_ *ns.x + ns.yyyy; \n" +
"        vec4 y = y_ *ns.x + ns.yyyy; \n" +
"        vec4 h = 1.0 - abs(x) - abs(y); \n" +
" \n" +
"        vec4 b0 = vec4( x.xy, y.xy ); \n" +
"        vec4 b1 = vec4( x.zw, y.zw ); \n" +
" \n" +
"        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0; \n" +
"        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0; \n" +
"        vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"        vec4 s1 = floor(b1)*2.0 + 1.0; \n" +
"        vec4 sh = -step(h, vec4(0.0)); \n" +
" \n" +
"        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; \n" +
"        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; \n" +
" \n" +
"        vec3 p0 = vec3(a0.xy,h.x); \n" +
"        vec3 p1 = vec3(a0.zw,h.y); \n" +
"        vec3 p2 = vec3(a1.xy,h.z); \n" +
"        vec3 p3 = vec3(a1.zw,h.w); \n" +
" \n" +
"        //Normalise gradients \n" +
"        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"        p0 *= norm.x; \n" +
"        p1 *= norm.y; \n" +
"        p2 *= norm.z; \n" +
"        p3 *= norm.w; \n" +
" \n" +
"        // Mix final noise value \n" +
"        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); \n" +
"        m = m * m; \n" +
"        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n" +
"        dot(p2,x2), dot(p3,x3) ) ); \n" +
"    } \n" +
"    float snoise(vec2 v) \n" +
"    { \n" +
"        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0 \n" +
"        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0) \n" +
"        -0.577350269189626,  // -1.0 + 2.0 * C.x \n" +
"        0.024390243902439); // 1.0 / 41.0 \n" +
"        // First corner \n" +
"        vec2 i  = floor(v + dot(v, C.yy) ); \n" +
"        vec2 x0 = v -   i + dot(i, C.xx); \n" +
" \n" +
"        // Other corners \n" +
"        vec2 i1; \n" +
"        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0 \n" +
"        //i1.y = 1.0 - i1.x; \n" +
"        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \n" +
"        // x0 = x0 - 0.0 + 0.0 * C.xx ; \n" +
"        // x1 = x0 - i1 + 1.0 * C.xx ; \n" +
"        // x2 = x0 - 1.0 + 2.0 * C.xx ; \n" +
"        vec4 x12 = x0.xyxy + C.xxzz; \n" +
"        x12.xy -= i1; \n" +
" \n" +
"        // Permutations \n" +
"        i = mod289(i); // Avoid truncation effects in permutation \n" +
"        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) \n" +
"        + i.x + vec3(0.0, i1.x, 1.0 )); \n" +
" \n" +
"        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); \n" +
"        m = m*m ; \n" +
"        m = m*m ; \n" +
" \n" +
"        // Gradients: 41 points uniformly over a line, mapped onto a diamond. \n" +
"        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287) \n" +
" \n" +
"        vec3 x = 2.0 * fract(p * C.www) - 1.0; \n" +
"        vec3 h = abs(x) - 0.5; \n" +
"        vec3 ox = floor(x + 0.5); \n" +
"        vec3 a0 = x - ox; \n" +
" \n" +
"        // Normalise gradients implicitly by scaling m \n" +
"        // Approximation of: m *= inversesqrt( a0*a0 + h*h ); \n" +
"        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); \n" +
" \n" +
"        // Compute final noise value at P \n" +
"        vec3 g; \n" +
"        g.x  = a0.x  * x0.x  + h.x  * x0.y; \n" +
"        g.yz = a0.yz * x12.xz + h.yz * x12.yw; \n" +
"        return 130.0 * dot(m, g); \n" +
"    } \n" +
" \n" +
" \n" +
"    /* ------------- */ \n" +
"    /* ------------- */ \n" +
"    /* VERTEX SHADER */ \n" +
"    /* ------------- */ \n" +
"    /* ------------- */ \n" +
" \n" +
"    float setHeight(vec2 p, inout float vh, inout float snow){ \n" +
"        float height = 1.0 * snoise(0.002*vec2(0.4*p.x, 0.9*p.y)); \n" +
"        height = height > 0.5 ? height* (1.0 + 2.0 * height* height * height) : height; \n" +
"        height += 0.5 * snoise(0.004*p); \n" +
"        height += 0.25 * snoise(0.008*p); \n" +
" \n" +
"        float waterNoise = 0.25 * snoise(2.0*p); \n" +
"        waterNoise += 0.125 * snoise(4.0*p); \n" +
"        waterNoise += 0.0625 * snoise(8.0*p); \n" +
"        waterNoise *= 1.0; \n" +
"        waterNoise = min(waterNoise, 0.0); \n" +
" \n" +
"        float mountainNoise = 1.0 ; //* snoise(0.002*vec2(0.4*p.x, 0.9*p.y)); \n" +
" \n" +
"        // mountainNoise += 0.5 * snoise(2.0*p); \n" +
"        // mountainNoise += 0.25 * snoise(4.0*p); \n" +
"        // height = snoise(vec2(0.9*uv.x,1.4*uv.y)); \n" +
"        // height += 0.5 * snoise(2.0*uv); \n" +
"        // height += 0.25 * snoise(4.0*uv); \n" +
"        mountainNoise = height; \n" +
"        height = max(-0.3,height); \n" +
"        height = min(height, 0.5); \n" +
"        vh = height; \n" +
"        height = height < 0.5 ? height  :  mountainNoise;// + 0.0 + mountainNoise; \n" +
"        height = height > -0.3 ? height : -1.0 + waterNoise; \n" +
"        mountainNoise = height; \n" +
"        height = min(height, 2.0); \n" +
"        snow = height; \n" +
"        height = height < 2.0 ? height  : mountainNoise; \n" +
"        height *= 100.0; \n" +
"        return height; \n" +
"    } \n" +
"    vec3 newNormal(vec3 p, float step){ \n" +
"        //add normals of 6 sourounding polygons \n" +
"        float tmp = 0.0; \n" +
"        vec3 v0 = vec3(p.x + step, p.y, p.z ); \n" +
"        v0.z += setHeight(v0.xy, tmp, tmp); \n" +
"        vec3 v1 = vec3(p.x + step, p.y + step, p.z ); \n" +
"        v1.z += setHeight(v1.xy, tmp, tmp); \n" +
"        vec3 v2 = vec3(p.x, p.y + step, p.z ); \n" +
"        v2.z += setHeight(v2.xy, tmp, tmp); \n" +
"        vec3 v3 = vec3(p.x - step, p.y, p.z ); \n" +
"        v3.z += setHeight(v3.xy, tmp, tmp); \n" +
"        vec3 v4 = vec3(p.x - step, p.y - step, p.z ); \n" +
"        v4.z += setHeight(v4.xy, tmp, tmp); \n" +
"        vec3 v5 = vec3(p.x , p.y - step, p.z ); \n" +
"        v5.z += setHeight(v5.xy, tmp, tmp); \n" +
" \n" +
"        vec3 n0 = cross(v0 - p, v1 - p); \n" +
"        vec3 n1 = cross(v1 - p, v2 - p); \n" +
"        vec3 n2 = cross(v2 - p, v3 - p); \n" +
"        vec3 n3 = cross(v3 - p, v4 - p); \n" +
"        vec3 n4 = cross(v4 - p, v5 - p); \n" +
"        vec3 n5 = cross(v5 - p, v0 - p); \n" +
" \n" +
"        return normalize(n0+n1+n2+n3+n4+n5); \n" +
"    } \n" +
" \n" +
"    uniform vec3 uLight; \n" +
"    uniform vec3 uCamera; \n" +
"    uniform float uPlaneSegmentsSize; \n" +
"    varying vec3 vPos; \n" +
"    varying vec3 vNormal ; \n" +
"    varying vec2 vUv ; \n" +
"    varying float vHeight; \n" +
"    varying float vSnow; \n" +
" \n" +
"    varying vec3 vColor; \n" +
" \n" +
"    varying vec3 vViewPosition; \n" +
" \n" +
"    void main() { \n" +
"        vec2 p = position.xy;//vec3(position[0], position[1], position[2]); \n" +
"        vPos = position; \n" +
"        vUv = uv; \n" +
"        vColor = vec3(1.0, 0.5, 0.4); \n" +
"        float step = uPlaneSegmentsSize; \n" +
"        // vViewPosition = - mvPosition.xyz; \n" +
" \n" +
" \n" +
" \n" +
"        float height = setHeight(p, vHeight, vSnow); \n" +
"        vNormal  = newNormal(position, step); \n" +
" \n" +
"        // vHeight = height; //send \n" +
" \n" +
"        // height = height > -0.5 ? height : -1.2;// + waterNoise; \n" +
" \n" +
"        // height += 0.5; \n" +
" \n" +
" \n" +
"        vec3 newPosition = position; \n" +
"        newPosition.z += height + 50.0; \n" +
" \n" +
"        vPos = newPosition; \n" +
"        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); \n" +
"    } \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],4:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D/3D/4D simplex \n" +
"//               noise functions. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : ijm \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"// \n" +
" \n" +
"vec3 mod289(vec3 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"     return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
" \n" +
"vec2 mod289(vec2 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec3 permute(vec3 x) { \n" +
"  return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"float snoise(vec2 v) \n" +
"  { \n" +
"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0 \n" +
"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0) \n" +
"                     -0.577350269189626,  // -1.0 + 2.0 * C.x \n" +
"                      0.024390243902439); // 1.0 / 41.0 \n" +
"// First corner \n" +
"  vec2 i  = floor(v + dot(v, C.yy) ); \n" +
"  vec2 x0 = v -   i + dot(i, C.xx); \n" +
" \n" +
"// Other corners \n" +
"  vec2 i1; \n" +
"  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0 \n" +
"  //i1.y = 1.0 - i1.x; \n" +
"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \n" +
"  // x0 = x0 - 0.0 + 0.0 * C.xx ; \n" +
"  // x1 = x0 - i1 + 1.0 * C.xx ; \n" +
"  // x2 = x0 - 1.0 + 2.0 * C.xx ; \n" +
"  vec4 x12 = x0.xyxy + C.xxzz; \n" +
"  x12.xy -= i1; \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i); // Avoid truncation effects in permutation \n" +
"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) \n" +
"        + i.x + vec3(0.0, i1.x, 1.0 )); \n" +
" \n" +
"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); \n" +
"  m = m*m ; \n" +
"  m = m*m ; \n" +
" \n" +
"// Gradients: 41 points uniformly over a line, mapped onto a diamond. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287) \n" +
" \n" +
"  vec3 x = 2.0 * fract(p * C.www) - 1.0; \n" +
"  vec3 h = abs(x) - 0.5; \n" +
"  vec3 ox = floor(x + 0.5); \n" +
"  vec3 a0 = x - ox; \n" +
" \n" +
"// Normalise gradients implicitly by scaling m \n" +
"// Approximation of: m *= inversesqrt( a0*a0 + h*h ); \n" +
"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); \n" +
" \n" +
"// Compute final noise value at P \n" +
"  vec3 g; \n" +
"  g.x  = a0.x  * x0.x  + h.x  * x0.y; \n" +
"  g.yz = a0.yz * x12.xz + h.yz * x12.yw; \n" +
"  return 130.0 * dot(m, g); \n" +
"} \n" +
"float snoise(vec3 v) \n" +
"  { \n" +
"  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ; \n" +
"  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); \n" +
" \n" +
"// First corner \n" +
"  vec3 i  = floor(v + dot(v, C.yyy) ); \n" +
"  vec3 x0 =   v - i + dot(i, C.xxx) ; \n" +
" \n" +
"// Other corners \n" +
"  vec3 g = step(x0.yzx, x0.xyz); \n" +
"  vec3 l = 1.0 - g; \n" +
"  vec3 i1 = min( g.xyz, l.zxy ); \n" +
"  vec3 i2 = max( g.xyz, l.zxy ); \n" +
" \n" +
"  //   x0 = x0 - 0.0 + 0.0 * C.xxx; \n" +
"  //   x1 = x0 - i1  + 1.0 * C.xxx; \n" +
"  //   x2 = x0 - i2  + 2.0 * C.xxx; \n" +
"  //   x3 = x0 - 1.0 + 3.0 * C.xxx; \n" +
"  vec3 x1 = x0 - i1 + C.xxx; \n" +
"  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y \n" +
"  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i); \n" +
"  vec4 p = permute( permute( permute( \n" +
"             i.z + vec4(0.0, i1.z, i2.z, 1.0 )) \n" +
"           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n" +
"           + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
" \n" +
"// Gradients: 7x7 points over a square, mapped onto an octahedron. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294) \n" +
"  float n_ = 0.142857142857; // 1.0/7.0 \n" +
"  vec3  ns = n_ * D.wyz - D.xzx; \n" +
" \n" +
"  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7) \n" +
" \n" +
"  vec4 x_ = floor(j * ns.z); \n" +
"  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N) \n" +
" \n" +
"  vec4 x = x_ *ns.x + ns.yyyy; \n" +
"  vec4 y = y_ *ns.x + ns.yyyy; \n" +
"  vec4 h = 1.0 - abs(x) - abs(y); \n" +
" \n" +
"  vec4 b0 = vec4( x.xy, y.xy ); \n" +
"  vec4 b1 = vec4( x.zw, y.zw ); \n" +
" \n" +
"  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0; \n" +
"  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0; \n" +
"  vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"  vec4 s1 = floor(b1)*2.0 + 1.0; \n" +
"  vec4 sh = -step(h, vec4(0.0)); \n" +
" \n" +
"  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; \n" +
"  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; \n" +
" \n" +
"  vec3 p0 = vec3(a0.xy,h.x); \n" +
"  vec3 p1 = vec3(a0.zw,h.y); \n" +
"  vec3 p2 = vec3(a1.xy,h.z); \n" +
"  vec3 p3 = vec3(a1.zw,h.w); \n" +
" \n" +
"//Normalise gradients \n" +
"  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"  p0 *= norm.x; \n" +
"  p1 *= norm.y; \n" +
"  p2 *= norm.z; \n" +
"  p3 *= norm.w; \n" +
" \n" +
"// Mix final noise value \n" +
"  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); \n" +
"  m = m * m; \n" +
"  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n" +
"                                dot(p2,x2), dot(p3,x3) ) ); \n" +
"  } \n" +
" \n" +
" \n" +
" \n" +
"//-----------------------------------// \n" +
"uniform float uTime; \n" +
"uniform vec3 uCamera; \n" +
"uniform vec3 uLight; \n" +
"varying vec2 vUv; \n" +
"varying float h; \n" +
"void main() { \n" +
"    vec2 position = vUv; \n" +
"    float t = uTime; \n" +
"    float red = abs(sin(position.x * position.y + t / 5.0)); \n" +
"    float green = abs(sin(position.x * position.y + t / 4.0)); \n" +
"    float blue = abs(sin(position.x * position.y + t / 3.0)); \n" +
" \n" +
"    float 	r = 100.0	/255.0; \n" +
"    float 	g = 200.0  	/255.0; \n" +
"    float	  b = 250.0   	/255.0; \n" +
" \n" +
"    //g = sin(500.*vUv.x); \n" +
"    //b = 1.5*sin(500.*vUv.y); \n" +
"    float n = snoise(position); \n" +
"    float ni = 1.0 - n; \n" +
"    vec3 color = 0.8*vec3(r, g, b) + vec3(0.1, 0.2, 0.4) * clamp(2.2*snoise(vec3(n*90.0*vUv.x,ni*100.0*vUv.y,0.8*t)),0.6,1.0); \n" +
" \n" +
"    float	a = 90.0   	/100.0; \n" +
" \n" +
" \n" +
" \n" +
"    gl_FragColor = vec4(color, 0.7); \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],5:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D/3D/4D simplex \n" +
"//               noise functions. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : ijm \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"// \n" +
" \n" +
"vec3 mod289(vec3 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"     return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
" \n" +
"vec2 mod289(vec2 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec3 permute(vec3 x) { \n" +
"  return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"float snoise(vec2 v) \n" +
"  { \n" +
"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0 \n" +
"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0) \n" +
"                     -0.577350269189626,  // -1.0 + 2.0 * C.x \n" +
"                      0.024390243902439); // 1.0 / 41.0 \n" +
"// First corner \n" +
"  vec2 i  = floor(v + dot(v, C.yy) ); \n" +
"  vec2 x0 = v -   i + dot(i, C.xx); \n" +
" \n" +
"// Other corners \n" +
"  vec2 i1; \n" +
"  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0 \n" +
"  //i1.y = 1.0 - i1.x; \n" +
"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \n" +
"  // x0 = x0 - 0.0 + 0.0 * C.xx ; \n" +
"  // x1 = x0 - i1 + 1.0 * C.xx ; \n" +
"  // x2 = x0 - 1.0 + 2.0 * C.xx ; \n" +
"  vec4 x12 = x0.xyxy + C.xxzz; \n" +
"  x12.xy -= i1; \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i); // Avoid truncation effects in permutation \n" +
"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) \n" +
"        + i.x + vec3(0.0, i1.x, 1.0 )); \n" +
" \n" +
"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); \n" +
"  m = m*m ; \n" +
"  m = m*m ; \n" +
" \n" +
"// Gradients: 41 points uniformly over a line, mapped onto a diamond. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287) \n" +
" \n" +
"  vec3 x = 2.0 * fract(p * C.www) - 1.0; \n" +
"  vec3 h = abs(x) - 0.5; \n" +
"  vec3 ox = floor(x + 0.5); \n" +
"  vec3 a0 = x - ox; \n" +
" \n" +
"// Normalise gradients implicitly by scaling m \n" +
"// Approximation of: m *= inversesqrt( a0*a0 + h*h ); \n" +
"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); \n" +
" \n" +
"// Compute final noise value at P \n" +
"  vec3 g; \n" +
"  g.x  = a0.x  * x0.x  + h.x  * x0.y; \n" +
"  g.yz = a0.yz * x12.xz + h.yz * x12.yw; \n" +
"  return 130.0 * dot(m, g); \n" +
"} \n" +
"float snoise(vec3 v) \n" +
"  { \n" +
"  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ; \n" +
"  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); \n" +
" \n" +
"// First corner \n" +
"  vec3 i  = floor(v + dot(v, C.yyy) ); \n" +
"  vec3 x0 =   v - i + dot(i, C.xxx) ; \n" +
" \n" +
"// Other corners \n" +
"  vec3 g = step(x0.yzx, x0.xyz); \n" +
"  vec3 l = 1.0 - g; \n" +
"  vec3 i1 = min( g.xyz, l.zxy ); \n" +
"  vec3 i2 = max( g.xyz, l.zxy ); \n" +
" \n" +
"  //   x0 = x0 - 0.0 + 0.0 * C.xxx; \n" +
"  //   x1 = x0 - i1  + 1.0 * C.xxx; \n" +
"  //   x2 = x0 - i2  + 2.0 * C.xxx; \n" +
"  //   x3 = x0 - 1.0 + 3.0 * C.xxx; \n" +
"  vec3 x1 = x0 - i1 + C.xxx; \n" +
"  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y \n" +
"  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i); \n" +
"  vec4 p = permute( permute( permute( \n" +
"             i.z + vec4(0.0, i1.z, i2.z, 1.0 )) \n" +
"           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n" +
"           + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
" \n" +
"// Gradients: 7x7 points over a square, mapped onto an octahedron. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294) \n" +
"  float n_ = 0.142857142857; // 1.0/7.0 \n" +
"  vec3  ns = n_ * D.wyz - D.xzx; \n" +
" \n" +
"  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7) \n" +
" \n" +
"  vec4 x_ = floor(j * ns.z); \n" +
"  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N) \n" +
" \n" +
"  vec4 x = x_ *ns.x + ns.yyyy; \n" +
"  vec4 y = y_ *ns.x + ns.yyyy; \n" +
"  vec4 h = 1.0 - abs(x) - abs(y); \n" +
" \n" +
"  vec4 b0 = vec4( x.xy, y.xy ); \n" +
"  vec4 b1 = vec4( x.zw, y.zw ); \n" +
" \n" +
"  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0; \n" +
"  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0; \n" +
"  vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"  vec4 s1 = floor(b1)*2.0 + 1.0; \n" +
"  vec4 sh = -step(h, vec4(0.0)); \n" +
" \n" +
"  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; \n" +
"  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; \n" +
" \n" +
"  vec3 p0 = vec3(a0.xy,h.x); \n" +
"  vec3 p1 = vec3(a0.zw,h.y); \n" +
"  vec3 p2 = vec3(a1.xy,h.z); \n" +
"  vec3 p3 = vec3(a1.zw,h.w); \n" +
" \n" +
"//Normalise gradients \n" +
"  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"  p0 *= norm.x; \n" +
"  p1 *= norm.y; \n" +
"  p2 *= norm.z; \n" +
"  p3 *= norm.w; \n" +
" \n" +
"// Mix final noise value \n" +
"  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); \n" +
"  m = m * m; \n" +
"  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n" +
"                                dot(p2,x2), dot(p3,x3) ) ); \n" +
"  } \n" +
" \n" +
" \n" +
" \n" +
"//-----------------------------------// \n" +
" \n" +
"uniform float uTime; \n" +
"uniform vec3 uCamera; \n" +
"uniform vec3 uLight; \n" +
"varying vec2 vUv; \n" +
"varying float h; \n" +
"void main() { \n" +
"    vUv = uv; \n" +
"    vec2 P = vec2(position[0],position[1]); \n" +
"    float t = uTime; \n" +
"    float disp = 10.0*uv[1]; \n" +
"    vec3 newPosition = position + normal * 1.; \n" +
"    vec2 pos2 = position.xy; \n" +
" \n" +
" \n" +
"    float arg = 25.*uv.x + 5.0*t; \n" +
"    float amp = 2.5 * snoise(vec3(2.*uv.x,0.5*uv.y,1.0*t)); \n" +
"    h = amp * sin(arg); \n" +
"    float sinw = amp * sin(arg); \n" +
"    // sinw += abs(1.2*snoise(vec3(0.065*P.x,0.055*P.y, t))); \n" +
"     vec3 newPosition2 = position + normal * sinw; \n" +
" \n" +
"    //vec3 newPosition2 = position + normal * abs(snoise(100.*vec3(position.x,position.y,0.01*t))) * sin(arg); \n" +
" \n" +
"    // vec3 newPosition2 = vec3(position.x, position.y , position.z) + normal * 4. * snoise(vec3(2.*uv.x,0.5*uv.y,1.0*t)) * sin(25.*uv.x + 5.*t); /// (10.*t*uv.x); \n" +
" \n" +
"    //P*=40.; \n" +
" \n" +
"    float height = abs(1.4*snoise(vec3(0.095*P.x,0.095*P.y, 0.4*t))); \n" +
"	// height *= height*4*zcomp(P); \n" +
"	 height += 0.6 * abs(snoise(vec3(0.28*P.x,0.28*P.y, 0.4*t))); \n" +
"   // height += 0.3 * abs(snoise(vec3(0.14*P.x,0.14*P.y, t))); \n" +
"   // height += 1.2*sin(arg); \n" +
" \n" +
"	 // height += 0.125 * snoise(8.*P) -0.5; \n" +
"	 // height += 0.06125 * snoise(16.*P) -0.5; \n" +
"	//nollställ allt \"under vatten ytan\" \n" +
"	//height = max(height,0.0); \n" +
" \n" +
"	//vid skogskanten höjs ytan lite mer drastiskt \n" +
"	//height = height + smoothstep(0.23,0.236, height) * 0.013 ; \n" +
"    float tt = snoise(vec2(t, t)); \n" +
"    // height = snoise(position * 0.0001*tt); \n" +
"	vec3 newPosition3 = position + normal * 5.0 * height; \n" +
" \n" +
"    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition3, 1.0); \n" +
"} \n" +
" \n" +
" \n" +
" \n" +
" \n" +
"// // A simple SL displacement shader to render a planet-like sphere \n" +
"// displacement planet_displacement(output varying float oceanblend = 0.0;) { \n" +
"//   float elevation = noise(2*P)-0.5; \n" +
"//   elevation += 0.5*(noise(4*P)-0.5); \n" +
"//   elevation += 0.25*(noise(8*P)-0.5); \n" +
"//   elevation += 0.125*(noise(16*P)-0.5); \n" +
"//   elevation += 0.0625*(noise(32*P)-0.5); \n" +
"//   elevation = max(elevation, 0.0); // Clip negative values to zero \n" +
"//   oceanblend = 0.0; \n" +
"//   if (elevation == 0.0) { \n" +
"//     oceanblend = 1.0; \n" +
"//   } \n" +
"//   P = P + N * 0.2 * elevation; \n" +
"//   N = calculatenormal(P); \n" +
"// } \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}]},{},[1]);