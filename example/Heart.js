import GL from "gl-react";
const {React} = GL;
const {PropTypes} = React;

const shaders = GL.Shaders.create({
  Heart: { // inspired from http://glslsandbox.com/e#29521.0
    frag: `
precision highp float;
varying vec2 uv;

uniform vec3 color;
uniform float over;
uniform float toggle;

void main(void)
{
  vec2 p = (2.0 * uv - 1.0);
  p -= vec2(0.,0.3);
  p *= vec2(0.5,1.5) + 0.8*vec2(0.5,-0.5);

  float a = atan(p.x,p.y)/3.141593;
  float r = length(p);

  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h - 0.2 * over)/(6.0-5.0*h);

  float f = step(r,d) * pow(1.0-r/d,0.25);
  gl_FragColor = vec4(mix(vec3(1.0), mix(color, color + 0.2, over) - 0.5 * toggle, f), 1.0);
}
    `
  }
});

module.exports = GL.createComponent(
  ({ color, over, toggle }) => <GL.Node shader={shaders.Heart} uniforms={{ color, over, toggle: toggle ? 1 : 0 }} />,
  {
    displayName: "Heart",
    propTypes: {
      color: PropTypes.array.isRequired,
      over: PropTypes.number.isRequired,
      toggle: PropTypes.bool.isRequired
    }
  });
