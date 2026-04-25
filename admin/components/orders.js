let layers = [];          // { type: 'text'|'image', text, x, y, font, size, color, src, width, height }
let activeLayer = -1;
let baseImage = null;

const canvas = document.getElementById("preview-canvas");
const ctx = canvas.getContext("2d");

const layerText = document.getElementById("layer-text");
const layerFont = document.getElementById("layer-font");
const layerSize = document.getElementById("layer-size");
const layerColor = document.getElementById("layer-color");
const layersList = document.getElementById("layers-list");
const imageUpload = document.getElementById("image-upload");
const snapMode = document.getElementById("snap-mode");
const configJsonEl = document.getElementById("config-json");

let dragging = false;
let dragLayerIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;

const undoStack = [];
const redoStack = [];

function pushState() {
  undoStack.push(JSON.stringify({ layers, baseImage }));
  if (undoStack.length > 100) undoStack.shift();
  redoStack.length = 0;
}

function restoreState(stateStr) {
  const state = JSON.parse(stateStr);
  layers = state.layers || [];
  baseImage = state.baseImage || null;
  activeLayer = layers.length ? 0 : -1;
  loadLayerControls();
  refreshLayersList();
  updateJson();
  renderCanvas();
}

function undo() {
  if (!undoStack.length) return;
  const current = JSON.stringify({ layers, baseImage });
  const prev = undoStack.pop();
  redoStack.push(current);
  restoreState(prev);
}

function redo() {
  if (!redoStack.length) return;
  const current = JSON.stringify({ layers, baseImage });
  const next = redoStack.pop();
  undoStack.push(current);
  restoreState(next);
}

function renderCanvas() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (baseImage) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawLayers();
    };
    img.src = baseImage;
  } else {
    drawLayers();
  }
}

function drawLayers() {
  layers.forEach((l, i) => {
    if (l.type === "image" && l.src) {
      const img = new Image();
      img.onload = () => {
        const w = l.width || img.width;
        const h = l.height || img.height;
        ctx.drawImage(img, l.x, l.y, w, h);
        if (i === activeLayer) {
          ctx.strokeStyle = "#2563eb";
          ctx.strokeRect(l.x - 4, l.y - 4, w + 8, h + 8);
        }
      };
      img.src = l.src;
    } else if (l.type === "text") {
      ctx.font = `${l.size}px ${l.font}`;
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, l.x, l.y);
      if (i === activeLayer) {
        const w = ctx.measureText(l.text).width;
        const h = l.size;
        ctx.strokeStyle = "#2563eb";
        ctx.strokeRect(l.x - 4, l.y - 4, w + 8, h + 8);
      }
    }
  });
}

function updateJson() {
  const json = {
    baseImage,
    layers
  };
  configJsonEl.value = JSON.stringify(json, null, 2);
}

function refreshLayersList() {
  layersList.innerHTML = "";
  layers.forEach((l, i) => {
    const div = document.createElement("div");
    div.className = "layer-item" + (i === activeLayer ? " active" : "");
    const label = l.type === "text" ? (l.text || "Text") : "Image";
    div.textContent = `${i + 1}: ${label}`;
    div.onclick = () => {
      activeLayer = i;
      loadLayerControls();
      refreshLayersList();
      renderCanvas();
    };
    layersList.appendChild(div);
  });
}

function loadLayerControls() {
  const l = layers[activeLayer];
  if (!l || l.type !== "text") {
    layerText.value = "";
    layerFont.value = "system-ui";
    layerSize.value = 32;
    layerColor.value = "#ffffff";
    return;
  }
  layerText.value = l.text;
  layerFont.value = l.font;
  layerSize.value = l.size;
  layerColor.value = l.color;
}

function updateActiveTextLayer() {
  const l = layers[activeLayer];
  if (!l || l.type !== "text") return;
  l.text = layerText.value;
  l.font = layerFont.value;
  l.size = parseInt(layerSize.value || "32", 10);
  l.color = layerColor.value;
  updateJson();
  renderCanvas();
  refreshLayersList();
}

layerText.oninput = updateActiveTextLayer;
layerFont.onchange = updateActiveTextLayer;
layerSize.oninput = updateActiveTextLayer;
layerColor.oninput = updateActiveTextLayer;

document.getElementById("add-text-layer").onclick = () => {
  pushState();
  layers.push({
    type: "text",
    text: "New Text",
    x: 80,
    y: 80,
    font: "system-ui",
    size: 32,
    color: "#ffffff"
  });
  activeLayer = layers.length - 1;
  loadLayerControls();
  refreshLayersList();
  updateJson();
  renderCanvas();
};

