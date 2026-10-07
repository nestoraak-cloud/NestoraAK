import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Delhi-NCR-at-dusk skyline. No assets: windows are a canvas
// texture, the city is ~100 boxes, the camera is driven by scroll progress.
// Lazy-loaded from SkylineSection so three.js stays out of the main bundle.

const FOG = '#2b1a0e';
const TIERS = [
  { w: 14, h: 30, y0: 0 },
  { w: 10, h: 22, y0: 30 },
  { w: 6, h: 14, y0: 52 },
];

const rng = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const sm = (t) => t * t * (3 - 2 * t);
const kf = (p, [a, b, c]) =>
  p < 0.5 ? THREE.MathUtils.lerp(a, b, sm(p * 2)) : THREE.MathUtils.lerp(b, c, sm(p * 2 - 1));

// 8x16 grid of windows, ~38% lit warm. One tile; buildings repeat/offset it.
function makeWindowTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#17120e';
  g.fillRect(0, 0, 128, 256);
  const r = rng(7);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 8; x++) {
      const lit = r() < 0.38;
      g.fillStyle = lit ? (r() < 0.2 ? '#fff1d0' : '#ffb55a') : '#241b14';
      g.fillRect(x * 16 + 3, y * 16 + 4, 10, 8);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function sideMaterial(tex, w, h, ox, oy, glow, rough, metal) {
  const t = tex.clone();
  t.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 8)));
  t.offset.set(ox, oy);
  t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    map: t,
    emissiveMap: t,
    emissive: '#ffffff',
    emissiveIntensity: glow,
    roughness: rough,
    metalness: metal,
  });
}

function Building({ lot, tex, roof }) {
  const mats = useMemo(() => {
    const side = sideMaterial(tex, lot.w, lot.h, lot.ox, lot.oy, 1.15, 0.65, 0.25);
    return [side, side, roof, roof, side, side];
  }, [lot, tex, roof]);
  return (
    <mesh position={[lot.x, lot.h / 2, lot.z]} material={mats}>
      <boxGeometry args={[lot.w, lot.h, lot.w * 0.9]} />
    </mesh>
  );
}

function City() {
  const { tex, roof, lots } = useMemo(() => {
    const tex = makeWindowTexture();
    const roof = new THREE.MeshStandardMaterial({ color: '#1a1511', roughness: 0.9 });
    const r = rng(42);
    const lots = [];
    for (let gx = -5; gx <= 5; gx++) {
      for (let gz = -5; gz <= 5; gz++) {
        if (Math.abs(gx) <= 2 && Math.abs(gz) <= 2) continue; // plaza for the hero tower
        const dist = Math.hypot(gx, gz);
        if (dist > 4.2 && r() < 0.3) continue;
        lots.push({
          x: gx * 9 + (r() - 0.5) * 2.4,
          z: gz * 9 + (r() - 0.5) * 2.4,
          w: 4 + r() * 2.5,
          h: 5 + Math.pow(r(), 1.6) * (36 - dist * 3.2),
          ox: Math.floor(r() * 8) / 8,
          oy: Math.floor(r() * 16) / 16,
        });
      }
    }
    return { tex, roof, lots };
  }, []);

  return lots.map((lot, i) => <Building key={i} lot={lot} tex={tex} roof={roof} />);
}

function Tower() {
  const beacon = useRef();
  const mats = useMemo(() => {
    const tex = makeWindowTexture();
    const roof = new THREE.MeshStandardMaterial({ color: '#1a1511', roughness: 0.9 });
    return TIERS.map((t) => {
      const side = sideMaterial(tex, t.w, t.h, 0, 0, 1.4, 0.35, 0.5);
      return [side, side, roof, roof, side, side];
    });
  }, []);

  useFrame(({ clock }) => {
    if (beacon.current) beacon.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.2) * 0.25);
  });

  return (
    <group>
      {TIERS.map((t, i) => (
        <group key={i}>
          <mesh position={[0, t.y0 + t.h / 2, 0]} material={mats[i]}>
            <boxGeometry args={[t.w, t.h, t.w]} />
          </mesh>
          {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], j) => (
            <mesh key={j} position={[(sx * t.w) / 2, t.y0 + t.h / 2, (sz * t.w) / 2]}>
              <boxGeometry args={[0.35, t.h, 0.35]} />
              <meshBasicMaterial color="#ffb86a" toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 72, 0]}>
        <cylinderGeometry args={[0.15, 0.5, 12, 8]} />
        <meshStandardMaterial color="#cbbba5" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh ref={beacon} position={[0, 78.5, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#ffae5c" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 76, 0]} intensity={3500} decay={2} color="#ffae5c" />
    </group>
  );
}

function Embers() {
  const ref = useRef();
  const pos = useMemo(() => {
    const r = rng(9);
    const a = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      a[i * 3] = (r() - 0.5) * 130;
      a[i * 3 + 1] = r() * 70;
      a[i * 3 + 2] = (r() - 0.5) * 130;
    }
    return a;
  }, []);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffb36b"
        size={0.45}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Sky dome: horizon colour == fog colour, so the ground fades seamlessly
// into it; darkens toward the zenith.
function Sky() {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(900, 32, 16);
    const pos = g.attributes.position;
    const from = new THREE.Color(FOG);
    const to = new THREE.Color('#07060a');
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp((pos.getY(i) / 900) * 2.2, 0, 1);
      c.copy(from).lerp(to, sm(t));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

// Aerial -> mid orbit -> street-level looking up the tower, all off scroll.
function Rig({ progress }) {
  const cur = useRef(0);
  useFrame((state, dt) => {
    cur.current = THREE.MathUtils.damp(cur.current, progress.current, 4, dt);
    const p = cur.current;
    const a = kf(p, [-0.5, 0.9, 2.2]) + state.pointer.x * 0.08;
    const r = kf(p, [115, 50, 20]);
    const y = kf(p, [70, 24, 3]) + state.pointer.y * 1.5;
    state.camera.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    state.camera.lookAt(0, kf(p, [22, 28, 46]), 0);
  });
  return null;
}

export default function SkylineScene({ progress, active }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 0.5, far: 1200, position: [0, 58, 92] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <fog attach="fog" args={[FOG, 60, 240]} />
      <ambientLight intensity={0.5} color="#9aa0c8" />
      <directionalLight position={[-60, 25, -40]} intensity={2.4} color="#ffb067" />
      <directionalLight position={[50, 40, 60]} intensity={0.5} color="#7f8cff" />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#120d09" roughness={0.95} />
      </mesh>
      <gridHelper args={[240, 48, '#d97f2e', '#4a3320']} position-y={0.02} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[11.8, 12.2, 96]} />
        <meshBasicMaterial color="#ffb86a" toneMapped={false} />
      </mesh>

      <Sky />
      <City />
      <Tower />
      <Embers />
      <Rig progress={progress} />
    </Canvas>
  );
}
