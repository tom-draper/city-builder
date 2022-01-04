
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
      waterPlaced = true; // Begin animation
    }
  } else if (currentObj == "grass" || currentObj == "sand" || currentObj == "forest") {
    objClass = currentObj + "-" + rand1toN(5);
  } else if (currentObj == "hedge") {
    objClass = currentObj + "-" + rand1toN(3);
  }

  grid[y][x].className = "cell " + objClass;
  grid[y][x].cellType = currentObj;
}

async function fill(cell, cellType) {
  let x = cell.x;
  let y = cell.y;
  if (cell.cellType == cellType) {
    await applyObj(x, y);
    if (y < h - 1) {
      fill(grid[y + 1][x], cellType);
    }
    if (x < w - 1) {
      fill(grid[y][x + 1], cellType);
    }
    if (y > 0) {
      fill(grid[y - 1][x], cellType);
    }
    if (x > 0) {
      fill(grid[y][x - 1], cellType);
    }
  }
}

async function turnCellToObj(cell) {
  if (fillMode) {
    fill(cell, cell.cellType);
  } else {
    let [objWidth, objHeight] = objSize(currentObj);
    for (let y = 0; y < objHeight; y++) {
      for (let x = 0; x < objWidth; x++) {
        if (onGrid(cell.x + x, cell.y + y)) {
          await applyObj(cell.x + x, cell.y + y);
        }
      }
    }
  }
}

function setCurrentObj(obj) {
  document.getElementById("road-btn").classList.remove("active");
  document.getElementById("water-btn").classList.remove("active");
  document.getElementById("grass-btn").classList.remove("active");
  document.getElementById("sand-btn").classList.remove("active");
  document.getElementById("forest-btn").classList.remove("active");
  document.getElementById("hedge-btn").classList.remove("active");
  document.getElementById("fence-btn").classList.remove("active");
  document.getElementById("house-btn").classList.remove("active");
  document.getElementById("supermarket-btn").classList.remove("active");
  document.getElementById("farm-btn").classList.remove("active");
  document.getElementById("neutral-btn").classList.remove("active");
  document.getElementById(obj + "-btn").classList.add("active");
  currentObj = obj;
}

function toggleFill() {
  fillMode = !fillMode;
  document.getElementById("fill-btn").classList.toggle("active");
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
  let grid = createArray(h, w);

  let container = document.getElementById("canvas");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let cell = document.createElement("div");
      cell.classList = "cell neutral ";
      cell.cellType = "neutral";
      cell.x = x;
      cell.y = y;

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

      grid[y][x] = cell;
      container.appendChild(cell);
    }
  }
  document.getElementById("main").addEventListener(
    "mouseup",
    function () {
      mouseDown = false;
    },
    false
  );
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

function animateWater() {
  if (waterPlaced) {
    document.documentElement.style.setProperty("--water-1", randomBlue());
    document.documentElement.style.setProperty("--water-2", randomBlue());
    document.documentElement.style.setProperty("--water-3", randomBlue());
  }

  setTimeout(animateWater, 2000);
}

function neighbourIs(x, y, obj) {
  if (x < w - 1 && grid[y][x + 1].cellType == obj) {
    return true;
  } else if (x > 0 && grid[y][x - 1].cellType == obj) {
    return true;
  } else if (y < h - 1 && grid[y + 1][x].cellType == obj) {
    return true;
  } else if (y > 0 && grid[y - 1][x].cellType == obj) {
    return true;
  }
  return false;
}

function onEdge(x, y) {
  return y == 0 || y == w - 1 || x == 0 || x == h - 1;
}

function driveLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].cellType == "road") {
        let location = [x, y];
        if (onEdge(x, y) || neighbourIs(x, y, "farm")) {
          locations.push(location);
        } else if (neighbourIs(x, y, "house")) {
          // Give x2 greater weight to house locations
          locations.push(location, location);
        } else if (neighbourIs(x, y, "supermarket")) {
          // Give x4 greater weight to supermarket locations
          locations.push(location, location, location, location);
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
  let filteredLocations = [];
  for (let i = 0, n = locations.length; i < n; i++) {
    let [x, y] = locations[i];
    if (distance(startx, starty, x, y) > maxd) {
      filteredLocations.push(locations[i]);
    }
  }
  return filteredLocations;
}

function indexOfNode(arr, value) {
  for (let i = 0, n = arr.length; i < n; i++) {
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
  return x >= 0 && x < w && y >= 0 && y < h;
}

function carDrive(car, step, path) {
  if (step < path.length) {
    car.style.left = (path[step].x*8) + "px";
    car.style.top = (path[step].y*8) + "px";

    setTimeout(function () {
      carDrive(car, step + 1, path);
    }, 300);
  } else {
    document.getElementById("canvas").removeChild(car);
  }
}

function roadNetwork() {
  let network = createArray(w, h);  // Road network is flipped vs grid for the A* implementation

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].cellType == "road") {
        network[x][y] = 1;
      } else {
        network[x][y] = 0;
      }
    }
  }
  return network;
}