document.getElementById("add-image-layer").onclick = () => {
  imageUpload.click();
};

imageUpload.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pushState();
    layers.push({
      type: "image",
      src: reader.result,
      x: 100,
      y: 100,
      width: 200,
      height: 200
    });
    activeLayer = layers.length - 1;
    loadLayerControls();
    refreshLayersList();
    updateJson();
    renderCanvas();
  };
  reader.readAsDataURL(file);
};

document.getElementById("delete-layer").onclick = () => {
  if (activeLayer < 0) return;
  pushState();
  layers.splice(activeLayer, 1);
  activeLayer = layers.length ? 0 : -1;
  loadLayerControls();
  refreshLayersList();
  updateJson();
  renderCanvas();
};

canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (l.type === "text") {
      ctx.font = `${l.size}px ${l.font}`;
      const w = ctx.measureText(l.text).width;
      const h = l.size;
      if (x >= l.x && x <= l.x + w && y >= l.y && y <= l.y + h) {
        dragLayerIndex = i;
        dragging = true;
        dragOffsetX = x - l.x;
        dragOffsetY = y - l.y;
        activeLayer = i;
        loadLayerControls();
        refreshLayersList();
        renderCanvas();
        pushState();
        return;
      }
    } else if (l.type === "image") {
      const w = l.width || 200;
      const h = l.height || 200;
      if (x >= l.x && x <= l.x + w && y >= l.y && y <= l.y + h) {
        dragLayerIndex = i;
        dragging = true;
        dragOffsetX = x - l.x;
        dragOffsetY = y - l.y;
        activeLayer = i;
        loadLayerControls();
        refreshLayersList();
        renderCanvas();
        pushState();
        return;
      }
    }
  }
};

canvas.onmousemove = (e) => {
  if (!dragging || dragLayerIndex < 0) return;
  const rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  const l = layers[dragLayerIndex];
  l.x = x - dragOffsetX;
  l.y = y - dragOffsetY;

  if (snapMode.value === "grid") {
    l.x = Math.round(l.x / 20) * 20;
    l.y = Math.round(l.y / 20) * 20;
  } else if (snapMode.value === "center") {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    if (Math.abs(l.x - centerX) < 10) l.x = centerX;
    if (Math.abs(l.y - centerY) < 10) l.y = centerY;
  }

  updateJson();
  renderCanvas();
};

canvas.onmouseup = () => {
  dragging = false;
  dragLayerIndex = -1;
};

canvas.onmouseleave = () => {
  dragging = false;
  dragLayerIndex = -1;
};

document.getElementById("export-png").onclick = () => {
  const link = document.createElement("a");
  link.download = "patch-standalone.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

document.getElementById("export-svg").onclick = () => {
  const svgParts = [];
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`
  );

  if (baseImage) {
    svgParts.push(
      `<image href="${baseImage}" x="0" y="0" width="${canvas.width}" height="${canvas.height}" />`
    );
  }

  layers.forEach(l => {
    if (l.type === "text") {
      svgParts.push(
        `<text x="${l.x}" y="${l.y}" font-family="${escapeAttr(l.font)}" font-size="${l.size}" fill="${escapeAttr(l.color)}">${escapeText(l.text)}</text>`
      );
    } else if (l.type === "image" && l.src) {
      svgParts.push(
        `<image href="${l.src}" x="${l.x}" y="${l.y}" width="${l.width || 200}" height="${l.height || 200}" />`
      );
    }
  });

  svgParts.push(`</svg>`);
  const blob = new Blob([svgParts.join("")], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "patch-standalone.svg";
  link.click();
  URL.revokeObjectURL(url);
};

function escapeText(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return (str || "").replace(/"/g, "&quot;");
}

document.getElementById("copy-json").onclick = async () => {
  await navigator.clipboard.writeText(configJsonEl.value);
};

document.getElementById("undo").onclick = undo;
document.getElementById("redo").onclick = redo;

// Optional: load from pasted JSON
configJsonEl.addEventListener("change", () => {
  try {
    const cfg = JSON.parse(configJsonEl.value || "{}");
    baseImage = cfg.baseImage || null;
    layers = Array.isArray(cfg.layers) ? cfg.layers : [];
    activeLayer = layers.length ? 0 : -1;
    loadLayerControls();
    refreshLayersList();
    renderCanvas();
  } catch {
    // ignore invalid JSON
  }
});

// init
pushState();
updateJson();
renderCanvas();
