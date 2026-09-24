// Volumetric light field: domain-warped fog with light rays from a focal point (the gecko on the home
// hero, the project accent on case pages). Rendered at reduced resolution and paused off-screen.
const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uFocus;
uniform float uScroll;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (gl_FragCoord.xy / uRes - 0.5) * vec2(aspect, 1.0);
  vec2 focus = (uFocus - 0.5) * vec2(aspect, 1.0);
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.035;

  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 3.1));
  vec2 r = vec2(fbm(p * 2.1 + 3.6 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 2.1 + 3.6 * q + vec2(8.3, 2.8) - t * 1.1));
  float fog = fbm(p * 1.7 + 3.2 * r + (pointer - focus) * 0.15);

  vec2 toFocus = p - focus;
  float dist = length(toFocus);
  float glow = exp(-dist * 2.3);
  float angle = atan(toFocus.y, toFocus.x);
  float rays = pow(noise(vec2(angle * 7.0, t * 3.0)), 3.2) * exp(-dist * 1.25);

  vec3 tone = mix(uColorB, uColorA, clamp(fog * fog * 2.1 + r.x * 0.35, 0.0, 1.0));
  vec3 color = tone * smoothstep(0.22, 1.05, fog + glow * 0.55) * (0.32 + glow * 1.25);
  color += tone * rays * 0.42;
  color += uColorA * exp(-length(p - pointer) * 4.5) * 0.12;
  color *= smoothstep(1.45, 0.15, length(p * vec2(0.78, 1.0)));
  color *= uIntensity * (1.0 - uScroll * 0.6);
  color += (hash(gl_FragCoord.xy + fract(uTime * 7.0)) - 0.5) * 0.018;
  gl_FragColor = vec4(max(color, 0.0), 1.0);
}
`;

const hexToRgb = (value: string) => {
  const hex = value.trim().replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const number = Number.parseInt(full, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

export interface LightFieldHandle {
  setScroll(value: number): void;
}

export function setupLightField(reduced: boolean): LightFieldHandle | null {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-lightfield]');
  if (!canvas) return null;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) {
    canvas.classList.add('is-fallback');
    return null;
  }
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.classList.add('is-fallback');
    return null;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    res: uniform('uRes'), time: uniform('uTime'), pointer: uniform('uPointer'), focus: uniform('uFocus'),
    scroll: uniform('uScroll'), intensity: uniform('uIntensity'), colorA: uniform('uColorA'), colorB: uniform('uColorB'),
  };
  const styles = getComputedStyle(canvas);
  const colorA = hexToRgb(styles.getPropertyValue('--light-a') || '#a740f4');
  const colorB = hexToRgb(styles.getPropertyValue('--light-b') || '#4b61ff');
  const focus = (canvas.dataset.focus || '0.72,0.58').split(',').map(Number);
  gl.uniform3fv(u.colorA, colorA);
  gl.uniform3fv(u.colorB, colorB);
  gl.uniform2f(u.focus, focus[0], focus[1]);
  gl.uniform1f(u.intensity, Number(canvas.dataset.intensity || 1));

  const pointer = { x: focus[0], y: focus[1], tx: focus[0], ty: focus[1] };
  let scroll = 0;
  let visible = true;
  let running = false;
  let lastFrame = 0;
  const start = performance.now();

  const resize = () => {
    // Fog is soft by nature: rendering at ~55% resolution keeps it cheap without visible loss.
    const scale = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth < 700 ? 0.5 : 0.55);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(rect.width * scale));
    canvas.height = Math.max(2, Math.round(rect.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    if (reduced) render(performance.now());
  };
  const render = (now: number) => {
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    gl.uniform1f(u.time, reduced ? 12 : (now - start) / 1000);
    gl.uniform2f(u.pointer, pointer.x, pointer.y);
    gl.uniform1f(u.scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    if (!visible || document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    if (now - lastFrame < 33) return;
    lastFrame = now;
    render(now);
  };
  const wake = () => {
    if (reduced || running || !visible || document.hidden) return;
    running = true;
    requestAnimationFrame(loop);
  };

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }).observe(canvas);
  document.addEventListener('visibilitychange', wake);
  addEventListener('resize', resize, { passive: true });
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (event) => {
      pointer.tx = event.clientX / innerWidth;
      pointer.ty = 1 - event.clientY / innerHeight;
    }, { passive: true });
  }
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); canvas.classList.add('is-fallback'); visible = false; });
  resize();
  render(performance.now());
  requestAnimationFrame(() => canvas.classList.add('is-ready'));
  wake();

  return { setScroll(value: number) { scroll = Math.min(1, Math.max(0, value)); } };
}
