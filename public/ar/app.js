import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const $ = (id) => document.getElementById(id);
const video = $('cam');
const canvas = $('stage');

// ---------- three.js stage ----------
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6a5a, 2.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(1.5, 3, 3);
scene.add(keyLight);

const VIEW_H = 2.5;                  // metres of world visible vertically
const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
const anchor = new THREE.Group();     // user-controlled position / size
const turn = new THREE.Group();       // faces the camera
anchor.add(turn);
scene.add(anchor);

let model, mixer, rootBone, morphMeshes = [];
let actA, actB, clipDur = 18.33;

// pose loops (seconds in the clip)
const POSES = {
  wave: [2.2, 4.2],
  heart: [4.75, 5.3],
  clap: [7.45, 8.35],
  proud: [9.4, 10.6],
};

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const dist = VIEW_H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const camY = 0.30 * VIEW_H;
  camera.position.set(0, camY, dist);
  camera.lookAt(0, camY, 0);
  camera.updateProjectionMatrix();
  if (!anchor.userData.placed) {
    const viewW = VIEW_H * camera.aspect;
    anchor.position.set(Math.min(viewW * 0.22, 0.6), 0, 0);
  }
}
window.addEventListener('resize', resize);
resize();

// ---------- load Habbouk ----------
const draco = new DRACOLoader();
draco.setDecoderPath('./lib/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);

const audio = new Audio('assets/welcome.mp3');   // fallback player
audio.preload = 'auto';

// ---------- voice + a smooth clock the animation follows ----------
// The mouth and body follow this clock. Media-element currentTime updates in
// coarse steps on many phones, which made the mouth stick then jump, so the
// voice plays through Web Audio and the clock advances every frame and is only
// nudged toward the audio's own time.
const AC = window.AudioContext || window.webkitAudioContext;
const voiceData = fetch('assets/welcome.mp3').then((r) => r.arrayBuffer()).catch(() => null);
const voice = { ctx: null, buf: null, src: null, start: 0, mode: 'el', t: 0, last: 0 };

function unlockVoice() {           // must run synchronously inside the tap
  audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
  if (AC && !voice.ctx) { try { voice.ctx = new AC(); } catch { voice.ctx = null; } }
  if (voice.ctx) {
    voice.ctx.resume().catch(() => {});
    const b = voice.ctx.createBuffer(1, 1, 22050);
    const s = voice.ctx.createBufferSource();
    s.buffer = b; s.connect(voice.ctx.destination); s.start(0);
  }
}
async function prepareVoice() {
  if (!voice.ctx || voice.buf) return;
  const data = await voiceData;
  if (!data) return;
  voice.buf = await new Promise((res) => {
    try {
      const p = voice.ctx.decodeAudioData(data.slice(0), res, () => res(null));
      if (p && p.catch) p.catch(() => res(null));
    } catch { res(null); }
  });
}
function playVoice() {
  stopVoice();
  voice.t = 0;
  voice.last = performance.now();
  if (voice.buf) {
    const s = voice.ctx.createBufferSource();
    s.buffer = voice.buf;
    s.connect(voice.ctx.destination);
    voice.start = voice.ctx.currentTime + 0.05;
    s.start(voice.start);
    voice.src = s;
    voice.mode = 'ctx';
  } else {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    voice.mode = 'el';
  }
}
function stopVoice() {
  if (voice.src) { try { voice.src.stop(); } catch { /* already stopped */ } voice.src = null; }
  audio.pause();
}
function voiceTime(now) {
  const dt = Math.min(0.1, (now - voice.last) / 1000);
  voice.last = now;
  let ref = null;
  if (voice.mode === 'ctx') ref = voice.ctx.currentTime - voice.start;
  else if (!audio.paused) ref = audio.currentTime;
  const buffering = voice.mode === 'el' && !audio.paused && audio.readyState < 3;
  if (!buffering) voice.t += dt;
  if (ref !== null) {
    const err = ref - voice.t;
    if (Math.abs(err) > 0.25) voice.t = ref;      // big gap (tab was hidden, seek): jump
    else voice.t += err * 0.08;                   // small gap: drift back gently
  }
  return Math.max(0, voice.t);
}

// Habbouk talks while he loads
const LINES = [
  'مرحباً! أنا حبّوك، أرتّب تاجي وأجيء إليك…',
  'أقفز من بين صفحات القصة…',
  'أبحث عن أجمل ابتسامة للصورة…',
  'اقتربت كثيراً! لحظة واحدة…',
];
let line = 0;
const bubble = $('bubble');
function say(text) {
  bubble.classList.add('fade');
  setTimeout(() => { bubble.textContent = text; bubble.classList.remove('fade'); }, 300);
}
// fallback rotation, only used when the download size is unknown
let sizeKnown = false;
const talk = setInterval(() => { if (!sizeKnown && line < LINES.length - 1) { line += 1; say(LINES[line]); } }, 4000);
const toArabicDigits = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

loader.load('assets/habbouk.glb', (gltf) => {
  model = gltf.scene;
  turn.add(model);
  turn.rotation.y = -Math.PI / 2 - 0.25;   // model faces +X in Blender -> face the camera, slightly toward the child
  rootBone = model.getObjectByName('Root');
  model.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = false;
      if (o.morphTargetInfluences) morphMeshes.push(o);
    }
  });
  mixer = new THREE.AnimationMixer(model);
  const clip = gltf.animations[0];
  clipDur = clip.duration;
  actA = mixer.clipAction(clip);
  actB = mixer.clipAction(clip.clone());
  for (const a of [actA, actB]) { a.play(); a.paused = true; }
  actB.setEffectiveWeight(0);
  setTime(actA, 0);
  $('bar').style.width = '100%';
  $('pct').textContent = '١٠٠٪';
  clearInterval(talk);
  say('وصلت! اضغط «ابدأ» لنلتقط صورة معاً.');
  $('startLabel').textContent = 'ابدأ';
  $('startBtn').disabled = false;
}, (e) => {
  if (e.total) {
    const pc = Math.round((e.loaded / e.total) * 100);
    $('bar').style.width = pc + '%';
    $('pct').textContent = toArabicDigits(pc) + '٪';
    sizeKnown = true;
    const want = Math.min(LINES.length - 1, Math.floor(pc / 25));
    if (want > line) { line = want; say(LINES[line]); }
  }
}, () => {
  clearInterval(talk);
  say('أوه! تعثّرتُ في الطريق… أعد تحميل الصفحة.');
  $('startLabel').textContent = 'تعذّر تحميل حبّوك، أعد تحميل الصفحة';
});

