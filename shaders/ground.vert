
attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
attribute float aTriangleHeight;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying float vTriangleHeight;
varying vec3 vPos;

uniform float t;
uniform mat4 model;
uniform mat4 projection;
uniform mat4 view;

void main() {
    vUv = normalize(aPosition.xz);

    vNormal = normalize(aNormal);
    vColor = aColor;

    vPos = aPosition;

    vTriangleHeight = aTriangleHeight;
    gl_Position = projection*view*model*vec4(aPosition, 1.0);
}
