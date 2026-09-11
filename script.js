const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('machSlider');
const machVal = document.getElementById('machVal');
const regimeText = document.getElementById('regimeText');
const angleText = document.getElementById('angleText');

const soundSpeed = 100;
let sourceX = 50;
const sourceY = canvas.height / 2;
let waveFronts = [];
let lastTime = performance.now();

slider.addEventListener('input', (e) => {
  machVal.textContent = e.target.value;
});

function updateSim(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const mach = parseFloat(slider.value);
  const sourceSpeed = soundSpeed * mach;

  if (mach < 1) {
    regimeText.textContent = "Subsonic";
    angleText.textContent = "N/A (No Shockwave)";
  } else if (mach === 1) {
    regimeText.textContent = "Transonic";
    angleText.textContent = "90.0°";
  } else {
    regimeText.textContent = "Supersonic";
    const angleRad = Math.asin(1 / mach);
    const angleDeg = (angleRad * (180 / Math.PI)).toFixed(1);
    angleText.textContent = `${angleDeg}°`;
  }

  sourceX += sourceSpeed * dt;
  if (sourceX > canvas.width - 50) {
    sourceX = 50;
    waveFronts = [];
  }

  if (waveFronts.length === 0 || (sourceX - waveFronts[waveFronts.length - 1].x) > 15) {
    waveFronts.push({ x: sourceX, y: sourceY, r: 0 });
  }

  waveFronts.forEach(w => w.r += soundSpeed * dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  waveFronts.forEach(w => {
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  if (mach > 1) {
    const angleRad = Math.asin(1 / mach);
    const tanAngle = Math.tan(angleRad);
    const coneLen = sourceX - 50;

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(50, sourceY - coneLen * tanAngle);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(50, sourceY + coneLen * tanAngle);
    ctx.stroke();
  }

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(sourceX, sourceY, 6, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(updateSim);
}

requestAnimationFrame(updateSim);
