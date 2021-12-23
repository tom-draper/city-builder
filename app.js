
function turnDraggedCellToObj() {
  if (mouseDown) {
    let cell = document.elementFromPoint(window.event.clientX, window.event.clientY);
    turnCellToObj(cell)
  }
}

function objSize(obj) {
  if (obj == 'road') {
    return [2, 2]
  } else {
    return [1, 1]
  }
}

function randWater() {
  return 'water-' +  (Math.floor((Math.random() * 3)) + 1);
}

function turnCellToObj(cell) {
  let obj = currentObj;

  [w, h] = objSize(obj);

  for (i = 0; i < h; i++) {
    for (j = 0; j < w; j++) {
      if (obj == 'water') {
        obj = randWater()
        if (!waterPlaced) {
          waterPlaced = true;
        }
      }
      grid[cell.y+i][cell.x+j].className = "cell " + obj
    }
  }
}

function setCurrentObj(obj) {
  currentObj = obj;
}

function createArray(length) {
  let arr = new Array(length || 0),
      i = length;

  if (arguments.length > 1) {
      let args = Array.prototype.slice.call(arguments, 1);
      while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }

  return arr;
}

function divSize(divID) {
  var div = document.getElementById(divID);

  var width = div.clientWidth || div.offsetWidth || (div.getBoundingClientRect()).width;
  var height= div.clientHeight || div.offsetHeight  || (div.getBoundingClientRect()).height;
  return [width, height]
}

function createGrid() {
  let grid = createArray(w, h);

  let container = document.getElementById("main");
  for (i = 0; i < h; i++) {
    for (j = 0; j < w; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell", "neutral");
      cell.y = i;
      cell.x = j;

      cell.addEventListener('mousedown', function() {
        mouseDown = true;
        turnCellToObj(this);
      }, false)
      cell.addEventListener('mousemove', turnDraggedCellToObj, false)
      cell.addEventListener('mouseup', function() {
        mouseDown = false;
      }, false)

      grid[i][j] = cell;
      container.appendChild(cell);
    }
  }
  return grid
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function randomBlue() {
  let r = randInt(28, 40);
  let g = randInt(165, 185);
  let b = randInt(240, 255);
  return 'rgb(' + r + ',' + g+ ',' + b + ')'
}

function gameLoop() {
  if (waterPlaced) {
    document.documentElement.style.setProperty('--water-1', randomBlue());
    document.documentElement.style.setProperty('--water-2', randomBlue());
    document.documentElement.style.setProperty('--water-3', randomBlue());
  }

  setTimeout(gameLoop, 2000);
}

var w = 180;
var h = 110;
var currentObj = 'water';
var mouseDown = false;
var waterPlaced = false;

var grid = createGrid();

setTimeout(gameLoop, 2000);