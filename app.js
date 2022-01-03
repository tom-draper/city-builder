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
}

async function fill(cell) {
  let x = cell.x;
  let y = cell.y;
  if (cell.className == "cell neutral" && onGrid(x, y)) {
    await applyObj(x, y);
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
  if (
    fillMode &&
    (currentObj == "grass" || currentObj == "water" || currentObj == "forest")
  ) {
    fill(cell);
  } else {
    let [objWidth, objHeight] = objSize(currentObj);
    for (let x = 0; x < objHeight; x++) {
      for (let y = 0; y < objWidth; y++) {
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
  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
      let cell = document.createElement("div");
      cell.classList.add("cell", "neutral");
      cell.y = x;
      cell.x = y;

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

      grid[x][y] = cell;
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
  let classN = "cell " + obj;
  if (x < h - 1 && grid[x+1][y].className == classN) {
    return true;
  } else if (x > 0 && grid[x-1][y].className == classN) {
    return true;
  } else if (y < w - 1 && grid[x][y+1].className == classN) {
    return true;
  } else if (y > 0 && grid[x][y-1].className == classN) {
    return true;
  }
  return false;
}

function variedNeighbourIs(x, y, obj, nSlice) {
  let classN = "cell " + obj;
  if (x < h - 1 && grid[x+1][y].className.slice(0, nSlice) == classN) {
    return true;
  } else if (x > 0 && grid[x-1][y].className.slice(0, nSlice) == classN) {
    return true;
  } else if (y < w - 1 && grid[x][y+1].className.slice(0, nSlice) == classN) {
    return true;
  } else if (y > 0 && grid[x][y-1].className.slice(0, nSlice) == classN) {
    return true;
  }
  return false;
}

function onEdge(x, y) {
  return y == 0 || y == w - 1 || x == 0 || x == h - 1;
}

function driveLocations() {
  let locations = [];
  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
      if (grid[x][y].className == "cell road") {
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
  let network = createArray(h, w);

  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
      if (grid[x][y].className == "cell road") {
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
  if (p >= Math.random()) {
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
          console.log(
            "Car driving from (" + sx + ", ",
            +sy + ") to (" + fx + ", ",
            +fy + ")"
          );
          carDrive([sx, sy], null, 0, path, "car-" + rand1toN(6));
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
  animal.top = xCoord + Math.floor(Math.random() * 3);
  animal.left = yCoord + Math.floor(Math.random() * 3);
  animal.style.top = animal.top + "px";
  animal.style.left = animal.left + "px";
}

function cellIsFarmBorder(x, y) {
  return cellIsGrass(x, y) && neighbourIs(x, y, "farm");
}

function farmLocations() {
  let locations = [];
  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
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
      animals.push(animal);
      document.getElementById("canvas").appendChild(animal);
    }
  }

  setTimeout(spawnAnimals, (animals.length + 1) * 1000);
}

function coordsToCell(xCoord, yCoord) {
  return [Math.floor(xCoord / 8), Math.floor(yCoord / 8)];
}

function cellIsGrass(x, y) {
  return grid[x][y].className.slice(0, 10) == "cell grass";
}

function moveUp(animal) {
  let [x, y] = coordsToCell(animal.top - animalBuffer, animal.left);
  if (cellIsGrass(x, y)) {
    animal.top = animal.top - animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}
function moveDown(animal) {
  let [x, y] = coordsToCell(animal.top + 5 + animalBuffer, animal.left);
  if (cellIsGrass(x, y)) {
    animal.top = animal.top + animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}
function moveLeft(animal) {
  let [x, y] = coordsToCell(animal.top, animal.left - animalBuffer);
  if (cellIsGrass(x, y)) {
    animal.left = animal.left - animalMovement;
    animal.style.left = animal.left + "px";
    return true;
  }
  return false;
}
function moveRight(animal) {
  let [x, y] = coordsToCell(animal.top, animal.left + 5 + animalBuffer);
  if (cellIsGrass(x, y)) {
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
  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
      if (cellIsGrass(x, y) && variedNeighbourIs(x, y, 'forest', 11)) {
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
      grid[x][y].className = "cell forest-" + rand1toN(5);
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
