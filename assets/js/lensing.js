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

// SIE lens parameters
let einsteinRadius = 1.0; // b
let q = 0.75;              // axis ratio
let phi = 0;               // rotation angle in degrees

function setup() {
  canvas = createCanvas(800, 400);
  canvas.parent("lens-container");

  // fill x and y
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
      I[i][j] = gaussian(x[j], y[i], sourceX, sourceY, 0.1);
    }
  }
  return I;
}

// ===================
// SIE LENS POTENTIAL
// ===================
function lensDeflection(xv, yv) {
  // Convert rotation to radians
  let phiRad = phi * Math.PI / 180;

  // Rotate coordinates
  let xp = xv * Math.cos(phiRad) + yv * Math.sin(phiRad);
  let yp = -xv * Math.sin(phiRad) + yv * Math.cos(phiRad);

  // Elliptical radius
  let R = Math.sqrt(q * q * xp * xp + yp * yp);
  if (R === 0) return [0, 0];

  // Kormann+94 approximation
  let sqrt1mq = Math.sqrt(1 - q * q);
  let alpha_x = (einsteinRadius * q / sqrt1mq) * Math.atanh(sqrt1mq * xp / R);
  let alpha_y = (einsteinRadius * q / sqrt1mq) * Math.atan(sqrt1mq * yp / (q * R));

  // Rotate back
  let ax = alpha_x * Math.cos(phiRad) - alpha_y * Math.sin(phiRad);
  let ay = alpha_x * Math.sin(phiRad) + alpha_y * Math.cos(phiRad);

  return [ax, ay];
}

// ===================
// LENSED IMAGE (bilinear interpolation)
// ===================
function computeLensed(I_source) {
  let I = [];
  for (let i = 0; i < bins; i++) {
    I[i] = [];
    for (let j = 0; j < bins; j++) {
      let xv = x[j];
      let yv = y[i];

      let [ax, ay] = lensDeflection(xv, yv);

      let bx = xv - ax;
      let by = yv - ay;

      // Map physical coords to indices
      let fx = map(bx, -extent, extent, 0, bins - 1);
      let fy = map(by, -extent, extent, 0, bins - 1);

      // Bilinear interpolation
      let ix = Math.floor(fx);
      let iy = Math.floor(fy);
      let dx = fx - ix;
      let dy = fy - iy;

      if (ix >= 0 && ix < bins - 1 && iy >= 0 && iy < bins - 1) {
        let val = (1 - dx) * (1 - dy) * I_source[iy][ix] +
                  dx * (1 - dy) * I_source[iy][ix + 1] +
                  (1 - dx) * dy * I_source[iy + 1][ix] +
                  dx * dy * I_source[iy + 1][ix + 1];
        I[i][j] = val;
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

  let scaleX = w / (2 * extent);
  let scaleY = h / (2 * extent);
  let scale = Math.min(scaleX, scaleY);

  // Centering offsets
  let xOffset = offsetX + (w - 2 * extent * scale) / 2;
  let yOffset = (h - 2 * extent * scale) / 2;

  for (let i = 0; i < bins; i++) {
    for (let j = 0; j < bins; j++) {
      let val = I[i][j];
      let c = map(val, 0, 1, 0, 255);

      noStroke();
      fill(c);

      let xpos = x[j];
      let ypos = y[i];

      let px = xOffset + (xpos + extent) * scale;
      let py = height - (ypos + extent) * scale;

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

  let scaleX = w / (2 * extent);
  let scaleY = h / (2 * extent);
  let scale = Math.min(scaleX, scaleY);

  let xOffset = (w - 2 * extent * scale) / 2;
  let yOffset = (h - 2 * extent * scale) / 2;

  let px = xOffset + (sourceX + extent) * scale;
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
    sourceY = map(mouseY, h, 0, -extent, extent);

    // Clamp to valid range
    sourceX = constrain(sourceX, -extent, extent);
    sourceY = constrain(sourceY, -extent, extent);
  }
}
