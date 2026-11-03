// The dust, drawn live in a fragment shader: a faint field across the whole window and a brighter cloud moving through
// it. The CSS timelines say where the cloud should be; each frame follows them with some lag, the near grains faster than
// the far ones, so it stretches and settles like something loose instead of moving as one sheet.

const VERTEX = `
attribute vec2 corner;
void main() {
  gl_Position = vec4(corner, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
uniform vec2 nearCenter;
uniform vec2 farCenter;
uniform float radius;
uniform float turn;
uniform float time;
uniform float stir;
uniform float opacity;
uniform float field;
uniform float unit;
uniform vec2 drift;
uniform vec3 pointer;
uniform float glow;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float value(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * value(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3;
    amplitude *= 0.5;
  }
  return sum / 0.9375;
}

// Noise read through noise: this is what gathers the grains into folds instead of blotches.
float folds(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(1.7, 9.2) + t * 0.09), fbm(p + vec2(8.3, 2.8) - t * 0.07));
  vec2 w = vec2(fbm(p + 3.0 * q + vec2(1.3, 6.1) + t * 0.05), fbm(p + 3.0 * q + vec2(7.7, 2.4) - t * 0.06));
  return fbm(p + 3.2 * w);
}

// One grain per cell at most, anywhere in the cell so the cells don't read as rows. Most grains are small and dim, few are
// large or bright, as in real dust. soft is how out of focus the layer is.
float grains(vec2 g, float keep, float t, float smallest, float largest, float soft) {
  vec2 id = floor(g);
  float seed = hash(id);
  if (seed > keep) return 0.0;
  float size = mix(smallest, largest, pow(hash(id + 5.3), 4.0));
  vec2 offset = (vec2(hash(id + 3.1), hash(id + 8.7)) - 0.5) * (1.0 - 2.0 * size);
  float brightness = 0.22 + 0.78 * pow(hash(id + 2.4), 3.0);
  float glint = 0.88 + 0.12 * sin(t * (0.3 + seed * 0.7) + seed * 40.0);
  return smoothstep(size, size * soft, length(fract(g) - 0.5 - offset)) * brightness * glint;
}

mat2 rotation(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 lit = (frag - pointer.xy) / glow;
  float light = pointer.z * exp(-dot(lit, lit));

  // The field: fine, sparse and in focus, so it reads as air rather than as more of the cloud.
  vec2 a = (frag - drift) / unit;
  float patches = 0.3 + 0.7 * smoothstep(0.3, 0.7, value(a * 0.05 + time * 0.01));
  float faint = grains(rotation(0.6) * a, patches * 0.55, time, 0.07, 0.16, 0.25)
    + 0.7 * grains(rotation(-0.9) * a * 0.21 + 3.0, patches * 0.05, time + 4.0, 0.1, 0.2, 0.05);
  float alpha = field * faint * (0.2 + 1.6 * light);

  vec2 near = (frag - nearCenter) / radius;
  vec2 far = (frag - farCenter) / radius;
  vec2 middle = (near + far) * 0.5;
  // The outline: a band that turns and changes length along the film, torn by noise, so it is never the same blob twice.
  vec2 shape = rotation(stir * 0.45) * middle * vec2(1.0, 1.6 + 0.5 * sin(stir * 0.9));
  shape += 0.5 * (vec2(fbm(middle * 1.1 + time * 0.03), fbm(middle * 1.1 + 5.0 - time * 0.025)) - 0.5);
  float edge = 1.0 - smoothstep(0.2, 1.05, length(shape) + 0.9 * (fbm(middle * 1.6 + time * 0.03) - 0.5));
  if (edge > 0.0 && opacity > 0.0) {
    // Twisted more towards the rim and pushed by slow noise, so no two grains keep their distance for long.
    float twist = turn + 0.4 * sin(time * 0.07) * length(near);
    near = rotation(twist) * near;
    far = rotation(twist * 0.6 + time * 0.012) * far;
    near += 0.05 * (vec2(fbm(near * 2.0 + time * 0.05), fbm(near * 2.0 + 4.0 - time * 0.05)) - 0.5);
    float fold = folds((near + far) * 0.7 + vec2(stir * 2.3, -stir * 1.7), time);
    float density = smoothstep(0.38, 0.62, fold);
    // Haze under the grains: the fine dust too small to see one by one, which gives the cloud its volume.
    float haze = smoothstep(0.32, 0.8, fold);
    // Deep grains lag and stay fine, near ones lead, and the nearest are large, dim and out of focus.
    float cloud = grains(rotation(0.5) * far * 72.0, density, time, 0.16, 0.24, 0.3)
      + 1.3 * grains(rotation(-0.7) * near * 34.0 + 11.0, density * 0.5, time + 9.0, 0.1, 0.28, 0.2)
      + 0.35 * grains(rotation(1.9) * near * 9.0 + 5.0, density * 0.1, time + 4.0, 0.12, 0.3, 0.0);
    alpha += (1.15 * cloud * (0.35 + 0.65 * density) + 0.13 * haze) * edge * opacity * (1.0 + 0.9 * light);
  }

  // A trace of noise, so the haze doesn't fall into bands on black.
  alpha += (hash(frag + fract(time)) - 0.5) * 0.006 * step(0.002, alpha);
  alpha = clamp(alpha, 0.0, 1.0);
  gl_FragColor = vec4(vec3(0.95) * alpha, alpha);
}`;

