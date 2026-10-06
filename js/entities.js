/**
 * Game entities: cookies, drinks, guards, dogs, vats, mashers, exits.
 * All visuals drawn with canvas primitives (original art).
 */

function drawCookie(ctx, x, y, r, t) {
  const bob = Math.sin(t * 4) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#c4782a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a05e1a';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,220,150,0.35)';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFizzy(ctx, x, y, t) {
  const bob = Math.sin(t * 5 + 1) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  // can body
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(-6, -10, 12, 18);
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(-6, -10, 12, 4);
  ctx.fillStyle = '#eee';
  ctx.fillRect(-4, -4, 8, 6);
  // bubbles
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(-2, -14 - Math.sin(t * 8) * 2, 1.5, 0, Math.PI * 2);
  ctx.arc(2, -16 - Math.cos(t * 7) * 2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuard(ctx, g, t) {
  const { x, y, w, h, facing, knocked, knockTimer } = g;
  if (knocked) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-w / 2, -h / 2);
    // slumped body
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(2, 8, w - 4, h - 10);
    ctx.fillStyle = '#e8c4a0';
    ctx.fillRect(4, 0, w - 8, 10);
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(2, -2, w - 4, 5);
    // Zzz
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('z', w, 4 + Math.sin(t * 3) * 2);
    ctx.restore();
    return;
  }
  const walk = Math.sin(t * 8) * 2;
  ctx.save();
  ctx.translate(x, y);
  // legs
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(4, h - 10, 6, 10 + walk);
  ctx.fillRect(w - 10, h - 10, 6, 10 - walk);
  // body (uniform)
  ctx.fillStyle = '#718096';
  ctx.fillRect(2, 10, w - 4, h - 18);
  // badge
  ctx.fillStyle = '#f6e05e';
  ctx.fillRect(w / 2 - 3, 16, 6, 6);
  // head
  ctx.fillStyle = '#e8c4a0';
  ctx.fillRect(4, 0, w - 8, 12);
  // helmet
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(2, -2, w - 4, 6);
  // eyes looking facing
  ctx.fillStyle = '#1a202c';
  if (facing > 0) {
    ctx.fillRect(w - 10, 4, 3, 3);
    ctx.fillRect(w - 16, 4, 3, 3);
  } else {
    ctx.fillRect(6, 4, 3, 3);
    ctx.fillRect(12, 4, 3, 3);
  }
  ctx.restore();
}

