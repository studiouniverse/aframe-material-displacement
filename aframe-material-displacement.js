(function() {
  let glsl = function(strings) {
    if (typeof strings === 'string') strings = [strings]
    var exprs = [].slice.call(arguments,1)
    var parts = []
    for (var i = 0; i < strings.length-1; i++) {
      parts.push(strings[i], exprs[i] || '')
    }
    parts.push(strings[i])
    return parts.join('')
  }

  const vertexShader = glsl(["#define GLSLIFY 1\n//\n// GLSL textureless classic 3D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-10-11\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x)\n{\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec3 fade(vec3 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n  Pi0 = mod289(Pi0);\n  Pi1 = mod289(Pi1);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 * (1.0 / 7.0);\n  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 * (1.0 / 7.0);\n  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n//\n// Based on @thespite's article:\n// \n// \"Vertex displacement with a noise function using GLSL and three.js\"\n// Source: https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/\n//\n\nvarying float noise;\nuniform float time;\n\nfloat turbulence( vec3 p ) {\n\n  float w = 100.0;\n  float t = -.5;\n\n  for (float f = 1.0 ; f <= 10.0 ; f++ ){\n    float power = pow( 2.0, f );\n    t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );\n  }\n\n  return t;\n\n}\n\nvoid main() {\n  noise = 10.0 *  -.10 * turbulence( .5 * normal + time / 3.0 );\n  float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );\n  float displacement = (- 10. * noise + b) / 50.0;\n\n  vec3 newPosition = position + normal * displacement;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );\n}\n"]);
  const fragmentShader = glsl(["#define GLSLIFY 1\nvarying float noise;\nuniform float opacity;\n\nuniform vec3 tint;\n\nvoid main() {\n\n  vec3 color = vec3(1.5 - 2. * noise) * tint;\n  gl_FragColor = vec4( color.rgb, opacity );\n\n}"]);

  AFRAME.registerComponent('material-displacement', {
    schema: {
      opacity: { type: 'float', default: 0.6, min: 0 },
      speed: { type: 'float', default: 1.0, min: 0 },
      tint: { type: 'color', default: "#ffffff" },
    },
    /**
     * Creates a new THREE.ShaderMaterial using the two shaders defined
     * in vertex.glsl and fragment.glsl.
     */
    init: function () {
      this.material  = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 }, opacity: { value: 1.0 }, tint: { value: { x: 1, y: 1, z: 1 } } },
        vertexShader,
        fragmentShader,
        transparent: true
      });
      this.colorShift = new AFRAME.THREE.Color();
      this.el.addEventListener('model-loaded', () => this.update());
    },

    /**
     * Apply the material to the current entity.
     */
    update: function () {
      const mesh = this.el.getObject3D('mesh');
      if (mesh) {
        mesh.material = this.material;
      }
    },

    /**
     * On each frame, update the 'time' uniform in the shaders.
     */
    tick: function (t) {
      this.material.uniforms.time.value = t / (this.data.speed * 8000);
      this.material.uniforms.opacity.value = this.data.opacity;

      this.colorShift.set(this.data.tint);
      this.material.uniforms.tint.value = {x: this.colorShift.r, y:this.colorShift.g, z: this.colorShift.b};
    }

  });
})();
