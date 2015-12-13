precision highp float;
//stegu noise
vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec4 permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);}float snoise(vec3 v){const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);vec3 i  = floor(v + dot(v, C.yyy) );vec3 x0 =   v - i + dot(i, C.xxx) ;vec3 g = step(x0.yzx, x0.xyz);vec3 l = 1.0 - g;vec3 i1 = min( g.xyz, l.zxy );vec3 i2 = max( g.xyz, l.zxy );vec3 x1 = x0 - i1 + C.xxx;vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i);vec4 p = permute( permute( permute(i.z + vec4(0.0, i1.z, i2.z, 1.0 ))+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));float n_ = 0.142857142857; vec3  ns = n_ * D.wyz - D.xzx;vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z);vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy;vec4 y = y_ *ns.x + ns.yyyy;vec4 h = 1.0 - abs(x) - abs(y);vec4 b0 = vec4( x.xy, y.xy );vec4 b1 = vec4( x.zw, y.zw );vec4 s0 = floor(b0)*2.0 + 1.0;vec4 s1 = floor(b1)*2.0 + 1.0;vec4 sh = -step(h, vec4(0.0));vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;vec3 p0 = vec3(a0.xy,h.x);vec3 p1 = vec3(a0.zw,h.y);vec3 p2 = vec3(a1.xy,h.z);vec3 p3 = vec3(a1.zw,h.w);vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));p0 *= norm.x;p1 *= norm.y;p2 *= norm.z;p3 *= norm.w;vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);m = m * m;return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );} float snoise(vec2 v) {const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);vec2 i  = floor(v + dot(v, C.yy) );vec2 x0 = v -   i + dot(i, C.xx);vec2 i1;i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);vec4 x12 = x0.xyxy + C.xxzz;x12.xy -= i1;i = mod289(i);vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);m = m*m ;m = m*m ;vec3 x = 2.0 * fract(p * C.www) - 1.0;vec3 h = abs(x) - 0.5;vec3 ox = floor(x + 0.5);vec3 a0 = x - ox;m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );vec3 g;g.x  = a0.x  * x0.x  + h.x  * x0.y;g.yz = a0.yz * x12.xz + h.yz * x12.yw;return 130.0 * dot(m, g);}


uniform float t;
uniform vec3 uCameraPos;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vColor;
varying vec3 vNormal;
varying float vTriangleHeight;

void main() {
    vec3 n = vNormal;
    vec3 beige = vec3(203,171,89)/255.0;
    vec3 green = vec3(38,116,39)/255.0;
    vec3 brown = vec3(85,62,42)/255.0; //rgb(83,68,57)
    vec3 gray = vec3(60,57,55)/255.0;
    vec3 white = vec3(217,219,230)/255.0;
    vec3 c = beige;


    float ka = 0.4;

    vec3 li = normalize(vec3(0.0,4.0,10.0));
    float kd = 0.4 * clamp(dot(n, li), 0.0, 1.0);

    vec3 r = normalize(2.0*n*(dot(n,li)) - li);
    vec3 v = normalize(uCameraPos - vPos);
    float ks = 0.4 * clamp(pow(dot(r,v),4.0), 0.0, 1.0);


    float lo = 0.4;
    float u = 0.5;
    if(vTriangleHeight > lo && vTriangleHeight < u){
        c = mix(beige, green, (vTriangleHeight - lo) / (u-lo));
        ks = 0.2 * clamp(pow(dot(r,v),8.0), 0.0, 1.0);
    }
    lo = u;
    u = 0.6;
    if(vTriangleHeight > lo && vTriangleHeight < u){
        c = mix(green, brown, (vTriangleHeight - lo) / (u-lo));
        ks = 0.2 * clamp(pow(dot(r,v),8.0), 0.0, 1.0);
    }
    lo = u;
    u = 0.66;
    if(vTriangleHeight > lo && vTriangleHeight < u){
        c = ( vTriangleHeight < (lo + (u-lo)/2.0)) ? /*brown*/mix(brown, gray, vTriangleHeight -0.15) : gray; //c = mix(brown, white, (vTriangleHeight - l) / (u-l));
        ks = 0.2 * clamp(pow(dot(r,v),8.0), 0.0, 1.0);
    }
    if(vTriangleHeight > u){
        c = white;
        ks = 0.4 * clamp(pow(dot(r,v),3.0), 0.0, 1.0);
    }


    //polygon flat normal
    // vec3 fdx = normalize(dFdx( uCamera - vPos ));
    // vec3 fdy = normalize(dFdy( uCamera - vPos ));
    // vec3 nn = normalize( cross( fdx, fdy ) );


    // blue = blue + 0.125*snoise(100.0*vec2(0.1*vUv.x, vUv.y));

    //// r = 2n(n*l) - l
    // //ks * (r*v)^a
    //
    // spec = vHeight < 0.5 ? spec * 0.1 : spec;
    // spec = vSnow < 2.0 ? spec : 3.0 * spec;
    // // c = ambient + diffuse;// + spec;
    //
    // c = ambient + diffuse + spec;

    vec3 ambient = ka * c;
    vec3 diffuse = kd * c;
    vec3 spec = ks * (vec3(1.0,1.0,1.0) + c);

    // gl_FragColor = vec4(0.01*(vUv+1.0), 0.5*(cos(t)+1.0), 1.0);
    gl_FragColor.xyz = diffuse + ambient + spec;
    gl_FragColor.a = 1.0;
}

//kolla normal vinkel vs top = snö
//kolla triangle height för färgton
