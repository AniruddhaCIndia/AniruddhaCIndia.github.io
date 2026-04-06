let bins = 128;
let extent = 5;

let x = [];
let y = [];

let sourceX = 0.0;
let sourceY = 0.5;

let dragging = false;

let canvas;

function setup() {
  canvas = createCanvas(800, 400);
  canvas.parent("lens-container");

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
  drawField(I_lensed, width/2);

  drawSourceMarker();
}

function gaussian(x, y, x0, y0, sigma) {
  return Math.exp(-((x-x0)**2 + (y-y0)**2)/(2*sigma*sigma));
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

function lensDeflection(xv, yv) {
  let eps = 0.75;

  let r = Math.sqrt(xv*xv + (yv*yv)/(1-eps));
  if (r === 0) return [0,0];

  return [xv/r, yv/r];
}

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

      let ix = Math.floor(map(bx, -extent, extent, 0, bins-1));
      let iy = Math.floor(map(by, -extent, extent, 0, bins-1));

      if (ix >= 0 && ix < bins && iy >= 0 && iy < bins) {
        I[i][j] = I_source[iy][ix];
      } else {
        I[i][j] = 0;
      }
    }
  }

  return I;
}

function drawField(I, offsetX) {
  let w = width/2;
  let h = height;

  for (let i = 0; i < bins; i++) {
    for (let j = 0; j < bins; j++) {

      let val = I[i][j];
      let c = map(val, 0, 1, 0, 255);

      noStroke();
      fill(c);

      let px = map(j, 0, bins, offsetX, offsetX + w);
      let py = map(i, 0, bins, 0, h);

      rect(px, py, w/bins + 1, h/bins + 1);
    }
  }
}

function drawSourceMarker() {
  let px = map(sourceX, -extent, extent, 0, width/2);
  let py = map(sourceY, -extent, extent, height, 0);

  fill(255,0,0);
  noStroke();
  circle(px, py, 10);
}

function mousePressed() {
  if (mouseX < width/2) dragging = true;
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (dragging) {
    sourceX = map(mouseX, 0, width/2, -extent, extent);
    sourceY = map(mouseY, height, 0, -extent, extent);
  }
}
