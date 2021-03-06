'use strict';


// in case Object.create does not exist
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  };
}

function start() {
  var canvas = document.getElementById("stack-attack");
  canvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
  }, false);
  canvas.addEventListener('webglcontextrestored', function () {
    init();
  }, false);

  init();
  drawFrame(0, {}, function () {}, function () {});
}


function init() {
  window.gl = getContext("stack-attack");
  window.glprog = getProgram("vshader", "fshader");


  var aXY = gl.getAttribLocation(glprog, "aXY");
  window.aXYpos = gl.getAttribLocation(glprog, "aXYpos");
  window.aXYoffset = gl.getAttribLocation(glprog, "aXYoffset");
  window.aRGB = gl.getAttribLocation(glprog, "aRGB");

  var data = [];

  data.length += 50000;

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(aXY);
  gl.vertexAttribPointer(aXY, 4, gl.FLOAT, false, 2 * FLOATS, 0 * FLOATS);

  addFloorTexture();
  addWallTexture();
  addBackgroundTexture();
  addRoofTexture();
}

// Constant animations at every fps rate
var then = 0;

function drawFrame(now, objects, cbBlocks, cbObjects) {

  now *= 0.001;
  var deltaTime = now - then;
  then = now;

  gl.clear(gl.COLOR_BUFFER_BIT);

  cbObjects();

  // For buffer drawing
  var offset = 0;
  for (var i in objects) {

    // cbBlocks(objects[i])

    gl.vertexAttrib3f(aRGB, objects[i].color.r / 255, objects[i].color.g / 255, objects[i].color.b / 255);
    gl.vertexAttrib2f(aXYpos, objects[i].position.x, objects[i].position.y);
    gl.vertexAttrib2f(aXYoffset, objects[i].offsetElement.getX(), objects[i].offsetElement.getY());

    gl.drawArrays(gl.TRIANGLE_STRIP, offset, objects[i].data.length / 2)
    offset += objects[i].data.length / 2;
  }

  requestAnimationFrame(window.nextFrame);
}

function updateDrawingObjects(objects) {
  var data = [];

  function addObject(o) {
    for (var i = 0; i < o.data.length; i++) {
      data.push(o.data[i++] * o.size.x);
      data.push(o.data[i] * o.size.y);
    }
  }

  for (var i in objects) {
    addObject(objects[i])
  }

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data));
}


function Block(BaseElement) {

  this.position = {
    x: 0,
    y: 0
  }
  this.size = {
    x: blockW,
    y: blockH
  }
  this.color = {
    r: 70,
    g: 70,
    b: 70
  }
  this.data = [0, 0, 0, 1, 1, 0, 1, 1];
  this.offsetElement = BaseElement;
}

Block.prototype.setPosition = function (x, y) {
  this.position.x = x;
  this.position.y = y;
}

Block.prototype.fill = function () {
  this.color = {
    r: 0,
    g: 0,
    b: 0
  }
}

window.blockW = 2 / 100;
window.blockH = 2 / 64;
window.maxRows = 8;
window.maxColumns = 12;
window.wallLeft = 4 * blockW;
window.floorHeght = 4 * blockH;

window.floorTexture = [
  [1, 1, 1, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1]
]

window.wallTexture = [
  [0, 0, 0, 1],
  [1, 1, 1, 1],
  [0, 1, 0, 1],
  [1, 1, 1, 1]
]

window.backgroundTexture = [
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 0, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0],

  [1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],

  [0, 0, 0, 0, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0],

  [1, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0]
]

window.roofTexture = [
  [1, 0, 1, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [1, 1, 1, 1]
]

window.boxTextures = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ]
];


window.playerTextures = [
  // IDLE 1
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],

    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0]
  ],
  // IDLE 1
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],

    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0]
  ],
  // IDLE 3
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 1, 1],

    [1, 0, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0]
  ],
  // IDLE 4
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 0],

    [0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0]
  ],
  // Walk right 1
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 1, 1],

    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 0]
  ],
  // Walk right 2
  [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],

    [0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0]
  ],
  // WALK LEFT 1
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 0],

    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0]
  ],
  // Walk left 2
  [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 0, 0, 1],

    [0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1]
  ],
  // Push left 1
  [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],

    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1]
  ],
  // Push left 2
  [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],

    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0]
  ],
  // Push left 3
  [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 0],

    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1]
  ],
  // Push right 1
  [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],

    [0, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0]
  ],
  // Push right 2
  [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],

    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0]
  ],
  // push right 3
  [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 1, 1, 1],

    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1]
  ],
  // Jump Left 
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 1, 1],

    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0]
  ]
];


window.craneTextures = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1]
  ]
]



var CROSSED_BOX = 0;
var JUST_THE_EDGES = 1;
var MAILBOX = 2;

var PLAYER_IDLE_1 = 0;
var PLAYER_IDLE_2 = 1;
var PLAYER_IDLE_3 = 2;
var PLAYER_IDLE_4 = 3;
var PLAYER_WALK_RIGHT_1 = 4;
var PLAYER_WALK_RIGHT_2 = 5;
var PLAYER_WALK_LEFT_1 = 6;
var PLAYER_WALK_LEFT_2 = 7;
var PLAYER_PUSH_LEFT_1 = 8;
var PLAYER_PUSH_LEFT_2 = 9;
var PLAYER_PUSH_LEFT_3 = 10;
var PLAYER_PUSH_RIGHT_1 = 11;
var PLAYER_PUSH_RIGHT_2 = 12;
var PLAYER_PUSH_RIGHT_3 = 13;
var PLAYER_JUMP = 14;


