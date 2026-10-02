import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const cobalt = 0x1847e9;
const coral = 0xf25b40;
const acid = 0xdaf34d;

const physical = (color, options = {}) => new THREE.MeshPhysicalMaterial({
  color,
  metalness: 0.1,
  roughness: 0.36,
  clearcoat: 0.35,
  ...options,
});

function sphere(radius, material, parent, position) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function tube(points, radius, material, parent) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 10, false), material);
  mesh.castShadow = true;
  parent.add(mesh);
  return { curve, mesh };
}

function createPath() {
  const group = new THREE.Group();
  const sculpture = new THREE.Group();
  sculpture.rotation.set(-0.12, -0.32, 0.14);
  group.add(sculpture);

  const shell = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.23, 0.19, 180, 24, 2, 3),
    physical(0xb9a37b, { metalness: 0.79, roughness: 0.18, clearcoat: 1 }),
  );
  shell.rotation.set(0.34, 0.2, -0.19);
  shell.castShadow = true;
  sculpture.add(shell);
  const heart = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 48, 36),
    physical(0xd7eb5d, { metalness: 0.26, roughness: 0.11, emissive: 0x7d9815, emissiveIntensity: 0.38, clearcoat: 1 }),
  );
  heart.position.z = 0.18;
  sculpture.add(heart);

  const rings = [
    { radius: 2.65, tube: 0.082, color: 0xd9c5a4, tilt: [-0.48, 0.18, 0.3] },
    { radius: 2.92, tube: 0.056, color: 0xf4e7ce, tilt: [0.46, -0.66, -0.34] },
    { radius: 2.36, tube: 0.052, color: acid, tilt: [0.92, 0.28, -0.16] },
  ].map(({ radius, tube: thickness, color, tilt }) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, thickness, 16, 128),
      physical(color, { metalness: color === acid ? 0.18 : 0.75, roughness: 0.19, emissive: color === acid ? acid : 0x000000, emissiveIntensity: color === acid ? 0.35 : 0 }),
    );
    ring.rotation.set(...tilt);
    ring.castShadow = true;
    sculpture.add(ring);
    return ring;
  });

  const nodePositions = [[-2.4, 0.95, 0.9], [2.15, 1.52, 1.05], [1.1, -2.05, 1.7], [-1.4, -2.42, 0.35]];
  const nodes = nodePositions.map((position, index) => {
    const node = sphere(0.18, physical(index === 0 ? acid : 0xf7e7c9, {
      metalness: 0.28, roughness: 0.17, emissive: index === 0 ? acid : 0x312919, emissiveIntensity: index === 0 ? 0.65 : 0.16,
    }), sculpture, position);
    const socket = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.025, 8, 40),
      physical(0xceb88c, { metalness: 0.8, roughness: 0.24 }),
    );
    socket.position.copy(node.position);
    socket.rotation.set(0.7 + index * 0.5, 0.4, index * 0.5);
    sculpture.add(socket);
    return { node, socket };
  });
  const threads = [
    [[-2.4, 0.95, 0.9], [-1.05, 1.2, 1.9], [0, 0.8, 1.6], [2.15, 1.52, 1.05]],
    [[2.15, 1.52, 1.05], [2.45, 0.1, 2.05], [1.75, -1.1, 2], [1.1, -2.05, 1.7]],
    [[1.1, -2.05, 1.7], [0.25, -1.68, 2.15], [-0.8, -2.2, 1.1], [-1.4, -2.42, 0.35]],
  ];
  threads.forEach((points, index) => tube(points, 0.028, physical(index === 1 ? acid : 0xffdeb0, {
    metalness: 0.4, roughness: 0.25, emissive: index === 1 ? 0x758a1c : 0x49320f, emissiveIntensity: 0.75,
  }), sculpture));

  return {
    group,
    layout: { desktop: [3.45, 0.2, 1.04], mobile: [0, -2.2, 0.56] },
    update(time, step, motion) {
      sculpture.rotation.y = -0.32 + (motion ? time * 0.11 : 0);
      sculpture.rotation.z = 0.14 + (motion ? Math.sin(time * 0.38) * 0.035 : 0);
      rings[0].rotation.x = -0.48 + (motion ? time * 0.13 : 0);
      rings[1].rotation.y = -0.66 - (motion ? time * 0.11 : 0);
      rings[2].rotation.z = -0.16 + (motion ? time * 0.16 : 0);
      nodes.forEach(({ node, socket }, index) => {
        const selected = index === step;
        const scale = selected ? 1.42 + (motion ? Math.sin(time * 3) * 0.08 : 0) : 0.85;
        node.scale.setScalar(scale);
        socket.scale.setScalar(selected ? 1.2 : 0.82);
        node.material.color.setHex(selected ? acid : 0xf7e7c9);
        node.material.emissive.setHex(selected ? acid : 0x312919);
      });
    },
  };
}

