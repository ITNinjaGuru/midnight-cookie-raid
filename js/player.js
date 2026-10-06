/**
 * Player: chubby cookie-raider in a blue cap.
 * Fat state grows visual weight; thin after a hit while fat.
 */

const Player = {
  create(spawn) {
    return {
      x: spawn.x,
      y: spawn.y,
      w: 22,
      h: 28,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      fat: true,
      runDir: 0, // continuous run until opposite
      invuln: 0,
      anim: 0,
      dead: false,
      wonLevel: false,
    };
  },

  reset(p, spawn) {
    p.x = spawn.x;
    p.y = spawn.y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.fat = true;
    p.runDir = 0;
    p.invuln = 0;
    p.dead = false;
    p.wonLevel = false;
    p.w = 22;
    p.h = 28;
  },

  applyFatSize(p) {
    if (p.fat) {
      p.w = 26;
      p.h = 30;
    } else {
      p.w = 20;
      p.h = 28;
    }
  },

  update(p, input, platforms, dt, worldW) {
    if (p.dead || p.wonLevel) return;

    Player.applyFatSize(p);

    // Continuous run: press L/R or A/D starts run until opposite
    if (input.left && !input.right) p.runDir = -1;
    else if (input.right && !input.left) p.runDir = 1;
    else if (input.left && input.right) {
      // both: prefer most recent via input.lastHoriz if available
      p.runDir = input.lastHoriz || p.runDir;
    }

    const speed = p.fat ? 110 : 140;
    p.vx = p.runDir * speed;

    if (p.runDir !== 0) p.facing = p.runDir;

    // Jump
    if (input.jumpPressed && p.onGround) {
      p.vy = p.fat ? -320 : -360;
      p.onGround = false;
      AudioSys.jump();
    }

    // Gravity
    p.vy += 900 * dt;
    if (p.vy > 520) p.vy = 520;

    p.onGround = false;
    p.x += p.vx * dt;
    solidResolve(p, platforms);
    p.y += p.vy * dt;
    solidResolve(p, platforms);

    // World bounds
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > worldW) p.x = worldW - p.w;
    if (p.y > 600) {
      p.dead = true;
    }

    if (p.invuln > 0) p.invuln -= dt;
    p.anim += dt;
  },

  hit(p) {
    if (p.invuln > 0 || p.dead) return 'none';
    if (p.fat) {
      p.fat = false;
      Player.applyFatSize(p);
      p.invuln = 1.2;
      AudioSys.hurt();
      return 'thin';
    }
    p.dead = true;
    AudioSys.die();
    return 'die';
  },

  makeFat(p) {
    if (!p.fat) {
      p.fat = true;
      Player.applyFatSize(p);
    }
  },

  draw(ctx, p, t) {
    if (p.invuln > 0 && Math.floor(t * 12) % 2 === 0) return;

    const { x, y, w, h, fat, facing, onGround, vy, runDir } = p;
    const walk = runDir !== 0 && onGround ? Math.sin(t * 14) * 2 : 0;

    ctx.save();
    ctx.translate(x + w / 2, y);
    ctx.scale(facing, 1);
    ctx.translate(-w / 2, 0);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h + 2, w / 2 - 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // legs
    ctx.fillStyle = '#2b6cb0';
    ctx.fillRect(4, h - 10, 6, 10 + walk);
    ctx.fillRect(w - 10, h - 10, 6, 10 - walk);
    // shoes
    ctx.fillStyle = '#1a365d';
    ctx.fillRect(3, h - 2, 8, 3);
    ctx.fillRect(w - 11, h - 2, 8, 3);

    // body — fatter when fat
    if (fat) {
      ctx.fillStyle = '#ed8936';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 2, w / 2 - 1, h / 2 - 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // shirt stripe
      ctx.fillStyle = '#dd6b20';
      ctx.fillRect(3, h / 2, w - 6, 5);
    } else {
      ctx.fillStyle = '#ed8936';
      ctx.fillRect(4, 10, w - 8, h - 18);
      ctx.fillStyle = '#dd6b20';
      ctx.fillRect(4, h / 2, w - 8, 4);
    }

    // arms
    ctx.fillStyle = '#f6ad55';
    const armY = onGround ? 14 : (vy < 0 ? 10 : 16);
    ctx.fillRect(-2, armY, 5, 10);
    ctx.fillRect(w - 3, armY, 5, 10);

    // head
    const headW = fat ? w - 6 : w - 8;
    const headX = (w - headW) / 2;
    ctx.fillStyle = '#fbd38d';
    ctx.fillRect(headX, 0, headW, 12);

    // blue cap (generic, original design)
    ctx.fillStyle = '#3182ce';
    ctx.fillRect(headX - 1, -2, headW + 2, 6);
    ctx.fillStyle = '#2b6cb0';
    ctx.fillRect(headX + headW - 2, 0, 8, 3); // brim to the front (facing+)
    // cap button
    ctx.fillStyle = '#63b3ed';
    ctx.beginPath();
    ctx.arc(w / 2, -2, 2, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(w / 2 - 4, 4, 3, 3);
    ctx.fillRect(w / 2 + 2, 4, 3, 3);
    // smile / cheeks
    if (fat) {
      ctx.fillStyle = '#fc8181';
      ctx.beginPath();
      ctx.arc(headX + 2, 8, 2, 0, Math.PI * 2);
      ctx.arc(headX + headW - 2, 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, 8, 3, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.restore();
  },
};
