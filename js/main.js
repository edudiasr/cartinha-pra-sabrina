(() => {
  const TARGET = new Date("2026-09-05T23:00:00-03:00");
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  const gate = document.getElementById("gate");
  const openBtn = document.getElementById("open-letter");
  const page = document.getElementById("page");
  const field = document.getElementById("heart-field");
  const balloon = document.getElementById("balloon");
  const memory = document.getElementById("memory");
  const balloonHint = document.getElementById("balloon-hint");
  const gift = document.getElementById("gift-unlocked");

  const COLORS = ["#00e676", "#39ff88", "#b9ffd3", "#ffffff", "#c8a24a", "#00c853"];
  let pieces = [];
  let running = false;
  let last = 0;

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const burst = (x, y, count = 140, power = 11) => {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * power + 3;
      pieces.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        g: 0.18 + Math.random() * 0.08,
        w: 4 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
        decay: 0.006 + Math.random() * 0.01,
        shape: Math.random() > 0.72 ? "heart" : "rect",
      });
    }
    running = true;
  };

  const drawHeart = (px, py, size, color, rot) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size, -size * 0.4, -size * 0.5, -size, 0, -size * 0.45);
    ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.4, 0, size * 0.3);
    ctx.fill();
    ctx.restore();
  };

  const tick = (t) => {
    if (!running) return;
    const dt = Math.min((t - last) / 16.67, 2.5);
    last = t;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces = pieces.filter((p) => p.life > 0);
    for (const p of pieces) {
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;
      ctx.globalAlpha = Math.max(p.life, 0);
      if (p.shape === "heart") {
        drawHeart(p.x, p.y, p.w, p.color, p.rot);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (pieces.length) requestAnimationFrame(tick);
    else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  const explode = (x, y, count, power) => {
    burst(x, y, count, power);
    last = performance.now();
    requestAnimationFrame(tick);
  };

  const spawnFloatHeart = () => {
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = Math.random() > 0.2 ? "❤" : "💚";
    h.style.left = `${6 + Math.random() * 88}%`;
    h.style.bottom = "-24px";
    h.style.fontSize = `${12 + Math.random() * 18}px`;
    h.style.animationDuration = `${8 + Math.random() * 10}s`;
    h.style.opacity = "0.85";
    h.addEventListener("click", (ev) => {
      ev.stopPropagation();
      explode(ev.clientX, ev.clientY, 36, 7);
      popAt(ev.clientX, ev.clientY);
      h.remove();
    });
    field.appendChild(h);
    setTimeout(() => h.remove(), 18000);
  };

  const popAt = (x, y) => {
    const n = 5 + ((Math.random() * 4) | 0);
    for (let i = 0; i < n; i += 1) {
      const el = document.createElement("span");
      el.className = "pop-heart";
      el.textContent = "❤";
      el.style.left = `${x + (Math.random() - 0.5) * 40}px`;
      el.style.top = `${y + (Math.random() - 0.5) * 24}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
  };

  const pad = (n) => String(n).padStart(2, "0");

  const renderCountdown = () => {
    const now = Date.now();
    const diff = TARGET.getTime() - now;
    if (diff <= 0) {
      document.getElementById("cd-h").textContent = "00";
      document.getElementById("cd-m").textContent = "00";
      document.getElementById("cd-s").textContent = "00";
      gift.hidden = false;
      return false;
    }
    const totalSec = Math.floor(diff / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    document.getElementById("cd-h").textContent = pad(hours);
    document.getElementById("cd-m").textContent = pad(mins);
    document.getElementById("cd-s").textContent = pad(secs);
    return true;
  };

  const startCountdown = () => {
    if (!renderCountdown()) {
      explode(window.innerWidth / 2, window.innerHeight * 0.72, 160, 12);
      return;
    }
    const id = setInterval(() => {
      if (!renderCountdown()) {
        clearInterval(id);
        explode(window.innerWidth / 2, window.innerHeight * 0.72, 180, 12);
      }
    }, 250);
  };

  const openLetter = () => {
    if (openLetter.done) return;
    openLetter.done = true;
    explode(window.innerWidth / 2, window.innerHeight * 0.42, 180, 13);
    gate.classList.add("is-out");
    page.hidden = false;
    document.body.classList.remove("is-locked");
    setTimeout(() => gate.remove(), 1000);
    startCountdown();
    for (let i = 0; i < 10; i += 1) setTimeout(spawnFloatHeart, i * 280);
    setInterval(spawnFloatHeart, 1400);
  };

  document.body.classList.add("is-locked");
  openBtn.addEventListener("click", openLetter);
  openBtn.addEventListener("pointerup", openLetter);

  balloon.addEventListener("click", () => {
    if (balloon.classList.contains("is-popped")) return;
    const rect = balloon.getBoundingClientRect();
    explode(rect.left + rect.width / 2, rect.top + 40, 90, 9);
    balloon.classList.add("is-popped");
    balloon.setAttribute("aria-expanded", "true");
    balloonHint.textContent = "essa memória é só nossa";
    memory.hidden = false;
    memory.classList.add("is-in");
  });

  document.addEventListener("pointerdown", (ev) => {
    if (gate.isConnected && !gate.classList.contains("is-out")) return;
    if (ev.target.closest("button, a")) return;
    popAt(ev.clientX, ev.clientY);
  });

  window.addEventListener("resize", resize);
  resize();
  explode(window.innerWidth / 2, window.innerHeight * 0.28, 120, 10);
})();
