export const TERRAIN_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in uvec4 aA; // u, v, tile, face
layout(location=2) in uvec4 aB; // ao, sky, block, flags
uniform mat4 uVP;
uniform vec3 uCam;
uniform float uTime;
uniform float uNether;
uniform vec3 uAmbient;
uniform vec3 uSkyTint;
uniform float uFogNear;
uniform float uFogFar;
out vec2 vUV;
flat out float vTile;
out vec3 vLight;
out float vFog;
flat out uint vFlags;
const float FACE_DAY[6] = float[6](0.62, 0.62, 1.0, 0.5, 0.8, 0.8);
const float FACE_NETHER[6] = float[6](0.8, 0.8, 1.0, 0.7, 0.9, 0.9);
void main() {
  vec3 p = aPos;
  uint flags = aB.w;
  if ((flags & 16u) != 0u) p.y += sin(uTime * 1.4 + aPos.x * 1.7 + aPos.z * 1.3) * 0.03 * step(0.5, fract(aPos.y + 0.12));
  gl_Position = uVP * vec4(p, 1.0);
  vUV = vec2(float(aA.x), 1.0 - float(aA.y));
  vTile = float(aA.z);
  float ao = 0.42 + 0.58 * float(aB.x) / 3.0;
  float sky = float(aB.y) / 15.0;
  float blk = float(aB.z) / 15.0;
  float face = uNether > 0.5 ? FACE_NETHER[aA.w] : FACE_DAY[aA.w];
  vec3 skyTerm = uSkyTint * pow(sky, 1.4) * face;
  vec3 blkTerm = vec3(1.0, 0.74, 0.46) * pow(blk, 1.7) * 1.15;
  vec3 l = (uAmbient * face + skyTerm + blkTerm) * ao;
  if ((flags & 1u) != 0u) l = max(l, vec3(0.95, 0.9, 0.85) * (0.75 + 0.25 * ao));
  vLight = l;
  float d = length(p - uCam);
  vFog = smoothstep(uFogNear, uFogFar, d);
  vFlags = flags;
}`;

export const TERRAIN_FS = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uTex;
uniform vec3 uFog;
uniform float uTime;
uniform float uPass; // 0 solid, 1 translucent
in vec2 vUV;
flat in float vTile;
in vec3 vLight;
in float vFog;
flat in uint vFlags;
out vec4 outColor;
void main() {
  vec2 uv = vUV;
  if ((vFlags & 2u) != 0u) {
    uv += vec2(sin(uTime * 0.8 + uv.y * 6.2832) * 0.035, uTime * ((vFlags & 16u) != 0u ? 0.035 : 0.02));
  }
  vec4 t = texture(uTex, vec3(uv, vTile));
  if ((vFlags & 4u) != 0u && t.a < 0.5) discard;
  vec3 c = t.rgb * vLight;
  float a = 1.0;
  if (uPass > 0.5) {
    a = t.a;
    if ((vFlags & 8u) != 0u) a = (vFlags & 16u) != 0u ? 0.96 : 0.72;
  }
  c = mix(c, uFog, vFog);
  outColor = vec4(c, a);
}`;

export const SKY_VS = `#version 300 es
precision highp float;
out vec2 vNdc;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vNdc = p * 2.0 - 1.0;
  gl_Position = vec4(vNdc, 1.0, 1.0);
}`;

export const SKY_FS = `#version 300 es
precision highp float;
in vec2 vNdc;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uFwd;
uniform vec2 uTan;
uniform vec3 uCam;
uniform float uTime;
uniform float uNether;
uniform vec3 uFog;
out vec4 outColor;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
void main() {
  vec3 d = normalize(uFwd + uRight * (vNdc.x * uTan.x) + uUp * (vNdc.y * uTan.y));
  vec3 col;
  if (uNether > 0.5) {
    float h = clamp(d.y * 1.4 + 0.2, 0.0, 1.0);
    col = mix(uFog * 1.5, vec3(0.05, 0.012, 0.015), pow(h, 0.7));
  } else {
    float h = clamp(d.y, 0.0, 1.0);
    vec3 top = vec3(0.24, 0.5, 0.93);
    vec3 hor = vec3(0.72, 0.85, 0.98);
    col = mix(hor, top, pow(h, 0.55));
    // square sun
    vec3 sun = normalize(vec3(-0.34, 0.3, 0.89));
    float s = dot(d, sun);
    if (s > 0.0) {
      vec3 sr = normalize(cross(sun, vec3(0.0, 1.0, 0.0)));
      vec3 su = cross(sr, sun);
      vec2 q = vec2(dot(d, sr), dot(d, su)) / s;
      float m = max(abs(q.x), abs(q.y));
      col += vec3(1.0, 0.9, 0.6) * pow(max(s, 0.0), 90.0) * 0.55;
      if (m < 0.075) col = vec3(1.0, 0.97, 0.82);
    }
    // blocky drifting clouds
    if (d.y > 0.015) {
      float t = (62.0 - uCam.y) / d.y;
      vec2 p = uCam.xz + d.xz * t + vec2(uTime * 1.6, uTime * 0.4);
      vec2 cell = floor(p / 14.0);
      float r = hash(cell);
      float r2 = hash(cell * 1.7 + 11.0);
      float on = step(0.6, r) * step(0.0, 0.9 - fract(p.x / 14.0) * 0.0);
      float fade = smoothstep(0.015, 0.16, d.y);
      vec3 cc = mix(vec3(0.82, 0.88, 0.97), vec3(1.0), r2);
      col = mix(col, cc, on * fade * 0.92);
    }
  }
  outColor = vec4(col, 1.0);
}`;