function drawDog(ctx, d, t) {
  const { x, y, w, h, awake, facing } = d;
  ctx.save();
  ctx.translate(x, y);
  if (!awake) {
    // sleeping curled
    ctx.fillStyle = '#8b6914';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 6, w / 2 - 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a07828';
    ctx.beginPath();
    ctx.arc(w / 2 + (facing > 0 ? 6 : -6), h - 10, 6, 0, Math.PI * 2);
    ctx.fill();
    // Zzz
    ctx.fillStyle = '#cbd5e0';
    ctx.font = '9px monospace';
    ctx.fillText('Z', w / 2 + 8, h - 18 - Math.sin(t * 2) * 2);
  } else {
    const bark = Math.sin(t * 12) > 0;
    // body
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(2, 6, w - 4, h - 10);
    // legs
    ctx.fillStyle = '#6b5010';
    ctx.fillRect(4, h - 6, 5, 6);
    ctx.fillRect(w - 10, h - 6, 5, 6);
    // head
    ctx.fillStyle = '#a07828';
    const hx = facing > 0 ? w - 14 : 2;
    ctx.fillRect(hx, 0, 12, 10);
    // ear
    ctx.fillStyle = '#6b5010';
    ctx.fillRect(hx + (facing > 0 ? 8 : 0), -4, 4, 6);
    // eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(hx + (facing > 0 ? 7 : 3), 3, 3, 3);
    ctx.fillStyle = '#c53030';
    ctx.fillRect(hx + (facing > 0 ? 8 : 4), 4, 2, 2);
    // bark lines
    if (bark) {
      ctx.strokeStyle = '#e53e3e';
      ctx.lineWidth = 1;
      const bx = facing > 0 ? w : 0;
      ctx.beginPath();
      ctx.moveTo(bx, 4);
      ctx.lineTo(bx + facing * 8, 2);
      ctx.moveTo(bx, 7);
      ctx.lineTo(bx + facing * 10, 7);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawVat(ctx, v, t) {
  const { x, y, w, h } = v;
  // rim
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(x, y, w, 6);
  // purple goo
  const swirl = Math.sin(t * 2) * 3;
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(x + 3, y + 6, w - 6, h - 6);
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 10);
  for (let i = 0; i <= 8; i++) {
    const px = x + 3 + ((w - 6) * i) / 8;
    const py = y + 10 + Math.sin(t * 3 + i + swirl) * 3;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + w - 3, y + h);
  ctx.lineTo(x + 3, y + h);
  ctx.closePath();
  ctx.fill();
  // bubbles
  ctx.fillStyle = 'rgba(196,181,253,0.5)';
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y + 20 + Math.sin(t * 4) * 4, 3, 0, Math.PI * 2);
  ctx.arc(x + w * 0.7, y + 28 + Math.cos(t * 3) * 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // danger label
  ctx.fillStyle = '#f6e05e';
  ctx.font = '8px monospace';
  ctx.fillText('ACID', x + w / 2 - 10, y + 4);
}

function drawMasher(ctx, m) {
  const { x, y, w, crushY, shaftTop, bladeH } = m;
  // shaft
  ctx.fillStyle = '#718096';
  ctx.fillRect(x + w / 2 - 4, shaftTop, 8, crushY - shaftTop);
  // blade / crusher head
  ctx.fillStyle = '#a0aec0';
  ctx.fillRect(x, crushY, w, bladeH);
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(x + 2, crushY + bladeH - 4, w - 4, 4);
  // spikes
  ctx.fillStyle = '#2d3748';
  for (let i = 0; i < 4; i++) {
    const sx = x + 6 + i * (w / 4);
    ctx.beginPath();
    ctx.moveTo(sx, crushY + bladeH);
    ctx.lineTo(sx + 5, crushY + bladeH + 8);
    ctx.lineTo(sx + 10, crushY + bladeH);
    ctx.fill();
  }
  // ceiling mount
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(x - 4, shaftTop - 4, w + 8, 6);
}

function drawExit(ctx, e, t) {
  const { x, y, w, h } = e;
  const glow = 0.5 + Math.sin(t * 3) * 0.3;
  // door frame
  ctx.fillStyle = '#d69e2e';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 4);
  // door
  ctx.fillStyle = '#744210';
  ctx.fillRect(x, y, w, h);
  // cookie emblem
  ctx.fillStyle = `rgba(246,224,94,${glow})`;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 - 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c4782a';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 - 4, 7, 0, Math.PI * 2);
  ctx.fill();
  // handle
  ctx.fillStyle = '#f6e05e';
  ctx.fillRect(x + w - 10, y + h / 2, 4, 8);
  // EXIT
  ctx.fillStyle = '#f6e05e';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('EXIT', x + w / 2 - 12, y + h - 6);
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function solidResolve(ent, platforms) {
  // Simple AABB resolution against platform list {x,y,w,h}
  for (const p of platforms) {
    if (!aabb(ent, p)) continue;
    const overlapL = ent.x + ent.w - p.x;
    const overlapR = p.x + p.w - ent.x;
    const overlapT = ent.y + ent.h - p.y;
    const overlapB = p.y + p.h - ent.y;
    const minX = Math.min(overlapL, overlapR);
    const minY = Math.min(overlapT, overlapB);
    if (minY < minX) {
      if (overlapT < overlapB) {
        ent.y = p.y - ent.h;
        ent.vy = 0;
        ent.onGround = true;
      } else {
        ent.y = p.y + p.h;
        if (ent.vy < 0) ent.vy = 0;
      }
    } else {
      if (overlapL < overlapR) {
        ent.x = p.x - ent.w;
      } else {
        ent.x = p.x + p.w;
      }
      ent.vx = 0;
    }
  }
}
