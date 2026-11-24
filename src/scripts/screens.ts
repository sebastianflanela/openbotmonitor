import { tasksByFace, featuredTasks } from "../data/demo-tasks";
import type { FaceId } from "../data/faces";

type Agent = { name: string; avatar: string; color: string; working: boolean };
const agents: Agent[] = [
  { name: "Błądysław", avatar: "vita", color: "#67ddb5", working: true },
  { name: "Pan Ogarnę", avatar: "cloe", color: "#c9a3ee", working: true },
  { name: "Zaraz Będzie", avatar: "nexo", color: "#72a7ef", working: false },
  { name: "Doktor Jakoś", avatar: "fred", color: "#eda66e", working: true },
];

type HitArea = readonly [x: number, y: number, width: number, height: number];
const soloAreas: HitArea[] = [[0, 30, 320, 200]];
const pairAreas: HitArea[] = [
  [10, 32, 146, 196],
  [164, 32, 146, 196],
];
const hitAreas: Record<FaceId, HitArea[]> = {
  hero: soloAreas,
  equalizer: soloAreas,
  cosmos: soloAreas,
  radar: soloAreas,
  waves: soloAreas,
  spectrum: soloAreas,
  orbitals: soloAreas,
  rings: soloAreas,
  pulse: soloAreas,
  duo: pairAreas,
  grid: [
    [10, 31, 146, 94],
    [164, 31, 146, 94],
    [10, 132, 146, 94],
    [164, 132, 146, 94],
  ],
  op1: [
    [10, 34, 92, 87],
    [218, 34, 92, 87],
    [10, 131, 92, 87],
    [218, 131, 92, 87],
  ],
  cow: [
    [16, 175, 64, 65],
    [88, 175, 64, 65],
    [160, 175, 64, 65],
    [232, 175, 64, 65],
  ],
  terminal: [
    [7, 61, 306, 32],
    [7, 95, 306, 32],
    [7, 129, 306, 32],
    [7, 163, 306, 32],
  ],
  orbit: soloAreas,
  split: pairAreas,
  quiet: soloAreas,
};

function getAgentIndices(face: string, selectionTime: number) {
  const rotation = Math.floor(selectionTime / 5);
  if (["hero", "orbit", "quiet", "equalizer", "cosmos", "radar", "waves", "spectrum", "orbitals", "rings", "pulse"].includes(face))
    return [rotation % agents.length];
  if (["duo", "split"].includes(face)) {
    const first = (rotation % 2) * 2;
    return [first, first + 1];
  }
  return agents.map((_, index) => index);
}
type TouchScreen = {
  root: HTMLElement;
  targets: HTMLElement;
  panel: HTMLElement;
  cursor: HTMLElement;
  selected: number | null;
  manual: boolean;
  startedAt: number;
  overviewTime: number;
  rotationOffset: number;
  targetKey: string;
  shownTask: number | null;
  face: string;
  statusLayer: HTMLElement | null;
};

const touchScreens = new Map<HTMLCanvasElement, TouchScreen>();

function showTasks(screen: TouchScreen, agentIndex: number | null) {
  screen.panel.hidden = agentIndex === null;
  screen.targets.hidden = agentIndex !== null;
  if (screen.statusLayer) screen.statusLayer.hidden = agentIndex !== null;
  screen.root.dataset.screen = agentIndex === null ? "overview" : "tasks";
  if (screen.shownTask === agentIndex) return;
  screen.shownTask = agentIndex;
  if (agentIndex === null) return;
  const agent = agents[agentIndex];
  const examples = screen.root.closest(".featured")
    ? featuredTasks
    : tasksByFace[screen.face as FaceId];
  const task = examples[agentIndex];
  screen.panel.style.setProperty("--agent-color", agent.color);
  screen.panel.querySelector(".task-agent-name")!.textContent = agent.name;
  screen.panel.querySelector(".task-status-label")!.textContent = agent.working
    ? "TERAZ · PRACUJE"
    : "OSTATNIE ZADANIE";
  screen.panel.querySelector(".task-current-title")!.textContent = task.current;
  screen.panel.querySelector(".task-detail")!.textContent = task.detail;
  screen.panel.querySelector(".task-count")!.textContent = String(
    task.queue.length,
  );
  const list = screen.panel.querySelector("ul")!;
  list.replaceChildren();
  for (const title of task.queue.length
    ? task.queue
    : ["Brak oczekujących zadań"]) {
    const item = document.createElement("li");
    item.textContent = title;
    list.append(item);
  }
}

