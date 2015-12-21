(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function parse(params){
      var template = "vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);}float snoise(vec3 v){const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);vec3 i  = floor(v + dot(v, C.yyy) );vec3 x0 =   v - i + dot(i, C.xxx) ;vec3 g = step(x0.yzx, x0.xyz);vec3 l = 1.0 - g;vec3 i1 = min( g.xyz, l.zxy );vec3 i2 = max( g.xyz, l.zxy );vec3 x1 = x0 - i1 + C.xxx;vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i);vec4 p = permute( permute( permute(i.z + vec4(0.0, i1.z, i2.z, 1.0 ))+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));float n_ = 0.142857142857; vec3  ns = n_ * D.wyz - D.xzx;vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z);vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy;vec4 y = y_ *ns.x + ns.yyyy;vec4 h = 1.0 - abs(x) - abs(y);vec4 b0 = vec4( x.xy, y.xy );vec4 b1 = vec4( x.zw, y.zw );vec4 s0 = floor(b0)*2.0 + 1.0;vec4 s1 = floor(b1)*2.0 + 1.0;vec4 sh = -step(h, vec4(0.0));vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;vec3 p0 = vec3(a0.xy,h.x);vec3 p1 = vec3(a0.zw,h.y);vec3 p2 = vec3(a1.xy,h.z);vec3 p3 = vec3(a1.zw,h.w);vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));p0 *= norm.x;p1 *= norm.y;p2 *= norm.z;p3 *= norm.w;vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);m = m * m;return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );} float snoise(vec2 v) {const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);vec2 i  = floor(v + dot(v, C.yy) );vec2 x0 = v -   i + dot(i, C.xx);vec2 i1;i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);vec4 x12 = x0.xyxy + C.xxzz;x12.xy -= i1;i = mod289(i);vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);m = m*m ;m = m*m ;vec3 x = 2.0 * fract(p * C.www) - 1.0;vec3 h = abs(x) - 0.5;vec3 ox = floor(x + 0.5);vec3 a0 = x - ox;m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );vec3 g;g.x  = a0.x  * x0.x  + h.x  * x0.y;g.yz = a0.yz * x12.xz + h.yz * x12.yw;return 130.0 * dot(m, g);} \n" +
" \n" +
"/* --------------- */ \n" +
"/* --------------- */ \n" +
"/* Fragment SHADER */ \n" +
"/* --------------- */ \n" +
"/* --------------- */ \n" +
"#extension GL_OES_standard_derivatives : enable \n" +
" \n" +
"uniform float uTime; \n" +
"uniform vec3 uLight; \n" +
"uniform vec3 uCamera; \n" +
"varying vec3 vPos; \n" +
"varying vec3 vNormal; \n" +
"varying vec2 vUv ; \n" +
"varying float vHeight; \n" +
"varying float vSnow; \n" +
" \n" +
"varying vec3 vColor; \n" +
" \n" +
"varying vec3 vViewPosition; \n" +
" \n" +
"void main() { \n" +
"    vec3 red = vec3(0.8,0.1,0.1); \n" +
"    vec3 blue = vec3(0.2, 0.6, 0.9); \n" +
"    vec3 green = vec3(0.5, 0.6, 0.3); \n" +
"    // green = vec3(218.0,196.0,78.0)/255.0; \n" +
"    vec3 white = vec3(0.91,0.95,0.95); \n" +
"    vec3 brown = vec3(252,198,120)/255.0; \n" +
"    vec3 dark = vec3(93.0,69.0,47.0)/255.0; \n" +
" \n" +
"    // brown += snoise(0.4*vec2(vPos.x,0.2*vPos.y)) * dark; \n" +
" \n" +
"    vec3 c = red; \n" +
"    // c += sin(100.0*vUv.x) * blue; \n" +
"    // c += sin(100.0*vUv.y) * green; \n" +
" \n" +
"    // c = green * vUv.x * vUv.y + 0.3; \n" +
"    // c *= vHeight; \n" +
" \n" +
"    // c = mix(green, brown, 0.1); \n" +
"    // c = green; \n" +
"    float fd = dot(uLight - vPos, uCamera - vPos); \n" +
"    fd = clamp(fd,0.0, 1.0); \n" +
"    fd += 0.2; \n" +
" \n" +
"    // vec3 light = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 1.0); \n" +
"    vec3 n = vec3(0.0, 1.0, 0.0); \n" +
"    // vec3 l = vec3(0.0, 0.5, 1.0); \n" +
"    n = normalize(vNormal); \n" +
"    // vec3 l = normalize(vec3(0.0,3.0,10.0)); \n" +
"    vec3 l = normalize(uLight); \n" +
" \n" +
"    c = vHeight > -0.3 ? green : brown; \n" +
"    c = vHeight < 0.5 ? c : dark; \n" +
"    c = vSnow < 2.0 ? c : white; \n" +
" \n" +
"    // c = blue; \n" +
" \n" +
" \n" +
"    vec3 ambient = 0.6 * c; \n" +
" \n" +
"    //polygon flat normal \n" +
"    vec3 fdx = normalize(dFdx( uCamera - vPos )); \n" +
"    vec3 fdy = normalize(dFdy( uCamera - vPos )); \n" +
"    vec3 nn = normalize( cross( fdx, fdy ) ); \n" +
" \n" +
"    float kd = 0.2 * clamp(dot(nn, l), 0.0, 1.0); \n" +
"    float kd2 = 0.4 * clamp(dot(n, l), 0.0, 1.0); \n" +
"    vec3 diffuse =  (kd + kd2) * c; \n" +
" \n" +
"    // blue = blue + 0.125*snoise(100.0*vec2(0.1*vUv.x, vUv.y)); \n" +
" \n" +
"    // r = 2n(n*l) - l \n" +
"    vec3 r = normalize(2.0*nn*(dot(nn,l)) - l); \n" +
"    vec3 v = normalize(uCamera - vPos); \n" +
"    float ks = 0.2 * pow(dot(r,v),8.0); \n" +
"    //ks * (r*v)^a \n" +
"    vec3 spec = ks * (vec3(1.0,1.0,1.0) + c); \n" +
" \n" +
"    spec = vHeight < 0.5 ? spec * 0.1 : spec; \n" +
"    spec = vSnow < 2.0 ? spec : 3.0 * spec; \n" +
"    // c = ambient + diffuse;// + spec; \n" +
" \n" +
"    c = ambient + diffuse + spec; \n" +
"    gl_FragColor = vec4(c, 1.0); \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],2:[function(require,module,exports){
module.exports = function parse(params){
      var template = "vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} \n" +
"vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);}float snoise(vec3 v){const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);vec3 i  = floor(v + dot(v, C.yyy) );vec3 x0 =   v - i + dot(i, C.xxx) ;vec3 g = step(x0.yzx, x0.xyz);vec3 l = 1.0 - g; \n" +
"vec3 i1 = min( g.xyz, l.zxy );vec3 i2 = max( g.xyz, l.zxy );vec3 x1 = x0 - i1 + C.xxx;vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i);vec4 p = permute( permute( permute(i.z + vec4(0.0, i1.z, i2.z, 1.0 ))+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))+ i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
"float n_ = 0.142857142857; vec3  ns = n_ * D.wyz - D.xzx;vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z);vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy;vec4 y = y_ *ns.x + ns.yyyy;vec4 h = 1.0 - abs(x) - abs(y);vec4 b0 = vec4( x.xy, y.xy );vec4 b1 = vec4( x.zw, y.zw );vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"vec4 s1 = floor(b1)*2.0 + 1.0;vec4 sh = -step(h, vec4(0.0));vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;vec3 p0 = vec3(a0.xy,h.x);vec3 p1 = vec3(a0.zw,h.y);vec3 p2 = vec3(a1.xy,h.z);vec3 p3 = vec3(a1.zw,h.w); \n" +
"vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));p0 *= norm.x;p1 *= norm.y;p2 *= norm.z;p3 *= norm.w;vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);m = m * m;return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );} \n" +
"float snoise(vec2 v) {const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);vec2 i  = floor(v + dot(v, C.yy) );vec2 x0 = v -   i + dot(i, C.xx);vec2 i1;i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);vec4 x12 = x0.xyxy + C.xxzz;x12.xy -= i1;i = mod289(i); \n" +
"vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);m = m*m ;m = m*m ;vec3 x = 2.0 * fract(p * C.www) - 1.0;vec3 h = abs(x) - 0.5;vec3 ox = floor(x + 0.5); \n" +
"vec3 a0 = x - ox;m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );vec3 g;g.x  = a0.x  * x0.x  + h.x  * x0.y;g.yz = a0.yz * x12.xz + h.yz * x12.yw;return 130.0 * dot(m, g);} \n" +
" \n" +
" \n" +
" \n" +
" \n" +
"/* ------------- */ \n" +
"/* ------------- */ \n" +
"/* VERTEX SHADER */ \n" +
"/* ------------- */ \n" +
"/* ------------- */ \n" +
" \n" +
"float setHeight(vec2 p, inout float vh, inout float snow){ \n" +
"    float height = 1.0 * snoise(0.00116*vec2(0.4*p.x, 0.9*p.y)); \n" +
" \n" +
"    height = height > 0.5 ? height* (2.0 + 4.0 * pow(height, 5.0)) \n" +
"    : height + 0.8 * (pow(normalize(p).x,10.0)); \n" +
" \n" +
"    height += 0.25 * snoise(0.004*p); \n" +
"    height += 0.125 * snoise(0.008*p); \n" +
" \n" +
"    float waterNoise = 0.25 * snoise(2.0*p); \n" +
"    waterNoise += 0.125 * snoise(4.0*p); \n" +
"    waterNoise += 0.0625 * snoise(8.0*p); \n" +
"    waterNoise *= 1.0; \n" +
"    waterNoise = min(waterNoise, 0.0); \n" +
" \n" +
"    float mountainNoise = 1.0 ; //* snoise(0.002*vec2(0.4*p.x, 0.9*p.y)); \n" +
" \n" +
"    // mountainNoise += 0.5 * snoise(2.0*p); \n" +
"    // mountainNoise += 0.25 * snoise(4.0*p); \n" +
"    // height = snoise(vec2(0.9*uv.x,1.4*uv.y)); \n" +
"    // height += 0.5 * snoise(2.0*uv); \n" +
"    // height += 0.25 * snoise(4.0*uv); \n" +
"    mountainNoise = height; \n" +
"    height = max(-0.3,height); \n" +
"    height = min(height, 0.5); \n" +
"    vh = height; \n" +
"    height = height < 0.5 ? height  :  mountainNoise;// + 0.0 + mountainNoise; \n" +
"    height = height > -0.3 ? height : -1.0 + waterNoise; \n" +
"    mountainNoise = height; \n" +
"    height = min(height, 2.0); \n" +
"    snow = height; \n" +
"    height = height < 2.0 ? height  : mountainNoise; \n" +
"    height *= 100.0; \n" +
"    return height; \n" +
"} \n" +
"vec3 newNormal(vec3 p, float step){ \n" +
"    //add normals of 6 sourounding polygons \n" +
"    float tmp = 0.0; \n" +
"    vec3 v0 = vec3(p.x + step, p.y, p.z ); \n" +
"    v0.z += setHeight(v0.xy, tmp, tmp); \n" +
"    vec3 v1 = vec3(p.x + step, p.y + step, p.z ); \n" +
"    v1.z += setHeight(v1.xy, tmp, tmp); \n" +
"    vec3 v2 = vec3(p.x, p.y + step, p.z ); \n" +
"    v2.z += setHeight(v2.xy, tmp, tmp); \n" +
"    vec3 v3 = vec3(p.x - step, p.y, p.z ); \n" +
"    v3.z += setHeight(v3.xy, tmp, tmp); \n" +
"    vec3 v4 = vec3(p.x - step, p.y - step, p.z ); \n" +
"    v4.z += setHeight(v4.xy, tmp, tmp); \n" +
"    vec3 v5 = vec3(p.x , p.y - step, p.z ); \n" +
"    v5.z += setHeight(v5.xy, tmp, tmp); \n" +
" \n" +
"    vec3 n0 = cross(v0 - p, v1 - p); \n" +
"    vec3 n1 = cross(v1 - p, v2 - p); \n" +
"    vec3 n2 = cross(v2 - p, v3 - p); \n" +
"    vec3 n3 = cross(v3 - p, v4 - p); \n" +
"    vec3 n4 = cross(v4 - p, v5 - p); \n" +
"    vec3 n5 = cross(v5 - p, v0 - p); \n" +
" \n" +
"    return normalize(n0+n1+n2+n3+n4+n5); \n" +
"} \n" +
" \n" +
"uniform float uTime; \n" +
"uniform vec3 uLight; \n" +
"uniform vec3 uCamera; \n" +
"uniform float uPlaneSegmentsSize; \n" +
"varying vec3 vPos; \n" +
"varying vec3 vNormal ; \n" +
"varying vec2 vUv ; \n" +
"varying float vHeight; \n" +
"varying float vSnow; \n" +
" \n" +
"varying vec3 vColor; \n" +
" \n" +
"varying vec3 vViewPosition; \n" +
" \n" +
"void main() { \n" +
"    vec2 p = position.xy; \n" +
"    vPos = position; \n" +
"    vUv = uv; \n" +
"    vColor = vec3(1.0, 0.5, 0.4); \n" +
"    float step = uPlaneSegmentsSize; \n" +
" \n" +
"    float height = setHeight(p, vHeight, vSnow); \n" +
"    vNormal  = newNormal(position, step); \n" +
" \n" +
"    vec3 newPosition = position; \n" +
"    newPosition.z += height + 60.0; \n" +
" \n" +
"    vPos = newPosition; \n" +
"    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); \n" +
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

},{"./groundFragmentShader.glsl":1,"./groundVertexShader.glsl":2}]},{},[3]);