export function startMist(canvas: HTMLCanvasElement) {
  const bead = document.querySelector<HTMLElement>(".bead");
  const morph = document.querySelector<HTMLElement>(".morph");
  // .bead is hidden under reduced motion and without scroll timelines. The dust stays away then too.
  if (!bead || !morph || getComputedStyle(bead).display === "none") return;
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.bindAttribLocation(program, 0, "corner");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const locations = new Map<string, WebGLUniformLocation | null>();
  const uniform = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name)!;
  };

  // Everything that follows a target eases towards it at a rate that doesn't depend on the frame rate.
  const follow = (from: number, to: number, rate: number, seconds: number) => from + (to - from) * (1 - Math.exp(-rate * seconds));

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, target: 0 };
  const onMove = (event: PointerEvent) => {
    if (pointer.target === 0) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.target = 1;
  };
  const onLeave = () => {
    pointer.target = 0;
  };
  const onUp = (event: PointerEvent) => {
    if (event.pointerType === "touch") onLeave();
  };
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerup", onUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  // Slow devices step down in resolution and stay there.
  let quality = 1;
  let frames = 0;
  let spent = 0;
  const start = performance.now();
  let last = start;
  let raf = 0;
  // Scrolling carries the field along a heading that swings across the page, up at first, then out to either side and
  // back. Scrolling back retraces it, and at rest it keeps drifting the same way.
  let lastScroll = scrollY;
  const drift = { x: 0, y: 0 };
  let cloud: { nearX: number; nearY: number; farX: number; farY: number; radius: number; progress: number } | undefined;

  const draw = (now: number) => {
    raf = requestAnimationFrame(draw);
    const delta = now - last;
    last = now;
    if (delta < 200) {
      spent += delta;
      if (++frames === 40) {
        if (spent / frames > 28 && quality > 0.4) quality *= 0.8;
        frames = 0;
        spent = 0;
      }
    }
    const seconds = Math.min(delta, 100) / 1000;

    const scale = Math.min(devicePixelRatio, 2) * quality;
    const [width, height] = [Math.round(canvas.clientWidth * scale), Math.round(canvas.clientHeight * scale)];
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    const style = getComputedStyle(morph);
    const { left, top } = bead.getBoundingClientRect();
    const { a, b } = new DOMMatrix(style.transform);
    const targetRadius = (morph.offsetWidth / 2) * Math.hypot(a, b);
    const targetProgress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    cloud ??= { nearX: left, nearY: top, farX: left, farY: top, radius: targetRadius, progress: targetProgress };
    cloud.nearX = follow(cloud.nearX, left, 7, seconds);
    cloud.nearY = follow(cloud.nearY, top, 7, seconds);
    cloud.farX = follow(cloud.farX, left, 2.5, seconds);
    cloud.farY = follow(cloud.farY, top, 2.5, seconds);
    cloud.radius = follow(cloud.radius, targetRadius, 4, seconds);
    cloud.progress = follow(cloud.progress, targetProgress, 4, seconds);

    const heading = Math.PI / 2 + 1.5 * Math.sin(targetProgress * Math.PI * 5);
    const travelled = (scrollY - lastScroll) * 0.16 + seconds * 0.6;
    lastScroll = scrollY;
    drift.x += Math.cos(heading) * travelled;
    drift.y += Math.sin(heading) * travelled;

    pointer.x = follow(pointer.x, pointer.targetX, 9, seconds);
    pointer.y = follow(pointer.y, pointer.targetY, 9, seconds);
    pointer.strength = follow(pointer.strength, pointer.target, 3, seconds);

    const shortest = Math.min(canvas.clientWidth, canvas.clientHeight);
    gl.uniform2f(uniform("nearCenter"), cloud.nearX * scale, height - cloud.nearY * scale);
    gl.uniform2f(uniform("farCenter"), cloud.farX * scale, height - cloud.farY * scale);
    gl.uniform1f(uniform("radius"), cloud.radius * scale);
    gl.uniform1f(uniform("turn"), Math.atan2(b, a));
    gl.uniform1f(uniform("time"), now / 1000);
    gl.uniform1f(uniform("stir"), cloud.progress * 6);
    gl.uniform1f(uniform("opacity"), Number(style.opacity));
    gl.uniform1f(uniform("field"), Math.min(1, (now - start) / 3000));
    gl.uniform1f(uniform("unit"), shortest * 0.01 * scale);
    gl.uniform2f(uniform("drift"), drift.x * scale, drift.y * scale);
    gl.uniform3f(uniform("pointer"), pointer.x * scale, height - pointer.y * scale, pointer.strength);
    gl.uniform1f(uniform("glow"), shortest * 0.24 * scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  raf = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerup", onUp);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}