function updateTouchScreen(canvas: HTMLCanvasElement, time: number) {
  const screen = touchScreens.get(canvas);
  if (!screen) return time;
  if (screen.face !== canvas.dataset.face) {
    screen.manual = false;
    screen.selected = null;
    screen.startedAt = time;
    screen.rotationOffset = 0;
    screen.face = canvas.dataset.face || "hero";
  }
  const demo =
    screen.root.closest("[data-demo]") !== null && !reducedMotion.matches;
  const elapsed = time - screen.startedAt;
  const cycle = Math.floor(elapsed / 12);
  const phase = elapsed % 12;
  if (demo && !screen.manual && screen.root.closest(".featured")) {
    const demoFace =
      (Math.floor(screen.rotationOffset / 5) + cycle) % 2 === 0
        ? "hero"
        : "duo";
    if (canvas.dataset.face !== demoFace) canvas.dataset.face = demoFace;
    screen.face = demoFace;
  }
  const face = (canvas.dataset.face || "hero") as FaceId;
  // Hold the visible agents throughout a demo cycle and while tasks are open.
  if (!screen.manual)
    screen.overviewTime = screen.rotationOffset + (demo ? cycle * 5 : elapsed);
  const indices = getAgentIndices(face, screen.overviewTime);
  const key = `${face}:${indices.join(",")}`;
  if (screen.targetKey !== key) {
    screen.targetKey = key;
    screen.targets.replaceChildren();
    indices.forEach((index, slot) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agent-target";
      const [x, y, width, height] = hitAreas[face][slot];
      button.style.left = `${(x / 320) * 100}%`;
      button.style.top = `${(y / 240) * 100}%`;
      button.style.width = `${(width / 320) * 100}%`;
      button.style.height = `${(height / 240) * 100}%`;
      button.setAttribute(
        "aria-label",
        `Zobacz zadania agenta ${agents[index].name}`,
      );
      button.addEventListener("click", () => {
        screen.manual = true;
        screen.selected = index;
        screen.cursor.hidden = true;
        showTasks(screen, index);
        const back =
          screen.panel.querySelector<HTMLButtonElement>(".task-back")!;
        back.focus({ preventScroll: true });
      });
      screen.targets.append(button);
    });
    if (screen.statusLayer) {
      screen.statusLayer.replaceChildren();
      screen.statusLayer.classList.toggle("status-pair", indices.length === 2);
      indices.forEach((index, slot) => {
        const badge = document.createElement("span");
        badge.className = "featured-status";
        badge.textContent = agents[index].working ? "PRACUJE" : "GOTOWY";
        badge.classList.toggle("status-ready", !agents[index].working);
        badge.style.left = indices.length === 2 ? `${26 + slot * 48}%` : "50%";
        screen.statusLayer!.append(badge);
      });
    }
  }
  if (!screen.manual) {
    const targetIndex = indices[cycle % indices.length];
    screen.selected = demo && phase >= 5 && phase < 10 ? targetIndex : null;
    const showCursor =
      demo && ((phase >= 4 && phase < 5) || (phase >= 9 && phase < 10));
    screen.cursor.hidden = !showCursor;
    screen.cursor.style.left =
      phase >= 9 ? "13%" : face === "duo" ? `${25 + (cycle % 2) * 50}%` : "50%";
    screen.cursor.style.top = phase >= 9 ? "8%" : "44%";
    screen.cursor.style.setProperty("--tap-progress", String(phase % 1));
  }
  showTasks(screen, screen.selected);
  return screen.overviewTime;
}

document
  .querySelectorAll<HTMLElement>("[data-interactive]")
  .forEach((bezel) => {
    const root = bezel.querySelector<HTMLElement>(".screen-content")!;
    const canvas = root.querySelector<HTMLCanvasElement>("canvas")!;
    const screen: TouchScreen = {
      root,
      targets: root.querySelector(".screen-targets")!,
      panel: root.querySelector(".screen-tasks")!,
      cursor: root.querySelector(".demo-touch")!,
      selected: null,
      manual: false,
      startedAt: performance.now() / 1000,
      overviewTime: 0,
      rotationOffset: 0,
      targetKey: "",
      shownTask: null,
      face: canvas.dataset.face || "hero",
      statusLayer: root.querySelector("[data-featured-statuses]"),
    };
    touchScreens.set(canvas, screen);
    screen.panel.querySelector(".task-back")!.addEventListener("click", () => {
      screen.manual = false;
      screen.selected = null;
      screen.startedAt = performance.now() / 1000;
      screen.rotationOffset = screen.overviewTime;
      showTasks(screen, null);
      screen.targets
        .querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
    });
  });