function noteTexture(index) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = index === 0 ? '#f0eadd' : index === 1 ? '#e2e1da' : '#d5d9db';
  ctx.fillRect(0, 0, 768, 1024);
  ctx.fillStyle = index === 0 ? '#e8543d' : '#1748c6';
  ctx.fillRect(72, 74, 47, 10);
  ctx.font = '700 24px Arial';
  ctx.letterSpacing = '5px';
  ctx.fillText('FIELD NOTES   /   0' + (index + 1), 141, 91);
  ctx.fillStyle = '#171717';
  ctx.font = '600 75px Georgia';
  ctx.fillText(index === 0 ? 'The handoff' : index === 1 ? 'Tool use' : 'Evaluation', 72, 260);
  ctx.font = '28px Georgia';
  ctx.fillText('A trace through the system', 74, 311);
  ctx.strokeStyle = 'rgba(31,54,108,.42)';
  ctx.lineWidth = 2;
  for (let line = 0; line < 10; line += 1) {
    const y = 395 + line * 48;
    ctx.beginPath(); ctx.moveTo(74, y); ctx.lineTo(694 - (line % 3) * 66, y); ctx.stroke();
  }
  ctx.strokeStyle = index === 0 ? '#e8543d' : '#1748c6';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(586, 795, 75, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#1e49c3';
  ctx.font = '700 23px Arial';
  ctx.fillText(['PLAN  /  ACT  /  VERIFY', 'RESOLVE  /  SELECT', 'OBSERVE  /  LEARN'][index], 74, 909);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function curvedPaper(width, height) {
  const geometry = new THREE.PlaneGeometry(width, height, 32, 32);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, 0.09 * x * x + 0.12 * Math.sin(y * 1.5 + x * 0.6));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createField() {
  const group = new THREE.Group();
  const stack = new THREE.Group();
  stack.rotation.set(-0.08, -0.2, -0.08);
  group.add(stack);
  const sheets = [2, 1, 0].map((index) => {
    const sheet = new THREE.Group();
    const page = new THREE.Mesh(curvedPaper(3.7, 4.95), physical(0xffffff, {
      map: noteTexture(index), metalness: 0, roughness: 0.8, clearcoat: 0.08, side: THREE.DoubleSide,
    }));
    page.castShadow = true;
    page.receiveShadow = true;
    sheet.add(page);
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 4.9, 0.11),
      physical(index === 0 ? coral : cobalt, { metalness: 0, roughness: 0.57 }),
    );
    spine.position.set(-1.82, 0, 0.02);
    sheet.add(spine);
    sheet.position.set((2 - index) * 0.29, (2 - index) * 0.11, (2 - index) * 0.22);
    sheet.rotation.z = (2 - index) * -0.075;
    stack.add(sheet);
    return sheet;
  });
  const seal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.06, 64),
    physical(coral, { metalness: 0, roughness: 0.42 }),
  );
  seal.rotation.x = Math.PI / 2;
  seal.position.set(1.08, -1.51, 0.62);
  stack.add(seal);
  const sealCenter = sphere(0.2, physical(0xffe8da, { roughness: 0.5 }), stack, [1.08, -1.51, 0.68]);
  sealCenter.scale.z = 0.35;

  return {
    group,
    layout: { desktop: [3.5, -0.1, 1.16], mobile: [0.18, -2.13, 0.51] },
    update(time, step, motion) {
      stack.rotation.y = -0.2 + (motion ? Math.sin(time * 0.4) * 0.07 : 0);
      stack.rotation.x = -0.08 + (motion ? Math.sin(time * 0.5) * 0.025 : 0);
      sheets.forEach((sheet, order) => {
        const open = step > 0;
        const spread = open ? 1.75 : 0.82;
        const targetX = order * 0.44 * spread;
        const targetY = order * 0.12 * spread;
        const targetZ = order * 0.35 * spread;
        const easing = motion ? 0.08 : 1;
        sheet.position.x += (targetX - sheet.position.x) * easing;
        sheet.position.y += (targetY - sheet.position.y) * easing;
        sheet.position.z += (targetZ - sheet.position.z) * easing;
        sheet.rotation.z += ((order * -0.08 - (open ? order * 0.06 : 0)) - sheet.rotation.z) * easing;
      });
      seal.rotation.z = motion ? Math.sin(time * 0.65) * 0.06 : 0;
    },
  };
}