function tryCarDrive() {
  let startLocations = driveLocations();

  let p = Math.min(startLocations.length * 0.0002, 1);
  if (0.1 >= Math.random()) {
    let [sx, sy] = selectRandomLocation(startLocations);

    if (sx != null) {
      let finishLocations = driveLocations();
      let [fx, fy] = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 10));

      if (fx != null) {
        let graph = new Graph(roadNetwork());
        let start = graph.grid[sx][sy];
        let finish = graph.grid[fx][fy];
        let path = astar.search(graph, start, finish);
        if (path.length > 0) {
          // If found a path that the car can take
          console.log(
            "Car driving from (" + sx + ", ",
            + sy + ") to (" + fx + ", ",
            + fy + ")"
          );

          let car = document.createElement("div");
          car.classList = "car car-" + rand1toN(6);
          car.style.left = (sx*8) + "px";
          car.style.top = (sy*8) + "px";
          document.getElementById("canvas").appendChild(car);

          carDrive(car, 1, path);
        }
      }
    }
  }

  setTimeout(tryCarDrive, 500);
}

function cellToCoord(x, y) {
  return [x * 8, y * 8];
}

function placeAnimalOverCell(x, y, animal) {
  let [xCoord, yCoord] = cellToCoord(x, y);
  animal.left = xCoord + Math.floor(Math.random() * 3);
  animal.top = yCoord + Math.floor(Math.random() * 3);
  animal.style.left = animal.left + "px";
  animal.style.top = animal.top + "px";
}

function cellIsFarmBorder(x, y) {
  return cellIs(x, y, "grass") && neighbourIs(x, y, "farm");
}

function farmLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cellIsFarmBorder(x, y)) {
        locations.push([x, y]);
      }
    }
  }

  return locations;
}

function spawnAnimals() {
  if (0.05 >= Math.random()) {
    let [x, y] = selectRandomLocation(farmLocations());
    if (x != null) {
      let animal = document.createElement("div");
      animal.classList = "sheep";
      // FailedMove attribute to skip travelling in direction of last failed
      // move (gradually move away from obstacles)
      animal.failedMove = null;
      placeAnimalOverCell(x, y, animal);
      console.log(x, y, animal);
      animals.push(animal);
      document.getElementById("canvas").appendChild(animal);
    }
  }

  setTimeout(spawnAnimals, (animals.length + 1) * 1000);
}

function coordsToCell(xCoord, yCoord) {
  return [Math.floor(xCoord / 8), Math.floor(yCoord / 8)];
}

function cellIs(x, y, cellType) {
  return grid[y][x].cellType == cellType;
}

function moveUp(animal) {
  let [x, y] = coordsToCell(animal.left, animal.top - animalBuffer);
  if (cellIs(x, y, "grass")) {
    animal.top = animal.top - animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}
function moveDown(animal) {
  let [x, y] = coordsToCell(animal.left, animal.top + 5 + animalBuffer,);
  if (cellIs(x, y, "grass")) {
    animal.top = animal.top + animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}
function moveLeft(animal) {
  let [x, y] = coordsToCell(animal.left - animalBuffer, animal.top);
  if (cellIs(x, y, "grass")) {
    animal.left = animal.left - animalMovement;
    animal.style.left = animal.left + "px";
    return true;
  }
  return false;
}
function moveRight(animal) {
  let [x, y] = coordsToCell(animal.left + 5 + animalBuffer, animal.top);
  if (cellIs(x, y, "grass")) {
    animal.left = animal.left + animalMovement;
    animal.style.left = animal.left + "px";
    return true;
  }
  return false;
}

function moveAnimals() {
  for (let i = 0, n = animals.length; i < n; i++) {
    if (0.5 >= Math.random()) {
      let r = rand1toN(4);
      let animal = animals[i];
      if (r == 1 && animal.failedMove != 1) {
        if (!moveDown(animal)) {
          animal.failedMove = r;
        }
      } else if (r == 2 && animal.failedMove != 2) {
        if (!moveUp(animal)) {
          animal.failedMove = r;
        }
      } else if (r == 3 && animal.failedMove != 3) {
        if (!moveLeft(animal)) {
          animal.failedMove = r;
        }
      } else if (r == 4 && animal.failedMove != 4) {
        if (!moveRight(animal)) {
          animal.failedMove = r;
        }
      }
    }
  }

  setTimeout(moveAnimals, 1000);
}

function grassForestLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cellIs(x, y, "grass") && neighbourIs(x, y, "forest")) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

function growForest() {
  if (0.1 >= Math.random()) {
    let locations = grassForestLocations();
    console.log(locations);
    if (locations.length > 0) {
      let [x, y] = locations[Math.floor(Math.random() * locations.length)];
      grid[y][x].className = "cell forest-" + rand1toN(5);
      grid[y][x].cellType = "forest";
    }
  }

  setTimeout(growForest, 100000);
}

let w = 180;
let h = 110;
let currentObj = "road";
let mouseDown = false;
let fillMode = false;
let waterPlaced = false;
let animals = [];
let animalMovement = 2;
let animalBuffer = 6;

let grid = createGrid();

setTimeout(animateWater, 2000);
setTimeout(tryCarDrive, 500);
setTimeout(spawnAnimals, 10000);
setTimeout(moveAnimals, 1000);
setTimeout(growForest, 100000);
