/**
 * Midnight Cookie Raid — main loop, state machine, rendering, input.
 * Inspired by classic 1990s browser factory-raid platformers (mechanics homage only).
 */

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 640;
  const H = 360;
  canvas.width = W;
  canvas.height = H;

  // Letterbox fit
  function resize() {
    const wrap = document.getElementById('game-wrap');
    const rw = wrap.clientWidth;
    const rh = wrap.clientHeight;
    const scale = Math.min(rw / W, rh / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- State ----
  const STATE = { TITLE: 0, PLAY: 1, PAUSE: 2, DEAD: 3, LEVELCLEAR: 4, GAMEOVER: 5, WIN: 6 };
  let state = STATE.TITLE;
  let levelIndex = 0;
  let level = null;
  let player = null;
  let score = 0;
  let lives = 3;
  let fizzy = 0;
  let cameraX = 0;
  let time = 0;
  let stateTimer = 0;
  let message = '';

  const input = {
    left: false, right: false, jump: false, jumpPressed: false,
    burp: false, burpPressed: false, lastHoriz: 0,
  };
  let jumpLatch = false;
  let burpLatch = false;

  function startGame() {
    score = 0;
    lives = 3;
    fizzy = 1;
    levelIndex = 0;
    loadLevel(0);
    state = STATE.PLAY;
    AudioSys.unlock();
    AudioSys.select();
  }

  function loadLevel(idx) {
    levelIndex = idx;
    level = cloneLevel(idx);
    player = Player.create(level.spawn);
    cameraX = 0;
    time = 0;
  }

  function nextLevel() {
    lives += 1; // completing a level grants +1 life
    if (levelIndex >= LEVELS.length - 1) {
      state = STATE.WIN;
      AudioSys.win();
      return;
    }
    loadLevel(levelIndex + 1);
    state = STATE.PLAY;
  }

  // ---- Input ----
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyD','KeyP'].includes(e.code)) {
      e.preventDefault();
    }
    AudioSys.unlock();

    if (state === STATE.TITLE && (e.code === 'Enter' || e.code === 'Space')) {
      startGame();
      return;
    }
    if (state === STATE.GAMEOVER || state === STATE.WIN) {
      if (e.code === 'Enter' || e.code === 'Space') {
        state = STATE.TITLE;
        AudioSys.select();
      }
      return;
    }
    if (state === STATE.LEVELCLEAR) return;
    if (state === STATE.DEAD) return;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (state === STATE.PLAY) { state = STATE.PAUSE; AudioSys.select(); }
      else if (state === STATE.PAUSE) { state = STATE.PLAY; AudioSys.select(); }
    }
    if (e.code === 'KeyM') {
      const on = AudioSys.toggle();
      message = on ? 'Sound ON' : 'Sound OFF';
      stateTimer = 1;
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // Mobile buttons
  function bindBtn(id, down, up) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = (ev) => { ev.preventDefault(); down(); };
    const end = (ev) => { ev.preventDefault(); up(); };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  }
  let mobLeft = false, mobRight = false, mobJump = false, mobBurp = false;
  bindBtn('btn-left', () => { mobLeft = true; }, () => { mobLeft = false; });
  bindBtn('btn-right', () => { mobRight = true; }, () => { mobRight = false; });
  bindBtn('btn-jump', () => { mobJump = true; }, () => { mobJump = false; });
  bindBtn('btn-burp', () => { mobBurp = true; }, () => { mobBurp = false; });
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (state === STATE.TITLE) startGame();
      else if (state === STATE.GAMEOVER || state === STATE.WIN) state = STATE.TITLE;
    });
  }

  function pollInput() {
    const left = !!(keys['ArrowLeft'] || keys['KeyA'] || mobLeft);
    const right = !!(keys['ArrowRight'] || keys['KeyD'] || mobRight);
    if (left && !input.left) input.lastHoriz = -1;
    if (right && !input.right) input.lastHoriz = 1;
    input.left = left;
    input.right = right;

    const jump = !!(keys['ArrowUp'] || keys['KeyW'] || mobJump);
    input.jumpPressed = jump && !jumpLatch;
    jumpLatch = jump;
    input.jump = jump;

    const burp = !!(keys['Space'] || mobBurp);
    input.burpPressed = burp && !burpLatch;
    burpLatch = burp;
    input.burp = burp;
  }

  // ---- Entity updates ----
  function updateGuards(dt) {
    for (const g of level.guards) {
      if (g.knocked) {
        g.knockTimer -= dt;
        if (g.knockTimer <= 0) g.knocked = false;
        continue;
      }
      g.x += g.vx * dt;
      if (g.x < g.minX) { g.x = g.minX; g.vx = Math.abs(g.speed); g.facing = 1; }
      if (g.x + g.w > g.maxX) { g.x = g.maxX - g.w; g.vx = -Math.abs(g.speed); g.facing = -1; }
      g.facing = g.vx >= 0 ? 1 : -1;
    }
  }

  function updateDogs(dt) {
    for (const d of level.dogs) {
      const cx = d.x + d.w / 2;
      const px = player.x + player.w / 2;
      const dist = Math.abs(cx - px);
      if (!d.awake && dist < d.wakeRadius && Math.abs(d.y - player.y) < 60) {
        d.awake = true;
        d.facing = px > cx ? 1 : -1;
        AudioSys.bark();
        d.barkTimer = 0.4;
      }
      if (d.awake) {
        d.facing = px > cx ? 1 : -1;
        d.barkTimer -= dt;
        if (d.barkTimer <= 0) {
          AudioSys.bark();
          d.barkTimer = 0.8 + Math.random() * 0.4;
        }
      }
    }
  }

  function updateMashers(dt) {
    for (const m of level.mashers) {
      m.crushY += m.dir * m.speed * dt;
      if (m.crushY >= m.rangeMax) { m.crushY = m.rangeMax; m.dir = -1; AudioSys.mash(); }
      if (m.crushY <= m.rangeMin) { m.crushY = m.rangeMin; m.dir = 1; }
    }
  }

  function doBurp() {
    if (fizzy <= 0) return;
    fizzy -= 1;
    AudioSys.burp();
    // Knock out all on-screen guards
    const viewL = cameraX;
    const viewR = cameraX + W;
    for (const g of level.guards) {
      if (g.knocked) continue;
      if (g.x + g.w > viewL && g.x < viewR) {
        g.knocked = true;
        g.knockTimer = 4;
        AudioSys.guardHit();
      }
    }
    // Briefly scare dogs on screen
    for (const d of level.dogs) {
      if (d.x + d.w > viewL && d.x < viewR) {
        d.awake = false;
        d.barkTimer = 0;
      }
    }
  }

  function checkPickups() {
    const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (const c of level.cookies) {
      if (c.collected) continue;
      if (aabb(pb, { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 })) {
        c.collected = true;
        score += 100;
        Player.makeFat(player);
        AudioSys.cookie();
      }
    }
    for (const f of level.fizzies) {
      if (f.collected) continue;
      if (aabb(pb, { x: f.x - 8, y: f.y - 12, w: 16, h: 24 })) {
        f.collected = true;
        fizzy += 1;
        AudioSys.fizzy();
      }
    }
  }

  function checkHazards() {
    const pb = { x: player.x + 2, y: player.y + 2, w: player.w - 4, h: player.h - 2 };

    // Exit
    if (aabb(pb, level.exit)) {
      player.wonLevel = true;
      state = STATE.LEVELCLEAR;
      stateTimer = 2;
      AudioSys.levelClear();
      return;
    }

    // Vats — instant kill
    for (const v of level.vats) {
      if (aabb(pb, v)) {
        player.dead = true;
        AudioSys.die();
        return;
      }
    }

    // Mashers — instant kill if blade overlaps
    for (const m of level.mashers) {
      const blade = { x: m.x, y: m.crushY, w: m.w, h: m.bladeH + 8 };
      if (aabb(pb, blade)) {
        player.dead = true;
        AudioSys.die();
        AudioSys.mash();
        return;
      }
    }

    // Guards
    for (const g of level.guards) {
      if (g.knocked) continue;
      if (aabb(pb, g)) {
        const r = Player.hit(player);
        if (r === 'die') return;
        // bounce slightly
        player.vx = (player.x < g.x ? -1 : 1) * 80;
        player.runDir = player.x < g.x ? -1 : 1;
      }
    }

    // Dogs
    for (const d of level.dogs) {
      if (!d.awake) {
        // stepping on sleeping dog wakes it; contact still hurts if overlapping tightly
        if (aabb(pb, d)) {
          d.awake = true;
          AudioSys.bark();
        }
        continue;
      }
      if (aabb(pb, d)) {
        const r = Player.hit(player);
        if (r === 'die') return;
      }
    }
  }

  function handleDeath() {
    lives -= 1;
    if (lives < 0) {
      state = STATE.GAMEOVER;
      AudioSys.gameOver();
      return;
    }
    // respawn on same level, fat again
    Player.reset(player, level.spawn);
    player.fat = true;
    Player.applyFatSize(player);
    // reset dogs wake? keep; reset knocked guards
    level.guards.forEach((g) => { g.knocked = false; });
    cameraX = 0;
    state = STATE.PLAY;
    stateTimer = 1.5;
    message = 'Ouch!';
  }

  // ---- Update ----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    if (stateTimer > 0) stateTimer -= dt;

    pollInput();

    if (state === STATE.PLAY) {
      if (input.burpPressed) doBurp();
      Player.update(player, input, level.platforms, dt, level.width);
      updateGuards(dt);
      updateDogs(dt);
      updateMashers(dt);
      checkPickups();
      if (!player.dead) checkHazards();

      // camera
      const target = player.x + player.w / 2 - W * 0.4;
      cameraX += (target - cameraX) * Math.min(1, dt * 6);
      cameraX = Math.max(0, Math.min(cameraX, level.width - W));

      if (player.dead) {
        state = STATE.DEAD;
        stateTimer = 1.2;
      }
    } else if (state === STATE.DEAD) {
      if (stateTimer <= 0) handleDeath();
    } else if (state === STATE.LEVELCLEAR) {
      if (stateTimer <= 0) nextLevel();
    }

    draw();
    requestAnimationFrame(frame);
  }

  // ---- Draw helpers ----
  function drawBackground() {
    // dark factory
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#0f1419');
    grd.addColorStop(1, '#1a2332');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // parallax pipes / girders
    ctx.strokeStyle = '#2a3544';
    ctx.lineWidth = 2;
    const off = cameraX * 0.3;
    for (let i = -1; i < 8; i++) {
      const x = ((i * 120) - (off % 120));
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x + 40, 40);
      ctx.lineTo(x + 40, 100);
      ctx.stroke();
      ctx.fillStyle = '#1e2a38';
      ctx.fillRect(x + 10, 60, 80, 8);
    }
    // floor haze
    ctx.fillStyle = 'rgba(40,50,70,0.4)';
    ctx.fillRect(0, GROUND_Y + 20, W, H - GROUND_Y);
  }

  function drawPlatforms() {
    for (const p of level.platforms) {
      const sx = p.x - cameraX;
      if (sx + p.w < 0 || sx > W) continue;
      // colorful foreground platforms
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = '#f6ad55';
      ctx.fillRect(sx, p.y, p.w, 4);
      ctx.fillStyle = '#ed8936';
      for (let i = 0; i < p.w; i += 16) {
        ctx.fillRect(sx + i, p.y + 4, 8, 3);
      }
      // rivets
      ctx.fillStyle = '#cbd5e0';
      ctx.fillRect(sx + 4, p.y + 8, 3, 3);
      ctx.fillRect(sx + p.w - 7, p.y + 8, 3, 3);
    }
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 28);

    ctx.fillStyle = '#f6e05e';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('SCORE ' + String(score).padStart(6, '0'), 8, 18);

    // lives as heads
    ctx.fillText('LIVES', 130, 18);
    for (let i = 0; i < Math.max(0, lives); i++) {
      const hx = 175 + i * 14;
      ctx.fillStyle = '#3182ce';
      ctx.fillRect(hx, 6, 10, 5);
      ctx.fillStyle = '#fbd38d';
      ctx.fillRect(hx + 1, 10, 8, 8);
    }

    ctx.fillStyle = '#68d391';
    ctx.fillText('FIZZY x' + fizzy, 280, 18);

    ctx.fillStyle = '#90cdf4';
    ctx.fillText(level.name.toUpperCase(), 380, 18);

    ctx.fillStyle = player.fat ? '#ed8936' : '#a0aec0';
    ctx.fillText(player.fat ? 'FAT' : 'THIN', 580, 18);

    if (message && stateTimer > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(message, W / 2, 50);
      ctx.textAlign = 'left';
    }
  }

  function drawTitle() {
    drawBackground();
    // decorative cookies
    for (let i = 0; i < 6; i++) {
      drawCookie(ctx, 60 + i * 100, 80 + Math.sin(time * 2 + i) * 10, 12, time);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f6ad55';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('MIDNIGHT COOKIE RAID', W / 2, 140);

    ctx.fillStyle = '#90cdf4';
    ctx.font = '12px monospace';
    ctx.fillText('A chubby cookie-raider vs. the night shift', W / 2, 165);

    // hero preview
    const preview = { x: W / 2 - 13, y: 185, w: 26, h: 30, fat: true, facing: 1, onGround: true, vy: 0, runDir: 0, invuln: 0 };
    Player.draw(ctx, preview, time);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px monospace';
    ctx.fillText('Press ENTER or SPACE to start', W / 2, 250);

    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px monospace';
    ctx.fillText('Arrows/AD move (hold to run)  ·  W/Up jump  ·  Space burp  ·  P pause  ·  M mute', W / 2, 280);
    ctx.fillText('Eat cookies to stay fat · Fizzy drinks fuel your burp · Reach the EXIT', W / 2, 300);
    ctx.fillStyle = '#718096';
    ctx.font = '10px monospace';
    ctx.fillText('Inspired by classic 1990s browser factory-raid platformers', W / 2, 330);
    ctx.textAlign = 'left';
  }

  function drawOverlay(title, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f6e05e';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(title, W / 2, H / 2 - 10);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px monospace';
    ctx.fillText(sub, W / 2, H / 2 + 20);
    ctx.textAlign = 'left';
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;

    if (state === STATE.TITLE) {
      drawTitle();
      return;
    }

    drawBackground();
    ctx.save();
    // world
    drawPlatforms();

    for (const v of level.vats) {
      drawVat(ctx, { ...v, x: v.x - cameraX }, time);
    }
    for (const m of level.mashers) {
      drawMasher(ctx, { ...m, x: m.x - cameraX });
    }
    for (const c of level.cookies) {
      if (!c.collected) drawCookie(ctx, c.x - cameraX, c.y, c.r, time);
    }
    for (const f of level.fizzies) {
      if (!f.collected) drawFizzy(ctx, f.x - cameraX, f.y, time);
    }
    for (const g of level.guards) {
      drawGuard(ctx, { ...g, x: g.x - cameraX }, time);
    }
    for (const d of level.dogs) {
      drawDog(ctx, { ...d, x: d.x - cameraX }, time);
    }
    drawExit(ctx, { ...level.exit, x: level.exit.x - cameraX }, time);

    // player in world space
    const pp = { ...player, x: player.x - cameraX };
    Player.draw(ctx, pp, time);

    // burp flash
    if (input.burp && fizzy >= 0 && state === STATE.PLAY) {
      // handled on press; optional lingering mist
    }

    ctx.restore();
    drawHUD();

    if (state === STATE.PAUSE) {
      drawOverlay('PAUSED', 'Press P to resume');
    } else if (state === STATE.LEVELCLEAR) {
      drawOverlay('LEVEL CLEAR!', '+1 Life  ·  ' + level.name);
    } else if (state === STATE.GAMEOVER) {
      drawOverlay('GAME OVER', 'Score ' + score + '  ·  Enter to return');
    } else if (state === STATE.WIN) {
      drawOverlay('VAULT CRACKED!', 'You raided every cookie! Score ' + score);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#68d391';
      ctx.font = '12px monospace';
      ctx.fillText('The night shift never saw it coming.', W / 2, H / 2 + 48);
      ctx.fillStyle = '#a0aec0';
      ctx.fillText('Press ENTER for title', W / 2, H / 2 + 70);
      ctx.textAlign = 'left';
      // victory cookies
      for (let i = 0; i < 8; i++) {
        drawCookie(ctx, 50 + i * 75, 60, 10, time + i);
      }
    } else if (state === STATE.DEAD) {
      ctx.fillStyle = 'rgba(120,0,0,0.25)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Boot
  requestAnimationFrame(frame);
})();
