// Dotted globe with land from Natural Earth (precomputed in src/data/globe-points.json) and light arcs
// leaving Brazil. Canvas 2D, orthographic projection, paused whenever it is off-screen.
const RAD = Math.PI / 180;
const ORIGIN: [number, number] = [-15.8, -47.9];
const DESTINATIONS: [number, number][] = [
  [38.7, -9.1], [40.7, -74.0], [51.5, -0.1], [35.7, 139.7], [-33.9, 18.4], [-33.9, 151.2], [19.4, -99.1], [52.5, 13.4],
];

type Vec3 = [number, number, number];
const toVector = (lat: number, lng: number): Vec3 => {
  const phi = lat * RAD;
  const lambda = lng * RAD;
  return [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)];
};
const slerp = (a: Vec3, b: Vec3, t: number): Vec3 => {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return a;
  const s = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
};

export async function setupGlobe(reduced: boolean) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  const raw = (await import('../../data/globe-points.json')).default as number[];
  const land: Vec3[] = [];
  // Modest devices draw every other land dot: the continents still read clearly.
  const step = document.documentElement.classList.contains('lite') ? 4 : 2;
  for (let index = 0; index < raw.length; index += step) land.push(toVector(raw[index], raw[index + 1]));
  const origin = toVector(...ORIGIN);
  const arcs = DESTINATIONS.map((destination, index) => ({ to: toVector(...destination), delay: index * 0.9 }));

  let size = 0;
  let dpr = 1;
  let visible = false;
  let running = false;
  let lastFrame = 0;
  let spin = 0;
  const tilt = -0.32;
  const drag = { active: false, x: 0, velocity: 0 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 1.75);
    size = rect.width;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.width * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced || !running) draw(0);
  };
  const project = (v: Vec3) => {
    const cosY = Math.cos(spin);
    const sinY = Math.sin(spin);
    const x1 = v[0] * cosY + v[2] * sinY;
    const z1 = -v[0] * sinY + v[2] * cosY;
    const cosX = Math.cos(tilt);
    const sinX = Math.sin(tilt);
    const y2 = v[1] * cosX - z1 * sinX;
    const z2 = v[1] * sinX + z1 * cosX;
    return [x1, y2, z2] as Vec3;
  };
  const draw = (time: number) => {
    const radius = size * 0.44;
    const cx = size / 2;
    const cy = size / 2;
    context.clearRect(0, 0, size, size);

    const halo = context.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.25);
    halo.addColorStop(0, 'rgba(120,60,255,0)');
    halo.addColorStop(0.55, 'rgba(120,60,255,0.16)');
    halo.addColorStop(1, 'rgba(120,60,255,0)');
    context.fillStyle = halo;
    context.fillRect(0, 0, size, size);
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(12,10,24,0.72)';
    context.fill();
    context.strokeStyle = 'rgba(167,110,255,0.22)';
    context.lineWidth = 1;
    context.stroke();

    const dot = Math.max(0.9, size / 560);
    for (const point of land) {
      const [x, y, z] = project(point);
      if (z < -0.08) continue;
      const light = 0.25 + Math.max(0, z) * 0.75;
      context.fillStyle = `rgba(${150 + light * 70},${120 + light * 60},255,${0.18 + light * 0.62})`;
      context.fillRect(cx + x * radius - dot / 2, cy - y * radius - dot / 2, dot, dot);
    }

    const seconds = time / 1000;
    for (const arc of arcs) {
      const cycle = 7.2;
      const local = ((seconds - arc.delay) % cycle + cycle) % cycle / 3.2;
      if (local > 1.6) continue;
      const head = Math.min(1, local);
      const tail = Math.max(0, local - 0.6);
      const steps = 42;
      let previous: [number, number, number] | null = null;
      for (let step = 0; step <= steps; step += 1) {
        const t = tail + (head - tail) * (step / steps);
        const v = slerp(origin, arc.to, t);
        const lift = 1 + Math.sin(Math.PI * t) * 0.22;
        const [x, y, z] = project([v[0] * lift, v[1] * lift, v[2] * lift]);
        const screen: [number, number, number] = [cx + x * radius, cy - y * radius, z];
        if (previous && previous[2] > -0.2 && z > -0.2) {
          context.beginPath();
          context.moveTo(previous[0], previous[1]);
          context.lineTo(screen[0], screen[1]);
          context.strokeStyle = `rgba(${190 - step},${110 + step * 2},255,${(step / steps) * 0.85})`;
          context.lineWidth = 1.4;
          context.stroke();
        }
        previous = screen;
      }
      if (previous && previous[2] > -0.2 && head < 1) {
        context.beginPath();
        context.arc(previous[0], previous[1], 2.4, 0, Math.PI * 2);
        context.fillStyle = '#f2e6ff';
        context.shadowColor = '#a755ff';
        context.shadowBlur = 16;
        context.fill();
        context.shadowBlur = 0;
      }
    }

    const [ox, oy, oz] = project(origin);
    if (oz > 0) {
      const pulse = 4 + (Math.sin(seconds * 3) + 1) * 3;
      context.beginPath();
      context.arc(cx + ox * radius, cy - oy * radius, pulse, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(210,150,255,0.55)';
      context.stroke();
      context.beginPath();
      context.arc(cx + ox * radius, cy - oy * radius, 3, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
    }
  };
  const loop = (time: number) => {
    if (!visible || document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    if (time - lastFrame < 33) return;
    const delta = lastFrame ? Math.min(64, time - lastFrame) : 16;
    lastFrame = time;
    if (!drag.active) {
      drag.velocity *= 0.95;
      spin += delta * 0.00011 + drag.velocity;
    }
    draw(time);
  };
  const wake = () => {
    if (reduced || running || !visible || document.hidden) return;
    running = true;
    lastFrame = 0;
    requestAnimationFrame(loop);
  };

  // Start facing the Americas so the origin of every arc is in view.
  spin = 0.85;
  canvas.addEventListener('pointerdown', (event) => { drag.active = true; drag.x = event.clientX; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag.active) return;
    const delta = (event.clientX - drag.x) / size;
    drag.x = event.clientX;
    spin += delta * 3;
    drag.velocity = delta * 0.4;
    if (reduced) draw(0);
  });
  const release = () => { drag.active = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }, { rootMargin: '120px' }).observe(canvas);
  document.addEventListener('visibilitychange', wake);
  addEventListener('resize', resize, { passive: true });
  resize();
}

export function setupClocks() {
  const clocks = document.querySelectorAll<HTMLTimeElement>('[data-tz]');
  if (!clocks.length) return;
  const update = () => clocks.forEach((clock) => {
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat(document.documentElement.lang, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: clock.dataset.tz }).format(now);
    clock.dateTime = now.toISOString();
  });
  update();
  setInterval(update, 20_000);
}