function setTime(action, t) {
  action.time = Math.max(0, Math.min(clipDur - 0.001, t));
}

// keep him standing at the anchor no matter where the clip walked him
const tmp = new THREE.Vector3();
function pinRoot() {
  if (!rootBone) return;
  model.position.set(0, 0, 0);
  model.updateMatrixWorld(true);
  rootBone.getWorldPosition(tmp);
  turn.worldToLocal(tmp);
  model.position.set(-tmp.x, 0, -tmp.z);
}

// ---------- modes ----------
let mode = 'idle';           // idle | welcome | pose
let poseName = 'wave', prevPose = null, fade = 1, phase = 0;
let lastT = performance.now();

function poseTime(name, ph) {
  const [a, b] = POSES[name];
  return a + (b - a) * (0.5 - 0.5 * Math.cos(ph));
}

function startWelcome() {
  mode = 'welcome';
  actA.setEffectiveWeight(1); actB.setEffectiveWeight(0);
  playVoice();
  $('skipBtn').classList.remove('hidden');
  $('poses').classList.add('hidden');
}

function startPoses(name = poseName) {
  stopVoice();
  const from = mode === 'pose' ? poseName : null;
  mode = 'pose';
  prevPose = from;
  poseName = name;
  fade = from ? 0 : 1;
  phase = 0;
  $('skipBtn').classList.add('hidden');
  $('poses').classList.remove('hidden');
  document.querySelectorAll('.pose').forEach((b) => b.classList.toggle('active', b.dataset.pose === name));
}

function tick(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  if (mixer) {
    if (mode === 'welcome') {
      const t = voiceTime(now);
      setTime(actA, t);
      if (t >= clipDur - 0.05) startPoses('wave');
    } else if (mode === 'pose') {
      phase += dt * (Math.PI * 2 / 2.6);
      fade = Math.min(1, fade + dt / 0.45);
      setTime(actA, poseTime(poseName, phase));
      if (prevPose) setTime(actB, poseTime(prevPose, phase));
      actA.setEffectiveWeight(fade);
      actB.setEffectiveWeight(prevPose ? 1 - fade : 0);
    }
    mixer.update(0);
    if (mode !== 'welcome') morphMeshes.forEach((m) => m.morphTargetInfluences.fill(0));
    pinRoot();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- camera ----------
let facing = 'user', stream = null;
async function openCamera() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
    audio: false,
  });
  video.srcObject = stream;
  video.classList.toggle('mirror', facing === 'user');
  await video.play().catch(() => {});
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('show', s.id === id));
}

if (/FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat|TikTok/i.test(navigator.userAgent)) {
  $('inapp').classList.remove('hidden');
}

async function begin() {
  unlockVoice();                     // inside the tap (iOS)
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('nocam');
    await openCamera();
  } catch (e) {
    $('errorText').textContent = e && e.message === 'nocam'
      ? 'هذا المتصفح لا يدعم الكاميرا. افتح الصفحة في Safari أو Chrome.'
      : 'اسمح للصفحة باستخدام الكاميرا لتلتقط صورة مع حبّوك، ثم أعد المحاولة.';
    showScreen('errorBox');
    return;
  }
  await prepareVoice();
  showScreen(null);
  $('hud').classList.remove('hidden');
  $('shotBtn').disabled = false;
  startWelcome();
  setTimeout(() => { $('hint').style.opacity = 0; }, 7000);
}

