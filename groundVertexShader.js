vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);}float snoise(vec3 v){const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);vec3 i  = floor(v + dot(v, C.yyy) );vec3 x0 =   v - i + dot(i, C.xxx) ;vec3 g = step(x0.yzx, x0.xyz);vec3 l = 1.0 - g;vec3 i1 = min( g.xyz, l.zxy );vec3 i2 = max( g.xyz, l.zxy );vec3 x1 = x0 - i1 + C.xxx;vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i);vec4 p = permute( permute( permute(i.z + vec4(0.0, i1.z, i2.z, 1.0 ))+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));float n_ = 0.142857142857; vec3  ns = n_ * D.wyz - D.xzx;vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z);vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy;vec4 y = y_ *ns.x + ns.yyyy;vec4 h = 1.0 - abs(x) - abs(y);vec4 b0 = vec4( x.xy, y.xy );vec4 b1 = vec4( x.zw, y.zw );vec4 s0 = floor(b0)*2.0 + 1.0;vec4 s1 = floor(b1)*2.0 + 1.0;vec4 sh = -step(h, vec4(0.0));vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;vec3 p0 = vec3(a0.xy,h.x);vec3 p1 = vec3(a0.zw,h.y);vec3 p2 = vec3(a1.xy,h.z);vec3 p3 = vec3(a1.zw,h.w);vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));p0 *= norm.x;p1 *= norm.y;p2 *= norm.z;p3 *= norm.w;vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);m = m * m;return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );} float snoise(vec2 v) {const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);vec2 i  = floor(v + dot(v, C.yy) );vec2 x0 = v -   i + dot(i, C.xx);vec2 i1;i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);vec4 x12 = x0.xyxy + C.xxzz;x12.xy -= i1;i = mod289(i);vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);m = m*m ;m = m*m ;vec3 x = 2.0 * fract(p * C.www) - 1.0;vec3 h = abs(x) - 0.5;vec3 ox = floor(x + 0.5);vec3 a0 = x - ox;m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );vec3 g;g.x  = a0.x  * x0.x  + h.x  * x0.y;g.yz = a0.yz * x12.xz + h.yz * x12.yw;return 130.0 * dot(m, g);}




/* ------------- */
/* ------------- */
/* VERTEX SHADER */
/* ------------- */
/* ------------- */

float setHeight(vec2 p, inout float vh, inout float snow){
    float height = 1.0 * snoise(0.00116*vec2(0.4*p.x, 0.9*p.y));
    height = height > 0.5 ? height* (2.0 + 4.0 * pow(height, 5.0))
    : height + 0.8 * (pow(normalize(p).x,10.0));
    height += 0.25 * snoise(0.004*p);
    height += 0.125 * snoise(0.008*p);

    float waterNoise = 0.25 * snoise(2.0*p);
    waterNoise += 0.125 * snoise(4.0*p);
    waterNoise += 0.0625 * snoise(8.0*p);
    waterNoise *= 1.0;
    waterNoise = min(waterNoise, 0.0);

    float mountainNoise = 1.0 ; //* snoise(0.002*vec2(0.4*p.x, 0.9*p.y));

    // mountainNoise += 0.5 * snoise(2.0*p);
    // mountainNoise += 0.25 * snoise(4.0*p);
    // height = snoise(vec2(0.9*uv.x,1.4*uv.y));
    // height += 0.5 * snoise(2.0*uv);
    // height += 0.25 * snoise(4.0*uv);
    mountainNoise = height;
    height = max(-0.3,height);
    height = min(height, 0.5);
    vh = height;
    height = height < 0.5 ? height  :  mountainNoise;// + 0.0 + mountainNoise;
    height = height > -0.3 ? height : -1.0 + waterNoise;
    mountainNoise = height;
    height = min(height, 2.0);
    snow = height;
    height = height < 2.0 ? height  : mountainNoise;
    height *= 100.0;
    return height;
}
vec3 newNormal(vec3 p, float step){
    //add normals of 6 sourounding polygons
    float tmp = 0.0;
    vec3 v0 = vec3(p.x + step, p.y, p.z );
    v0.z += setHeight(v0.xy, tmp, tmp);
    vec3 v1 = vec3(p.x + step, p.y + step, p.z );
    v1.z += setHeight(v1.xy, tmp, tmp);
    vec3 v2 = vec3(p.x, p.y + step, p.z );
    v2.z += setHeight(v2.xy, tmp, tmp);
    vec3 v3 = vec3(p.x - step, p.y, p.z );
    v3.z += setHeight(v3.xy, tmp, tmp);
    vec3 v4 = vec3(p.x - step, p.y - step, p.z );
    v4.z += setHeight(v4.xy, tmp, tmp);
    vec3 v5 = vec3(p.x , p.y - step, p.z );
    v5.z += setHeight(v5.xy, tmp, tmp);

    vec3 n0 = cross(v0 - p, v1 - p);
    vec3 n1 = cross(v1 - p, v2 - p);
    vec3 n2 = cross(v2 - p, v3 - p);
    vec3 n3 = cross(v3 - p, v4 - p);
    vec3 n4 = cross(v4 - p, v5 - p);
    vec3 n5 = cross(v5 - p, v0 - p);

    return normalize(n0+n1+n2+n3+n4+n5);
}

uniform vec3 uLight;
uniform vec3 uCamera;
uniform float uPlaneSegmentsSize;
varying vec3 vPos;
varying vec3 vNormal ;
varying vec2 vUv ;
varying float vHeight;
varying float vSnow;

varying vec3 vColor;

varying vec3 vViewPosition;

void main() {
    vec2 p = position.xy;
    vPos = position;
    vUv = uv;
    vColor = vec3(1.0, 0.5, 0.4);
    float step = uPlaneSegmentsSize;

    float height = setHeight(p, vHeight, vSnow);
    vNormal  = newNormal(position, step);

    vec3 newPosition = position;
    newPosition.z += height + 60.0;

    vPos = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
