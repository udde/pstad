
precision highp float;
uniform float t;
varying vec2 uv;
varying vec3 color_v;
void main() {
  gl_FragColor = vec4(0.01*(uv+1.0), 0.5*(cos(t)+1.0), 1.0);
  gl_FragColor = vec4(color_v , 1.0);
}
