console.log("Standalone designer loaded.");

function renderConfig() {
  const textarea = document.getElementById("config-json");
  const canvas = document.getElementById("preview-canvas");
  const ctx = canvas.getContext("2d");

  let cfg;
  try {
    cfg = JSON.parse(textarea.value || "{}");
  } catch (e) {
    alert("Invalid JSON");
    return;
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (cfg.baseImage) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawZones(cfg, ctx);
    };
    img.src = cfg.baseImage;
  } else {
    drawZones(cfg, ctx);
  }
}

function drawZones(cfg, ctx) {
  const zones = cfg.textZones || [];
  zones.forEach(z => {
    ctx.font = (z.fontSize || 24) + "px " + (z.fontFamily || "system-ui");
    ctx.fillStyle = z.color || "#ffffff";
    ctx.textBaseline = "top";
    ctx.fillText(z.text || "", z.x || 20, z.y || 20);
  });
}

document.getElementById("render-config").addEventListener("click", renderConfig);
