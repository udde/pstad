
precision highp float;

uniform float t;

varying vec2 vUv;
varying vec3 vColor;
varying float vTriangleHeight;

void main() {
    // gl_FragColor = vec4(0.01*(vUv+1.0), 0.5*(cos(t)+1.0), 1.0);
    gl_FragColor.xyz = vUv.x*vColor; //vec3(203.0,171.0,89.0)/255.0;
    gl_FragColor.a = 1.0;
}

//kolla normal vinkel vs top = snö
//kolla triangle height för färgton
