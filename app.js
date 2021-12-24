async function turnDraggedCellToObj() {
  if (mouseDown) {
    await turnCellToObj(
      document.elementFromPoint(window.event.clientX, window.event.clientY)
    );
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
      waterPlaced = true;  // Begin animation
    }
  } else if (currentObj == "grass" || (currentObj == "forest")) {
    objClass = currentObj + "-" + rand1toN(5);
  } else if (currentObj == "hedge" || currentObj == "snow") {
    objClass = currentObj + "-" + rand1toN(3);
  }

  grid[x][y].className = "cell " + objClass;
}

async function fill(cell) {
  let x = cell.x;
  let y = cell.y;
  if (cell.className == "cell neutral" && onGrid(x, y)) {
    await applyObj(y, x);
    if (y < h - 1) {
      await fill(grid[y + 1][x]);
    }
    if (x < w - 1) {
      await fill(grid[y][x + 1]);
    }
    if (y > 0) {
      await fill(grid[y - 1][x]);
    }
    if (cell.x > 0) {
      await fill(grid[y][x - 1]);
    }
  }
}

async function turnCellToObj(cell) {
  if (fillMode && (currentObj == "grass" || currentObj == "water" || currentObj == "forest" || currentObj == "snow")) {
    fill(cell);
  } else {
    [objWidth, objHeight] = objSize(currentObj);
    for (let i = 0; i < objHeight; i++) {
      for (let j = 0; j < objWidth; j++) {
        await applyObj(cell.y + j, cell.x + i);
      }
    }
  }
}

function setCurrentObj(obj) {
  document.getElementById("roadBtn").classList.remove("active");
  document.getElementById("waterBtn").classList.remove("active");
  document.getElementById("grassBtn").classList.remove("active");
  document.getElementById("forestBtn").classList.remove("active");
  document.getElementById("snowBtn").classList.remove("active");
  document.getElementById("hedgeBtn").classList.remove("active");
  document.getElementById("fenceBtn").classList.remove("active");
  document.getElementById("houseBtn").classList.remove("active");
  document.getElementById("supermarketBtn").classList.remove("active");
  document.getElementById("farmBtn").classList.remove("active");
  document.getElementById("neutralBtn").classList.remove("active");
  document.getElementById(obj + "Btn").classList.add("active");
  currentObj = obj;
}

function toggleFill() {
  fillMode = !fillMode;
  document.getElementById("fillBtn").classList.toggle("active");
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
  let classN = "cell " + obj;
  return (
    grid[x+1][y].className == classN ||
    grid[x][y+1].className == classN ||
    grid[x-1][y].className == classN ||
    grid[x][y-1].className == classN
  );
}

function driveLocations() {
  let locations = [];
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (grid[i][j].className == "cell road") {
        if (i == 0 || j == 0 || i == h - 1 || j == w - 1 || neighbourIs(i, j, "farm")
        ) {
          locations.push([i, j]);
        } else if (neighbourIs(i, j, "house")) {
          // Give x2 greater weight to house locations
          locations.push([i, j], [i, j]);
        } else if (neighbourIs(i, j, "supermarket")) {
          // Give x4 greater weight to supermarket locations
          locations.push([i, j], [i, j], [i, j], [i, j]);
        }
      }
    }
  }

  return locations;
}

function selectRandomLocation(locations) {
  let selectedLoc = [null, null];
  if (locations.length > 0) {
    selectedLoc = locations[Math.floor(Math.random() * locations.length)];
  }
  return selectedLoc;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function filterByDistance(startx, starty, locations, maxd) {
  let filteredLocs = [];
  locations.forEach((element) => {
    [x, y] = element;
    if (distance(startx, starty, x, y) > maxd) {
      filteredLocs.push(element);
    }
  });
  return filteredLocs;
}

function indexOfNode(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (
      arr[i][0] == value[0] &&
      arr[i][1] == value[1] &&
      arr[i][2] == value[2]
    ) {
      return i;
    }
  }
  return -1;
}

function removeNode(arr, node) {
  let index = indexOfNode(arr, node);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function onGrid(x, y) {
  return x >= 0 && y >= 0 && x < w && y < h;
}

function carDrive(current, prev, step, path, carClass) {
  if (prev != null) {
    // Remove car from prev
    let [px, py] = prev;
    grid[px][py].classList.remove(carClass);
  }

  if (current != null) {
    let [cx, cy] = current;
    grid[cx][cy].classList.add(carClass);

    let next = null;
    if (step < path.length - 1) {
      next = [path[step + 1].x, path[step + 1].y];
    }

    setTimeout(function () {
      carDrive(next, current, step + 1, path, carClass);
    }, 300);
  } else {
    let [px, py] = prev;
    grid[px][py].classList.remove(carClass);
  }
}

function roadNetwork() {
  let network = createArray(w, h);

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (grid[i][j].className == "cell road") {
        network[i][j] = 1;
      } else {
        network[i][j] = 0;
      }
    }
  }
  return network;
}

function tryCarDrive() {
  let startLocations = driveLocations();
  let [sx, sy] = selectRandomLocation(startLocations);

  if (sx != null && sy != null) {
    let finishLocations = driveLocations();
    let [fx, fy] = selectRandomLocation(
      filterByDistance(sx, sy, finishLocations, 10)
    );

    if (fx != null && fy != null) {
      let graph = new Graph(roadNetwork());
      let start = graph.grid[sx][sy];
      let finish = graph.grid[fx][fy];
      let path = astar.search(graph, start, finish);
      if (path.length > 0) {
        // If found a path that the car can take
        console.log('Car driving from (' + sx + ', ', + sy + ') to (' + fx + ', ', + fy + ')');
        carDrive([sx, sy], null, 0, path, "car-" + rand1toN(6));
      }
    }
  }

  // The more possible starting locations, the more frequently cars spawn
  let waitTime = 160000 - startLocations.length * 100;
  if (waitTime < 1000) {
    waitTime = 1000;
  }
  console.log(waitTime, 'ms until next tryCarDrive');
  setTimeout(tryCarDrive, waitTime);
}

var w = 180;
var h = 110;
var currentObj = "road";
var mouseDown = false;
var fillMode = false;
var waterPlaced = false;

var grid = createGrid();

setTimeout(updateWater, 2000);
setTimeout(tryCarDrive, 30000);