const images = new Map<string, HTMLImageElement>();
for (const name of ["vita", "cloe", "nexo", "fred", "malu", "yoshi", "cow"]) {
  const image = new Image();
  image.src = `/assets/${name}.${name === "cow" ? "png" : "webp"}`;
  images.set(name, image);
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size = 12,
  color = "#e9ebf3",
  align: CanvasTextAlign = "left",
) {
  ctx.font = `600 ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function agentName(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  color = "#e9ebf3",
  align: CanvasTextAlign = "left",
) {
  ctx.font = `600 ${size}px Inter, Arial, sans-serif`;
  const lines =
    ctx.measureText(name).width > maxWidth ? name.split(" ") : [name];
  lines.forEach((line, index) =>
    text(ctx, line, x, y + index * (size + 2), size, color, align),
  );
}

function avatar(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  size: number,
  time: number,
) {
  const image = images.get(agent.avatar)!;
  if (!image.complete || !image.naturalWidth) return;
  const movement = agent.working ? Math.sin(time * 2 + x) * 2 : 0;
  // Use the original transparent artwork, cropped within its transparent margins.
  ctx.drawImage(image, 90, 90, 588, 588, x, y + movement, size, size);
  for (const eye of [0.4, 0.6]) {
    const eyeX = x + size * eye;
    const eyeY = y + movement + size * 0.49;
    ctx.fillStyle = "#f3eee3";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.065, size * 0.083, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#16151d";
    ctx.beginPath();
    ctx.arc(eyeX + size * 0.012, eyeY, size * 0.033, 0, Math.PI * 2);
    ctx.fill();
  }
}

function status(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  time: number,
  centered = false,
) {
  const label = agent.working ? "PRACUJE" : "GOTOWY";
  const fontSize = centered ? 15 : 12;
  ctx.font = `650 ${fontSize}px Inter, Arial, sans-serif`;
  const width = ctx.measureText(label).width + 15;
  const start = centered ? x - width / 2 : x;
  if (centered) {
    ctx.fillStyle = agent.working ? "#17382f" : "#25303e";
    ctx.beginPath();
    ctx.roundRect(start - 12, y - 20, width + 24, 30, 15);
    ctx.fill();
  }
  ctx.fillStyle = agent.working ? agent.color : "#dbe3f2";
  ctx.globalAlpha = agent.working ? 0.85 + Math.sin(time * 3) * 0.15 : 1;
  ctx.beginPath();
  ctx.arc(start + 3, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  text(
    ctx,
    label,
    start + 13,
    y,
    fontSize,
    agent.working ? agent.color : "#dbe3f2",
  );
}

function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color = "#2c3037",
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.stroke();
}

function wave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
  time: number,
  height = 8,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= width; i++) {
    const level =
      Math.sin(i * 0.12 - time * 2) * Math.sin(i * 0.037 + time) * height;
    if (i === 0) ctx.moveTo(x + i, y + level);
    else ctx.lineTo(x + i, y + level);
  }
  ctx.stroke();
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  time: number,
  style: string,
  selectionTime = time,
  showStatus = true,
) {
  const agent = agents[getAgentIndices(style, selectionTime)[0]];
  if (style === "orbit") {
    ctx.strokeStyle = `${agent.color}99`;
    for (const radius of [51, 65, 79]) {
      ctx.beginPath();
      ctx.arc(160, 90, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.arc(
      160 + Math.cos(time / 2) * 65,
      90 + Math.sin(time / 2) * 65,
      3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  if (style === "hero") {
    text(ctx, "OPENBOT", 14, 20, 11, "#c0c6d3");
    text(ctx, "SOLO", 306, 20, 11, "#c0c6d3", "right");
    ctx.fillStyle = `${agent.color}0d`;
    ctx.beginPath();
    ctx.roundRect(98, 34, 124, 124, 24);
    ctx.fill();
  }
  avatar(ctx, agent, 104, 37, 112, time);
  text(
    ctx,
    agent.name,
    160,
    185,
    style === "quiet" ? 26 : 23,
    "#f3f1f8",
    "center",
  );
  if (showStatus) status(ctx, agent, 160, 212, time, true);
  if (style !== "quiet") {
    agents.forEach((item, index) => {
      ctx.fillStyle = item === agent ? agent.color : "#333540";
      ctx.beginPath();
      ctx.arc(145 + index * 10, 232, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function drawSingleConcept(ctx: CanvasRenderingContext2D, time: number, style: string, selectionTime: number, showStatus = true) {
  const agent = agents[getAgentIndices(style, selectionTime)[0]];
  const color = agent.color;
  const phase = time * 1.15;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = `${color}88`;
  ctx.fillStyle = `${color}88`;
  if (style === "equalizer" || style === "spectrum") {
    const rings = style === "equalizer" ? [53, 77, 104] : [66, 90];
    for (let r = 0; r < rings.length; r++) {
      const radius = rings[r];
      const bars = style === "equalizer" ? 72 : 56;
      for (let i = 0; i < bars; i++) {
        const a = i * Math.PI * 2 / bars + (style === "spectrum" ? phase * 0.08 : 0);
        const wave = 4 + 8 * (0.5 + 0.5 * Math.sin(i * 0.48 + phase * (r % 2 ? 1.3 : -1)));
        ctx.globalAlpha = 0.34 + 0.5 * (0.5 + 0.5 * Math.sin(i * 0.2 + phase));
        ctx.lineWidth = style === "equalizer" ? (r === 0 ? 2.2 : 1.4) : 2;
        ctx.beginPath();
        ctx.moveTo(160 + Math.cos(a) * radius, 103 + Math.sin(a) * radius);
        ctx.lineTo(160 + Math.cos(a) * (radius + wave), 103 + Math.sin(a) * (radius + wave));
        ctx.stroke();
      }
    }
  } else if (style === "cosmos" || style === "orbitals") {
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.2 + i * 0.09;
      ctx.beginPath();
      ctx.ellipse(160, 102, 55 + i * 13, 29 + i * 10, -0.45 + i * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      const a = phase * (i % 2 ? -0.35 : 0.35) + i * 1.3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(160 + Math.cos(a) * (57 + i * 13), 102 + Math.sin(a) * (30 + i * 10), 1.8 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 24; i++) {
      const x = (i * 47 + 13) % 320, y = (i * 71 + 17) % 175;
      ctx.globalAlpha = 0.22 + 0.55 * (0.5 + 0.5 * Math.sin(phase + i));
      ctx.beginPath(); ctx.arc(x, y, i % 7 === 0 ? 1.5 : 0.7, 0, Math.PI * 2); ctx.fill();
    }
  } else if (style === "radar" || style === "rings" || style === "pulse") {
    const count = style === "radar" ? 5 : style === "rings" ? 7 : 4;
    for (let i = 0; i < count; i++) {
      const radius = 28 + i * (style === "rings" ? 16 : 20);
      ctx.globalAlpha = style === "radar" ? 0.4 : 0.2 + 0.1 * Math.sin(phase * 2 - i);
      ctx.setLineDash(style === "radar" && i % 2 ? [3, 4] : []);
      ctx.beginPath();
      ctx.arc(160, 102, radius, style === "radar" ? phase % (Math.PI * 2) : 0, style === "radar" ? phase % (Math.PI * 2) + Math.PI * 1.25 : Math.PI * 2);
      ctx.stroke();
      if (style === "radar") {
        const a = phase + i * 1.7;
        ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(160 + Math.cos(a) * radius, 102 + Math.sin(a) * radius, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.setLineDash([]);
    if (style === "pulse") for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + phase * 0.4, x = 160 + Math.cos(a) * 102, y = 102 + Math.sin(a) * 72;
      ctx.globalAlpha = 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(phase * 2 + i));
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    for (let lane = 0; lane < 7; lane++) {
      ctx.globalAlpha = 0.24 + lane * 0.075;
      ctx.lineWidth = lane % 3 === 0 ? 1.4 : 0.8;
      ctx.beginPath();
      for (let x = 0; x <= 320; x += 3) {
        const y = 105 + Math.sin(x * 0.027 - phase * 1.25 + lane * 0.18) * (18 + lane * 3) + Math.sin(x * 0.012 + phase + lane) * 7;
        if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const halo = ctx.createRadialGradient(160, 98, 6, 160, 98, 82);
  halo.addColorStop(0, `${color}25`); halo.addColorStop(1, `${color}00`);
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(160, 100, 82, 0, Math.PI * 2); ctx.fill();
  avatar(ctx, agent, 116, 57, 88, time);
  agentName(ctx, agent.name, 160, 171, 20, 210, "#f3f1f8", "center");
  if (showStatus) status(ctx, agent, 160, 205, time, true);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === getAgentIndices(style, selectionTime)[0] ? color : "#333540";
    ctx.beginPath(); ctx.arc(145 + i * 10, 231, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawDuo(
  ctx: CanvasRenderingContext2D,
  time: number,
  split: boolean,
  selectionTime = time,
  showStatus = true,
) {
  text(ctx, split ? "DWA RYTMY" : "OPENBOT / DUET", 14, 20, 11, "#c9ceda");
  const indices = getAgentIndices(split ? "split" : "duo", selectionTime);
  for (let slot = 0; slot < 2; slot++) {
    const agent = agents[indices[slot]];
    const x = 10 + slot * 154;
    if (split) {
      ctx.fillStyle = `${agent.color}18`;
      ctx.beginPath();
      ctx.roundRect(x, 32, 146, 196, 10);
      ctx.fill();
      ctx.fillStyle = agent.color;
      ctx.fillRect(x + 14, 47, 30, 3);
    } else panel(ctx, x, 32, 146, 196);
    avatar(ctx, agent, x + 31, 61, 84, time);
    agentName(ctx, agent.name, x + 73, 171, 19, 132, "#f0f1f6", "center");
    if (showStatus) status(ctx, agent, x + 34, 198, time);
    if (agent.working) wave(ctx, x + 18, 218, 110, agent.color, time, 3);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, time: number) {
  text(ctx, "MÓJ ZESPÓŁ", 12, 19, 12, "#e1e2eb");
  text(ctx, "3 / 4 PRACUJE", 307, 19, 11, "#9ae4c5", "right");
  agents.forEach((agent, index) => {
    const x = 10 + (index % 2) * 154;
    const y = 31 + Math.floor(index / 2) * 101;
    panel(ctx, x, y, 146, 94);
    avatar(ctx, agent, x + 6, y + 24, 46, time);
    agentName(ctx, agent.name, x + 61, y + 25, 14, 78);
    status(ctx, agent, x + 61, y + 65, time);
    if (agent.working) wave(ctx, x + 63, y + 80, 65, agent.color, time, 3);
  });
}

function drawOp1(ctx: CanvasRenderingContext2D, time: number) {
  text(ctx, "OPENBOT", 11, 18, 12, "#ededef");
  text(ctx, "OP-1 / ENGINE", 309, 18, 11, "#c4cbd9", "right");
  ctx.strokeStyle = "#303540";
  ctx.beginPath();
  ctx.moveTo(10, 25);
  ctx.lineTo(310, 25);
  ctx.stroke();
  agents.forEach((agent, index) => {
    const x = index % 2 === 0 ? 10 : 218;
    const y = index < 2 ? 34 : 131;
    panel(ctx, x, y, 92, 87, agent.working ? `${agent.color}80` : "#34363d");
    agentName(ctx, agent.name, x + 7, y + 14, 12, 78, agent.color);
    avatar(ctx, agent, x + 6, y + 32, 32, time);
    for (let bar = 0; bar < 5; bar++) {
      const level = agent.working
        ? 5 + Math.abs(Math.sin(time * 2 + bar + index)) * 24
        : 3;
      ctx.fillStyle = agent.working ? agent.color : "#373a44";
      ctx.fillRect(x + 57 + bar * 5, y + 58 - level, 3, level);
    }
    status(ctx, agent, x + 8, y + 77, time);
  });
  for (const cx of [142, 179]) {
    ctx.strokeStyle = "#77818d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, 88, 15, 0, Math.PI * 2);
    ctx.stroke();
    for (let line = 0; line < 3; line++) {
      const angle = time + (line * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(cx, 88);
      ctx.lineTo(cx + Math.cos(angle) * 12, 88 + Math.sin(angle) * 12);
      ctx.stroke();
    }
  }
  text(ctx, "AGENT", 160, 128, 11, "#bdc5d3", "center");
  text(ctx, "ENGINE", 160, 143, 11, "#bdc5d3", "center");
  wave(ctx, 114, 171, 91, "#b99ce6", time, 13);
  text(ctx, "3 AKTYWNE", 160, 208, 11, "#9ce3c3", "center");
  wave(ctx, 10, 233, 300, "#70d0c5", time, 2);
}

function drawCow(ctx: CanvasRenderingContext2D, time: number) {
  text(ctx, "OPENBOT / COW-ENGINE", 12, 20, 12, "#e0d4ef");
  const image = images.get("cow")!;
  if (image.complete && image.naturalWidth)
    ctx.drawImage(image, 55, 43, 210, 107);
  text(ctx, "ZESPÓŁ PRACUJE", 160, 169, 13, "#9de7c8", "center");
  agents.forEach((agent, index) => {
    avatar(ctx, agent, 28 + index * 72, 177, 32, time);
    agentName(
      ctx,
      agent.name,
      48 + index * 72,
      223,
      12,
      64,
      "#e9ebf3",
      "center",
    );
  });
}

function drawTerminal(ctx: CanvasRenderingContext2D, time: number) {
  text(ctx, "> OPENBOT MONITOR_", 13, 24, 14, "#a1ebc6");
  text(ctx, "AGENT", 13, 52, 11, "#bec8d5");
  text(ctx, "STATUS", 139, 52, 11, "#bec8d5");
  text(ctx, "KOLEJKA", 250, 52, 11, "#bec8d5");
  agents.forEach((agent, index) => {
    const y = 82 + index * 34;
    text(ctx, agent.name, 13, y, 16, "#f0f2f7");
    text(
      ctx,
      agent.working ? "PRACUJE" : "GOTOWY",
      139,
      y,
      13,
      agent.working ? agent.color : "#dbe3f2",
    );
    text(
      ctx,
      String(tasksByFace.terminal[index].queue.length),
      276,
      y,
      14,
      "#d2dae7",
    );
  });
  if (Math.floor(time) % 2 === 0) text(ctx, ">", 13, 225, 11, "#81d8b1");
  text(ctx, "BRIDGE POŁĄCZONY", 305, 225, 11, "#b5d5c5", "right");
}

const canvases = [
  ...document.querySelectorAll<HTMLCanvasElement>("canvas[data-face]"),
];
const visible = new Set<HTMLCanvasElement>();
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const canvas = entry.target as HTMLCanvasElement;
    if (entry.isIntersecting) visible.add(canvas);
    else visible.delete(canvas);
  }
});
canvases.forEach((canvas) => observer.observe(canvas));
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const canvas = entry.target as HTMLCanvasElement;
    const minimumResolution = canvas.closest(".featured") ? 3 : 2;
    const resolution = Math.max(
      minimumResolution,
      Math.min(3, window.devicePixelRatio || 1),
    );
    const width = Math.max(
      640,
      Math.round(entry.contentRect.width * resolution),
    );
    if (canvas.width !== width) {
      canvas.width = width;
      canvas.height = Math.round((width * 3) / 4);
    }
  }
});
canvases.forEach((canvas) => resizeObserver.observe(canvas));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastFrame = 0;
function frame(timestamp: number) {
  if (timestamp - lastFrame > (reducedMotion.matches ? 1000 : 80)) {
    lastFrame = timestamp;
    const time = timestamp / 1000;
    for (const canvas of visible) {
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(canvas.width / 320, 0, 0, canvas.height / 240, 0, 0);
      ctx.fillStyle = "#0d1015";
      ctx.fillRect(0, 0, 320, 240);
      ctx.imageSmoothingEnabled = true;
      const overviewTime = updateTouchScreen(canvas, time);
      const showCanvasStatus = !canvas.closest(".featured");
      switch (canvas.dataset.face) {
        case "equalizer": case "cosmos": case "radar": case "waves":
        case "spectrum": case "orbitals": case "rings": case "pulse":
          drawSingleConcept(ctx, reducedMotion.matches ? 1 : time, canvas.dataset.face, overviewTime, showCanvasStatus);
          break;
        case "duo":
          drawDuo(
            ctx,
            reducedMotion.matches ? 1 : time,
            false,
            overviewTime,
            showCanvasStatus,
          );
          break;
        case "split":
          drawDuo(ctx, reducedMotion.matches ? 1 : time, true, overviewTime);
          break;
        case "grid":
          drawGrid(ctx, time);
          break;
        case "op1":
          drawOp1(ctx, time);
          break;
        case "cow":
          drawCow(ctx, time);
          break;
        case "terminal":
          drawTerminal(ctx, time);
          break;
        default:
          drawHero(
            ctx,
            reducedMotion.matches ? 1 : time,
            canvas.dataset.face || "hero",
            overviewTime,
            showCanvasStatus,
          );
      }
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
