import GL from "gl-react";
const {React} = GL;
const {PropTypes} = React;

const shaders = GL.Shaders.create({
  Heart: { // inspired from http://glslsandbox.com/e#29521.0
    frag: `
precision highp float;
varying vec2 uv;

uniform vec3 color;
uniform sampler2D image;
uniform float over;
uniform float toggle;

void main(void)
{
  vec2 p = (2.0 * uv - 1.0);
  p -= vec2(0., 0.3 + 0.1 * over + 0.6 * toggle);
  p *= vec2(0.5,1.5) + 0.8 * vec2(0.5,-0.5);

  p *= 1.0 - 0.1 * over - 0.8 * toggle;

  float a = atan(p.x,p.y)/3.141593;
  float r = length(p);

  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h - 0.3 * (1.0 - over))/(6.0-5.0*h);

  float f = step(r,d) * pow(1.0-r/d,0.25);
  vec3 t = texture2D(image, uv).rgb;
  vec3 c = mix(
    color * (1.0 + 0.6 * t),
    t,
    min(0.1 + 0.8 * over + toggle, 1.4));
  gl_FragColor = vec4(mix(vec3(1.0), c, f), 1.0);
}
    `
  }
});

module.exports = GL.createComponent(
  ({ color, over, toggle, image }) =>
  <GL.Node
    shader={shaders.Heart}
    uniforms={{
      color,
      image,
      over,
      toggle
    }}
  />,
  {
    displayName: "Heart",
    propTypes: {
      color: PropTypes.array.isRequired,
      over: PropTypes.number.isRequired,
      toggle: PropTypes.number.isRequired,
      image: PropTypes.string
    }
  });