function Box() {
  this.position = {
    column: 0,
    row: 0
  }

  this.animationLimit = {
    column: 0,
    row: 0
  }

  this.animationsLeft = 0;

  this.texture = CROSSED_BOX;
  this.falling = true;
}

Box.prototype.setPosition = function (column, row) {
  this.position.column = column;
  this.position.row = row;
}

Box.prototype.setLimits = function (column, row) {
  this.animationLimit.column = column;
  this.animationLimit.row = row;
}

Box.prototype.setColumn = function (column) {
  this.position.column = column;
}

Box.prototype.setRow = function (row) {
  this.position.row = row;
}

Box.prototype.getX = function () {
  return ((this.position.column / maxColumns) * (2 - wallLeft) - (1 - wallLeft));
}

Box.prototype.getY = function () {
  return ((this.position.row / maxRows) * 2 - 1 + floorHeght);
}

Box.prototype.calculateFallLimits = function () {
  var max = -1;
  for (var i in boxes) {
    if (boxes[i].position.column == this.position.column && boxes[i].position.row < this.position.row) {
      if (boxes[i].position.row > max) {
        max = boxes[i].position.row;
      }
    }
  }
  this.animationLimit.row = max + 1;
}

Box.prototype.fall = function () {
  if (!this.falling) return;

  if (this.animationsLeft === 0) {
    this.calculateFallLimits();
  } else {
    this.animationsLeft--;
  }
  this.move();
}

Box.prototype.move = function () {
  if (this.position.column !== this.animationLimit.column) {
    var speed = this.animationLimit.column - this.position.column;
    var direction = 1;
    if (speed < 0) {
      direction = -1;
    }
    this.position.column += direction / 4;
  }
  if (this.position.row !== this.animationLimit.row) {
    var speed = this.animationLimit.row - this.position.row;
    var direction = 1;
    if (speed < 0) {
      direction = -1;
    }
    this.position.row += direction / 4;
  }
}

function Player() {
  this.position = {
    column: 0,
    row: 0
  }

  this.animationLimit = {
    column: 0,
    row: 0
  }

  this.blocks = [];

  this.texture = PLAYER_IDLE_4;

  this.animationsLeft = 0;
}

Player.prototype.setPosition = function (column, row) {
  this.position.column = column;
  this.position.row = row;
}

Player.prototype.setColumn = function (column) {
  this.position.column = column;
}

Player.prototype.setRow = function (row) {
  this.position.row = row;
}

Player.prototype.getX = function () {
  return ((this.position.column / maxColumns) * (2 - wallLeft) - (1 - wallLeft));
}

Player.prototype.getY = function () {
  return ((this.position.row / maxRows) * 2 - 1 + floorHeght);
}

Player.prototype.calculateFallLimits = function () {
  var max = -1;
  for (var i in boxes) {
    if (boxes[i].position.column == this.position.column && boxes[i].position.row < this.position.row) {
      if (boxes[i].position.row > max) {
        max = boxes[i].position.row;
      }
    }
  }
  this.animationLimit.row = max + 1;
}

Player.prototype.fall = function () {
  if (this.animationsLeft === 0) {
    this.calculateFallLimits();
  } else {
    this.animationsLeft--;
  }
  this.move();
}

Player.prototype.move = function () {
  if (this.position.column !== this.animationLimit.column) {
    var speed = this.animationLimit.column - this.position.column;
    var direction = 1;
    if (speed < 0) {
      direction = -1;
    }
    this.position.column += direction / 4;
  }
  if (this.position.row !== this.animationLimit.row) {
    var speed = this.animationLimit.row - this.position.row;
    var direction = 1;
    if (speed < 0) {
      direction = -1;
    }
    this.position.row += direction / 4;
  }
}

Player.prototype.jump = function () {
  if (this.position.row >= 4) return;
  if (this.animationsLeft !== 0) return;
  this.calculateFallLimits();

  if (this.animationLimit.row === this.position.row) {
    this.animationLimit.row = Math.floor(this.animationLimit.row + 1);
  }
  this.move();
  this.animationsLeft = 4;
}



function Crane() {
  this.position = {
    column: -2,
    row: 0
  }
  this.animationLimit = {
    column: -2,
    row: 0
  }
  this.texture = 0;
  this.box = {};
  this.dropColumn = 0;
}

Crane.prototype.setPosition = function (column, row) {
  this.column = column;
  this.row = row;
}

Crane.prototype.getX = function () {
  return ((this.position.column / maxColumns) * (2 - wallLeft) - (1 - wallLeft));
}

Crane.prototype.getY = function () {
  return ((this.position.row / maxRows) * 2 - 1 + floorHeght);
}

Crane.prototype.setColumn = function (column) {
  this.position.column = column;
}

Crane.prototype.setColumnLimit = function (column) {
  this.animationLimit.column = column;
}

Crane.prototype.move = function () {
  if (this.position.column !== this.animationLimit.column) {
    var speed = this.animationLimit.column - this.position.column;
    var direction = 1;
    if (speed < 0) {
      direction = -1;
    }
    this.position.column += direction / 4;

    if (this.box.position) {
      this.box.position.column = this.position.column;
    }

    if (this.position.column == this.dropColumn) {
      this.drop();
    }
  }
}

Crane.prototype.grasp = function (box) {
  this.dropColumn = Math.floor(random(0, 12));

  this.box = box;
  box.setPosition(this.position.column, this.position.row);
  box.animationLimit.column = this.dropColumn;
  box.animationLimit.row = this.position.row;
  box.falling = false;

  if (this.position.column > 6) {
    this.animationLimit.column = -2;
  } else {
    this.animationLimit.column = 14;
  }
}

Crane.prototype.drop = function () {
  if (!this.box.position) return;
  this.box.falling = true;
  this.box.fall();
  this.box = {};
}