export const ENTITY_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNor;
layout(location=2) in vec4 aM0;
layout(location=3) in vec4 aM1;
layout(location=4) in vec4 aM2;
layout(location=5) in vec4 aM3;
layout(location=6) in vec4 aCol;
uniform mat4 uVP;
uniform vec3 uCam;
uniform float uNether;
uniform float uFogNear;
uniform float uFogFar;
uniform float uTime;
out vec3 vCol;
out float vFog;
void main() {
  mat4 m = mat4(aM0, aM1, aM2, aM3);
  vec4 wp = m * vec4(aPos, 1.0);
  gl_Position = uVP * wp;
  vec3 n = normalize(mat3(m) * aNor);
  vec3 col = aCol.rgb;
  float glow = aCol.a;
  vec3 light;
  if (uNether > 0.5) {
    float flick = 0.92 + 0.08 * sin(uTime * 6.0 + wp.x);
    light = vec3(0.34, 0.2, 0.17) + vec3(1.0, 0.45, 0.2) * max(-n.y, 0.0) * 0.55 * flick + vec3(0.9, 0.5, 0.3) * max(n.y, 0.0) * 0.3;
    light += vec3(0.5, 0.3, 0.2) * (0.5 + 0.5 * n.x);
  } else {
    vec3 sun = normalize(vec3(-0.34, 0.6, 0.89));
    light = vec3(0.58, 0.62, 0.7) + vec3(0.62, 0.58, 0.48) * max(dot(n, sun), 0.0);
  }
  vCol = mix(col * light, col * 1.15 + vec3(0.1, 0.05, 0.0) * glow, clamp(glow, 0.0, 1.0));
  vFog = smoothstep(uFogNear, uFogFar, length(wp.xyz - uCam));
}`;

export const ENTITY_FS = `#version 300 es
precision highp float;
in vec3 vCol;
in float vFog;
uniform vec3 uFog;
out vec4 outColor;
void main() {
  outColor = vec4(mix(vCol, uFog, vFog), 1.0);
}`;

export const PART_VS = `#version 300 es
precision highp float;
uniform mat4 uVP;
uniform vec3 uCam;
uniform float uTime;
uniform float uNether;
uniform float uScale;
out float vA;
out vec3 vC;
float h(float n) { return fract(sin(n * 127.1) * 43758.5453); }
void main() {
  float id = float(gl_VertexID);
  vec3 size = vec3(54.0, 22.0, 54.0);
  vec3 rnd = vec3(h(id), h(id + 17.3), h(id + 41.9));
  vec3 vel = uNether > 0.5 ? vec3(0.25 * (rnd.x - 0.5), 0.6 + rnd.y * 0.8, 0.2 * (rnd.z - 0.5)) : vec3(0.35, 0.05 + 0.1 * rnd.y, 0.15 * (rnd.z - 0.5));
  vec3 base = rnd * size + vel * uTime;
  vec3 rel = mod(base - uCam, size) - size * 0.5;
  vec3 p = uCam + rel;
  if (uNether > 0.5) p.y = uCam.y + rel.y * 0.8 - 2.0;
  else p.y = uCam.y + rel.y * 0.55;
  gl_Position = uVP * vec4(p, 1.0);
  float d = max(gl_Position.w, 0.1);
  gl_PointSize = clamp(uScale * (uNether > 0.5 ? 0.11 : 0.09) * (0.6 + rnd.y) / d, 1.5, 7.0 * uScale);
  float edge = 1.0 - smoothstep(18.0, 27.0, length(rel.xz));
  float tw = 0.6 + 0.4 * sin(uTime * (2.0 + rnd.z * 4.0) + id);
  vA = edge * tw * smoothstep(1.0, 3.0, d);
  vC = uNether > 0.5 ? mix(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.8, 0.3), rnd.x) : mix(vec3(1.0, 0.95, 0.65), vec3(0.85, 1.0, 0.7), rnd.x);
}`;

export const PART_FS = `#version 300 es
precision highp float;
in float vA;
in vec3 vC;
out vec4 outColor;
void main() {
  outColor = vec4(vC * vA, vA);
}`;