$('startBtn').addEventListener('click', begin);
$('retryBtn').addEventListener('click', begin);
$('skipBtn').addEventListener('click', () => startPoses('wave'));
$('replayBtn').addEventListener('click', startWelcome);
document.querySelectorAll('.pose').forEach((b) => b.addEventListener('click', () => startPoses(b.dataset.pose)));
$('flipBtn').addEventListener('click', async () => {
  facing = facing === 'user' ? 'environment' : 'user';
  try { await openCamera(); } catch { facing = facing === 'user' ? 'environment' : 'user'; }
});

// ---------- move / resize Habbouk with fingers ----------
const pointers = new Map();
let pinchStart = 0, scaleStart = 1;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [p, q] = [...pointers.values()];
    pinchStart = Math.hypot(p.x - q.x, p.y - q.y);
    scaleStart = anchor.scale.x;
  }
});
canvas.addEventListener('pointermove', (e) => {
  const prev = pointers.get(e.pointerId);
  if (!prev) return;
  const cur = { x: e.clientX, y: e.clientY };
  pointers.set(e.pointerId, cur);
  if (pointers.size === 1) {
    const perPx = VIEW_H / window.innerHeight;
    anchor.position.x += (cur.x - prev.x) * perPx;
    anchor.position.y -= (cur.y - prev.y) * perPx;
    anchor.userData.placed = true;
    $('hint').style.opacity = 0;
  } else if (pointers.size === 2 && pinchStart) {
    const [p, q] = [...pointers.values()];
    const s = THREE.MathUtils.clamp(scaleStart * Math.hypot(p.x - q.x, p.y - q.y) / pinchStart, 0.5, 2.2);
    anchor.scale.setScalar(s);
  }
});
const lift = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = 0; };
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);

// ---------- photo ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let photoBlob = null, photoUrl = null;

$('shotBtn').addEventListener('click', async () => {
  $('shotBtn').disabled = true;
  if (mode === 'welcome') startPoses(poseName);
  for (const n of ['3', '2', '1']) { $('count').textContent = n; await sleep(800); }
  $('count').textContent = '';
  const flash = $('flash');
  flash.classList.add('on');
  photoBlob = await compose();
  requestAnimationFrame(() => flash.classList.remove('on'));
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(photoBlob);
  $('photo').src = photoUrl;
  $('saveBtn').href = photoUrl;
  const file = new File([photoBlob], 'hobka-habbouk.jpg', { type: 'image/jpeg' });
  $('shareBtn').classList.toggle('hidden', !(navigator.canShare && navigator.canShare({ files: [file] })));
  showScreen('result');
  $('shotBtn').disabled = false;
});

$('shareBtn').addEventListener('click', async () => {
  const file = new File([photoBlob], 'hobka-habbouk.jpg', { type: 'image/jpeg' });
  try { await navigator.share({ files: [file], title: 'أنا وحبّوك' }); } catch { /* cancelled */ }
});
$('againBtn').addEventListener('click', () => showScreen(null));

const logoImg = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = '/brand/logo-rose.svg'; });

async function compose() {
  await document.fonts.load('800 40px Baloo').catch(() => {});
  const W = canvas.width, H = canvas.height;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  // camera frame, same crop as on screen (object-fit: cover)
  const vw = video.videoWidth || W, vh = video.videoHeight || H;
  const s = Math.max(W / vw, H / vh);
  const dw = vw * s, dh = vh * s;
  ctx.save();
  if (facing === 'user') { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
  // Habbouk
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, W, H);
  // frame: brand burgundy band with the hobka logo, soft rose border (same look as the website)
  const u = Math.min(W, H) / 100;
  const bandH = u * 17;
  const grad = ctx.createLinearGradient(0, H - bandH * 1.7, 0, H);
  grad.addColorStop(0, 'rgba(78,13,28,0)');
  grad.addColorStop(0.45, 'rgba(78,13,28,.55)');
  grad.addColorStop(1, 'rgba(78,13,28,.9)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, H - bandH * 1.7, W, bandH * 1.7);
  ctx.lineWidth = u * 1.6;
  ctx.strokeStyle = '#f3cad6';
  roundRect(ctx, u * 2.4, u * 2.4, W - u * 4.8, H - u * 4.8, u * 6);
  ctx.stroke();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.round(u * 7.2)}px Baloo, Tahoma, sans-serif`;
  ctx.fillText('أنا وحبّوك', W / 2, H - bandH * 0.95);
  const logo = await logoImg;
  if (logo) {
    const lw = u * 24, lh = lw * (logo.naturalHeight / logo.naturalWidth || 0.34);
    ctx.drawImage(logo, (W - lw) / 2, H - bandH * 0.74, lw, lh);
  }
  return new Promise((r) => out.toBlob(r, 'image/jpeg', 0.92));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