function createWorld() {
  const group = new THREE.Group();
  const city = new THREE.Group();
  city.rotation.set(0.63, -0.48, -0.06);
  group.add(city);
  const stone = physical(0xf6f4ff, { metalness: 0.05, roughness: 0.72 });
  const blue = physical(0x1748ce, { metalness: 0.34, roughness: 0.28, emissive: 0x1031a0, emissiveIntensity: 0.18 });
  const orange = physical(0xf4784f, { metalness: 0.08, roughness: 0.5 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(6.5, 0.32, 4.3, 3, 0.09), stone);
  base.position.y = -1.56;
  base.receiveShadow = true;
  base.castShadow = true;
  city.add(base);
  const inset = new THREE.Mesh(new THREE.BoxGeometry(6.15, 0.035, 3.95), physical(0xe2e3fb, { roughness: 0.82 }));
  inset.position.y = -1.375;
  inset.receiveShadow = true;
  city.add(inset);
  const buildings = [
    [-2.2, -1.2, 1.25, 0.85, 0.82],
    [-0.65, -1.08, 1.8, 1.1, 0.94],
    [1.45, -1.1, 1.1, 1.24, 0.9],
    [-2.15, 1.1, 0.95, 1.1, 0.85],
    [0.05, 1.05, 1.22, 1.28, 0.92],
    [2.18, 1, 1.58, 0.88, 0.78],
  ];
  buildings.forEach(([x, z, height, width, depth], index) => {
    const building = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 3, 0.055), physical(index % 3 === 1 ? 0xcfd8ff : 0xfffcf7, {
      metalness: 0.04, roughness: 0.48, clearcoat: 0.42,
    }));
    building.position.set(x, -1.36 + height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    city.add(building);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.68, 0.045, depth * 0.67), index % 2 ? orange : blue);
    roof.position.set(x, -1.32 + height, z);
    city.add(roof);
    for (let level = 0; level < Math.floor(height * 3); level += 1) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(width * 0.61, 0.045, 0.012), blue);
      window.position.set(x, -1.13 + level * 0.24, z + depth / 2 + 0.009);
      city.add(window);
    }
  });
  const routes = [
    [[-2.9, -1.32, 0.05], [-1.7, -1.32, 0.05], [-0.6, -1.32, 0.1], [0.6, -1.32, 0.18], [2.85, -1.32, 0.18]],
    [[-2.8, -1.31, 0.5], [-1.3, -1.31, 0.55], [0.12, -1.31, 0.5], [1.6, -1.31, 0.62], [2.8, -1.31, 0.62]],
    [[-2.8, -1.3, -0.35], [-1.5, -1.3, -0.45], [-0.2, -1.3, -0.65], [1.4, -1.3, -0.4], [2.85, -1.3, -0.28]],
  ].map((points, index) => tube(points, 0.045, physical(index === 1 ? coral : cobalt, {
    metalness: 0.12, roughness: 0.23, emissive: index === 1 ? coral : cobalt, emissiveIntensity: 0.48,
  }), city));
  const parcel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), orange);
  parcel.castShadow = true;
  city.add(parcel);
  const carriers = [0.16, 0.58].map((progress, index) => {
    const carrier = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.43, 0.16, 0.33, 2, 0.05), index ? blue : orange);
    body.castShadow = true;
    carrier.add(body);
    const cargo = new THREE.Mesh(new RoundedBoxGeometry(0.23, 0.22, 0.22, 2, 0.025), stone);
    cargo.position.y = 0.17;
    carrier.add(cargo);
    city.add(carrier);
    return { carrier, progress };
  });
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.42, 0.7, 32),
    physical(cobalt, { metalness: 0.5, roughness: 0.22, emissive: cobalt, emissiveIntensity: 0.26 }),
  );
  beacon.position.set(-0.65, 1, -1.08);
  city.add(beacon);
  sphere(0.22, physical(0xfef6e8, { emissive: 0xffcf82, emissiveIntensity: 0.9, roughness: 0.2 }), city, [-0.65, 1.46, -1.08]);

  return {
    group,
    layout: { desktop: [3.5, 0.2, 1.12], mobile: [0.18, 0.12, 0.46] },
    update(time, step, motion) {
      city.rotation.y = -0.48 + (motion ? Math.sin(time * 0.27) * 0.075 : 0);
      const selected = routes[step % routes.length];
      const point = selected.curve.getPointAt(motion ? (time * 0.18) % 1 : 0.47);
      parcel.position.copy(point);
      parcel.position.y += 0.22;
      parcel.rotation.y = motion ? time * 0.65 : 0.25;
      carriers.forEach(({ carrier, progress }, index) => {
        carrier.position.copy(routes[(step + index) % routes.length].curve.getPointAt(motion ? (progress + time * 0.085) % 1 : progress));
        carrier.position.y += 0.13;
      });
      routes.forEach((route, index) => { route.mesh.material.emissiveIntensity = index === step ? 0.95 : 0.13; });
    },
  };
}

export function createSculpture(kind, scene) {
  const light = new THREE.HemisphereLight(kind === 'path' ? 0xffe8b7 : 0xffffff, kind === 'path' ? 0x202515 : 0xb0b5d5, kind === 'path' ? 2.3 : kind === 'field' ? 1.25 : 2.1);
  scene.add(light);
  const key = new THREE.DirectionalLight(kind === 'path' ? 0xfff0d5 : 0xffffff, kind === 'path' ? 4.4 : kind === 'field' ? 1.7 : 3.1);
  key.position.set(-3, 6, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const rim = new THREE.DirectionalLight(kind === 'world' ? 0x5976ff : kind === 'field' ? 0xf77956 : 0xc6da65, 2.6);
  rim.position.set(5, -2, -5);
  scene.add(rim);
  const sculpture = kind === 'path' ? createPath() : kind === 'field' ? createField() : createWorld();
  scene.add(sculpture.group);
  return sculpture;
}
