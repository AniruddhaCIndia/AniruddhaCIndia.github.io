// ---------------------------
// Gravitational Lensing Demo
// ---------------------------

let bins = 128;
let extent = 5; // physical range in x and y
let x = [];
let y = [];

let sourceX = 0.0;
let sourceY = 0.5;
let dragging = false;

let canvas;

function setup() {
  // Create canvas inside the container div
  canvas = createCanvas(800, 400);
  canvas.parent("lens-container");

  // Fill x and y coordinates
  for (let i = 0; i < bins; i++) {
    x[i] = map(i, 0, bins - 1, -extent, extent);
    y[i] = map(i, 0, bins - 1, -extent, extent);
  }
}

function draw() {
  background(0);

  let I_source = computeSource();
  let I_lensed = computeLensed(I_source);

  drawField(I_source, 0);
  drawField(I_lensed, width / 2);

  drawSourceMarker();
}

// ===================
// SOURCE DEFINITION
// ===================
function gaussian(xv, yv, x0, y0, sigma) {
  return Math.exp(-((xv - x0) ** 2 + (yv - y0) ** 2) / (2 * sigma * sigma));
}

function computeSource() {
  let I = [];

  for (let i = 0; i < bins; i++) {
    I[i] = [];
    for (let j = 0; j < bins; j++) {
      I[i][j] = gaussian(x[j], y[i], sourceX, sourceY, 0.2);
    }
  }

  return I;
}

// ===================
// LENS POTENTIAL
// ===================
// Fixed SIS-like lens
function lensDeflection(xv, yv) {
  let b = 1.0; // Einstein radius
  let r = Math.sqrt(xv * xv + yv * yv);

  if (r === 0) return [0, 0];

  return [b * xv / r, b * yv / r];
}

// ===================
// LENSED IMAGE
// ===================
function computeLensed(I_source) {
  let I = [];

  for (let i = 0; i < bins; i++) {
    I[i] = [];
    for (let j = 0; j < bins; j++) {
      let xv = x[j];
      let yv = y[i];

      // Deflection
      let [ax, ay] = lensDeflection(xv, yv);

      // Lens equation
      let bx = xv - ax;
      let by = yv - ay;

      // Map back to nearest neighbor in source
      let ix = Math.floor(map(bx, -extent, extent, 0, bins - 1));
      let iy = Math.floor(map(by, -extent, extent, 0, bins - 1));

      if (ix >= 0 && ix < bins && iy >= 0 && iy < bins) {
        I[i][j] = I_source[iy][ix];
      } else {
        I[i][j] = 0;
      }
    }
  }

  return I;
}

// ===================
// DRAW FIELD WITH ASPECT RATIO
// ===================
function drawField(I, offsetX) {
  let w = width / 2;
  let h = height;

  // Ensure 1:1 aspect ratio
  let scaleX = w / (2 * extent);
  let scaleY = h / (2 * extent);
  let scale = Math.min(scaleX, scaleY);

  for (let i = 0; i < bins; i++) {
    for (let j = 0; j < bins; j++) {
      let val = I[i][j];
      let c = map(val, 0, 1, 0, 255);

      noStroke();
      fill(c);

      // Physical coordinates
      let xpos = x[j];
      let ypos = y[i];

      // Map to pixels
      let px = offsetX + (xpos + extent) * scale;
      let py = height - (ypos + extent) * scale; // flip y

      rect(px, py, scale + 1, scale + 1);
    }
  }
}

// ===================
// RED DOT (SOURCE)
// ===================
function drawSourceMarker() {
  let w = width / 2;
  let h = height;

  // Same scale as drawField
  let scaleX = w / (2 * extent);
  let scaleY = h / (2 * extent);
  let scale = Math.min(scaleX, scaleY);

  let px = (sourceX + extent) * scale;
  let py = height - (sourceY + extent) * scale;

  fill(255, 0, 0);
  noStroke();
  circle(px, py, 10);
}

// ===================
// DRAGGING INTERACTION
// ===================
function mousePressed() {
  if (mouseX < width / 2) dragging = true;
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (dragging) {
    let w = width / 2;
    let h = height;
    let scaleX = w / (2 * extent);
    let scaleY = h / (2 * extent);
    let scale = Math.min(scaleX, scaleY);

    sourceX = map(mouseX, 0, w, -extent, extent);
    sourceY = map(mouseY, h, 0, -extent, extent); // flip y
  }
}
