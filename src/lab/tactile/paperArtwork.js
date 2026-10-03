import * as THREE from 'three';

const CREAM = '#f0eddf';
const INK = '#282b27';
const RED = '#d83e2e';

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}

function text(ctx, value, x, y, font, color) {
  ctx.fillStyle = color; ctx.font = font; ctx.fillText(value, x, y);
}

export function makePaperTexture(index) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = index === 2 ? 520 : 1280;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = index === 0 ? RED : index === 1 ? CREAM : INK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const foreground = index === 1 ? INK : CREAM;
  const smallFont = '500 19px "Geist Variable", Arial, sans-serif';
  text(ctx, 'DAMON GUO-SIYI', 60, 70, smallFont, foreground);
  text(ctx, `RESEARCH / 0${index + 1}`, 690, 70, smallFont, foreground);
  line(ctx, 60, 96, 900, 96, foreground, 1.5);

  if (index === 0) {
    text(ctx, 'Agents', 47, 320, '196px Georgia, serif', CREAM);
    text(ctx, 'that act.', 47, 505, 'italic 183px Georgia, serif', CREAM);
    text(ctx, 'FROM REASONING TO REAL OPERATIONS', 60, 580, smallFont, CREAM);
    // A printed route diagram, with a clear decision fork and human handoff.
    const points = [[116, 700], [474, 700], [474, 885], [825, 885], [825, 1065]];
    for (let n = 0; n < points.length - 1; n++) {
      line(ctx, ...points[n], ...points[n + 1], CREAM, 4);
    }
    line(ctx, 474, 885, 116, 885, CREAM, 4);
    line(ctx, 116, 885, 116, 1065, CREAM, 4);
    points.forEach(([x, y], i) => {
      ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 || i === 4 ? CREAM : RED; ctx.fill();
      ctx.strokeStyle = CREAM; ctx.lineWidth = 4; ctx.stroke();
    });
    text(ctx, 'PLAN', 60, 650, smallFont, CREAM);
    text(ctx, 'ACT', 517, 860, smallFont, CREAM);
    text(ctx, 'HANDOFF', 155, 1068, smallFont, CREAM);
    line(ctx, 60, 1140, 900, 1140, CREAM, 1.5);
    text(ctx, 'SUPPLY CHAIN AGENT SYSTEM', 60, 1190, smallFont, CREAM);
    text(ctx, 'PRODUCTION / ALIBABA', 60, 1228, smallFont, CREAM);
    text(ctx, '↗', 829, 1220, '65px Arial, sans-serif', CREAM);
  } else if (index === 1) {
    text(ctx, 'THE TOOL', 52, 251, 'bold 114px "Geist Variable", Arial, sans-serif', INK);
    text(ctx, 'INDEX', 52, 360, 'bold 114px "Geist Variable", Arial, sans-serif', INK);
    text(ctx, 'A CHANGING WORLD. A CHANGING TOOLKIT.', 60, 413, smallFont, INK);
    for (let i = 0; i < 5; i++) {
      const y = 498 + i * 103;
      line(ctx, 60, y, 900, y, '#a6a69b', 1);
      text(ctx, `0${i + 1}`, 60, y + 66, '36px Georgia, serif', RED);
      text(ctx, ['Resolve', 'Select', 'Execute', 'Observe', 'Replan'][i], 170, y + 66, '44px Georgia, serif', INK);
      text(ctx, ['SEARCH', 'ANALYZE', 'TOOL USE', 'FEEDBACK', 'RECOVER'][i], 685, y + 59, smallFont, INK);
    }
    text(ctx, '100+', 52, 1165, 'bold 139px "Geist Variable", Arial, sans-serif', RED);
    text(ctx, 'TOOLS / ONE AGENT', 480, 1137, smallFont, INK);
    text(ctx, 'DYNAMIC TOOL RESOLUTION', 60, 1230, smallFont, INK);
  } else {
    text(ctx, 'Beyond the answer.', 52, 237, 'italic 88px Georgia, serif', CREAM);
    text(ctx, 'MULTI-TURN AGENT EVALUATION', 60, 300, smallFont, CREAM);
    line(ctx, 60, 342, 900, 342, CREAM, 1);
    text(ctx, '250', 56, 462, '100px Georgia, serif', CREAM);
    text(ctx, 'PAPERS REVIEWED', 264, 413, smallFont, CREAM);
    text(ctx, 'PLAN → ACT → REMEMBER → EVALUATE', 264, 454, smallFont, CREAM);
    ctx.beginPath(); ctx.arc(836, 420, 48, 0, Math.PI * 2);
    ctx.strokeStyle = RED; ctx.lineWidth = 11; ctx.stroke();
  }
  // Fine deterministic paper fibres remain quiet behind the printed content.
  for (let i = 0; i < 8500; i++) {
    const x = ((i * 137.507764) % 960);
    const y = ((i * 79.331) % canvas.height);
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.037)' : 'rgba(0,0,0,.024)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
