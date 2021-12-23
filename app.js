async function turnDraggedCellToObj() {
  if (mouseDown) {
    await turnCellToObj(document.elementFromPoint(window.event.clientX, window.event.clientY));
    // if (window.event.clientX < 1 || window.event.clientY < 1 || window.event.clientX > (w*8)-1 || window.event.clientY > (h*8)-1) {
    //   mouseDown = false;
    // }
  }
}

function objSize(obj) {
  if (obj == "road") {
    return [2, 2];
  } else {
    return [1, 1];
  }
}

function rand1toN(upTo) {
  return Math.floor(Math.random() * upTo) + 1;
}

async function applyObj(x, y) {
  let objClass = currentObj;

  if (currentObj == "water") {
    objClass = "water-" + rand1toN(3);
    if (!waterPlaced) {
      waterPlaced = true;
    }
  } else if (currentObj == "grass") {
    objClass = "grass-" + rand1toN(5);
  }

  grid[x][y].className = "cell " + objClass;
}

async function fill(cell) {
  let x = cell.x;
  let y = cell.y;
  if (cell.className == 'cell neutral' && x < w && y < h && x >= 0 && y >= 0) {
    await applyObj(y, x)
    if (y < h-1) {
      await fill(grid[y+1][x])
    }
    if (x < w-1) {
      await fill(grid[y][x+1])
    }
    if (y > 0) {
      await fill(grid[y-1][x])
    }
    if (cell.x > 0) {
      await fill(grid[y][x-1])
    }
  }
}

async function turnCellToObj(cell) {
  if (fillMode && (currentObj == 'grass' || currentObj == 'water')) {
    fill(cell)
  } else {
    [objWidth, objHeight] = objSize(currentObj);
    for (let i = 0; i < objHeight; i++) {
      for (let j = 0; j < objWidth; j++) {
        await applyObj(cell.y+j, cell.x+i)
      }
    }
  }

}

function setCurrentObj(obj) {
  document.getElementById('roadBtn').classList.remove('active');
  document.getElementById('waterBtn').classList.remove('active');
  document.getElementById('grassBtn').classList.remove('active');
  document.getElementById('hedgeBtn').classList.remove('active');
  document.getElementById(obj + 'Btn').classList.add('active');
  currentObj = obj;
}
function toggleFill() {
  fillMode = !fillMode;
  document.getElementById('fillBtn').classList.toggle('active');
}

function createArray(length) {
  let arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    let args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = createArray.apply(this, args);
  }

  return arr;
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

      cell.addEventListener(
        "mousedown",
        function () {
          mouseDown = true;
          turnCellToObj(this);
        },
        false
      );
      cell.addEventListener("mousemove", turnDraggedCellToObj, false);
      cell.addEventListener(
        "mouseup",
        function () {
          mouseDown = false;
        },
        false
      );

      grid[i][j] = cell;
      container.appendChild(cell);
    }
  }
  return grid;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBlue() {
  let r = randInt(28, 40);
  let g = randInt(165, 185);
  let b = randInt(240, 255);
  return "rgb(" + r + "," + g + "," + b + ")";
}

function updateWater() {
  if (waterPlaced) {
    document.documentElement.style.setProperty("--water-1", randomBlue());
    document.documentElement.style.setProperty("--water-2", randomBlue());
    document.documentElement.style.setProperty("--water-3", randomBlue());
  }

  setTimeout(updateWater, 2000);
}

function neighbourIs(x, y, obj) {
  let classN = "cell "+ obj;
  return (grid[x+1][y].className == classN || grid[x][y+1].className == classN || grid[x-1][y].className == classN || grid[x][y-1].className == classN)
}

function driveLocations() {
  let locations = [];
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (grid[i][j].className == "cell road") {
        if (i == 0 || j == 0 || i == h-1 || j == w-1 || neighbourIs(i, j, 'house') || neighbourIs(i, j, 'supermarket')) {
          locations.push([i, j]);
        }
      }
    }
  }

  return locations;
}

function selectRandLocation(locations) {
  let selectedLoc = [null, null]
  if (locations.length > 0) {
    selectedLoc = locations[Math.floor(Math.random() * locations.length)]
  }
  return selectedLoc
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
}

function filterByDistance(startx, starty, locations, maxd) {
  let filteredLocs = []
  locations.forEach(element => {
    [x, y] = element
    if (distance(startx, starty, x, y) > maxd) {
      filteredLocs.push(element)
    }
  });
  return filteredLocs;
}

function calcf(x, y, cost, fx, fy) {
  let h = distance(x, y, fx, fy)
  let f = cost + h
  return [f, cost, h]
}

function lowestF(toCheck, fx, fy) {
  let lowest = 1000000;
  toCheck.forEach(element => {
    let [x, y, g] = element;
    let h = distance(x, y, fx, fy)
    let f = h + g;
    if (f < lowest) {
      lowest = [x, y, g, h, f];
    }
  })
  return lowest;
}

function getNeighbours(x, y, cost) {
  return [[x+1, y, cost+1],
          [x, y+1, cost+1],
          [x-1, y, cost+1],
          [x, y-1, cost+1]]
}

function neighbourIsRoad(neighbour) {
  let [x, y, cost] = neighbour;
  return grid[x][y].className == "cell road"
}

function findPath(sx, sy, fx, fy) {
  let save = [{"parent": null, "child": [sx, sy]}, 0, 0, 0]
  let path = []
  let toCheck = [[sx, sy, 0]];
  let checked = [];
  while (toCheck.length > 0) {
    let [x, y, g, h, f] = lowestF(toCheck, fx, fy)
    if (x == fx && y == fy) {
      return path;
    } else {
      checked.push([x, y, g])
      toCheck.remove([x, y, g])
      let neighbours = getNeighbours(x, y, g);
      neighbours.forEach(neigh => {
        if (neighbourIsRoad) {
          if (!toCheck.includes(neigh)) {
            let path = {"parent": [x, y], "child": save[0]}
            save = [path, g, h, f]
            toCheck.push(neigh);
          }
          if (!toCheck.includes(neigh) && g < save[2]) {
            save = [path, g, save[3], f]
          }
        }
      })

    }
  }
}

function carDrive(path) {
  console.log("car drive")
}

function tryCarDrive() {
  let startLocations = driveLocations()
  let [sx, sy] = selectRandLocation(startLocations)
  if (sx != null && sy != null) {
    let finishLocations = driveLocations()
    finishLocations = filterByDistance(sx, sy, finishLocations, 10)
    let [fx, fy] = selectRandLocation(finishLocations)

    if (fx != null && fy != null) {
      let path = findPath(sx, sy, fx, fy) {

      }
      carDrive(path);
    }
  }

  setTimeout(tryCarDrive, 5000);
}

var w = 180;
var h = 110;
var currentObj = "road";
var mouseDown = false;
var fillMode = false;
var waterPlaced = false;

var grid = createGrid();

setTimeout(updateWater, 2000);
setTimeout(tryCarDrive, 5000);
