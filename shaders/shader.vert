
attribute vec3 position;
attribute vec3 color;
varying vec2 uv;
varying vec3 color_v;
void main() {
  gl_Position = vec4(position, 1.0);
  color_v  = color;
  uv = position.xy;
}
