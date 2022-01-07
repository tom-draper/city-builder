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
  document.getElementById(obj + "-btn").className = "active";
  document.getElementById(currentObj + "-btn").className = "";
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

  let canvas = document.getElementById("canvas");

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
      cell.addEventListener(
        "mousemove", 
        turnDraggedCellToObj, 
        false
      );
      cell.addEventListener(
        "mouseup",
        function () {
          mouseDown = false;
        },
        false
      );

      grid[y][x] = cell;
      canvas.appendChild(cell);
    }
  }

  // If mouse released outside of the canvas, reset mouseDown flag
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
  return `rgb(${r},${g},${b})`;
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
    if (arr[i][0] == value[0] && arr[i][1] == value[1] && arr[i][2] == value[2]) {
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

async function smoothMove(object, currentX, currentY, targetX, targetY) {
  let nextX = currentX;
  let diffX = targetX - currentX;
  if (diffX > 0) {
    nextX += 4;
  } else if (diffX < 0) {
    nextX -= 4;
  }
  
  let nextY = currentY;
  let diffY = targetY - currentY;
  if (diffY > 0) {
    nextY += 4;
  } else if (diffY < 0) {
    nextY -= 4;
  }
  object.style.left = nextX + 'px';
  object.style.top = nextY + 'px';

  if (nextX != targetX || nextY != targetY) {
    setTimeout(function () {
      smoothMove(object, nextX, nextY, targetX, targetY);
    }, 150);
  }
}

/*
 * Runs intermittently.
 * Moves the car div along its input path with each run until it reaches the 
 * final location and the car is removed from the canvas.
 */
function drive(car, step, path) {
  if (step < path.length) {
    car.style.left = (path[step].x * 8) + "px";
    car.style.top = (path[step].y * 8) + "px";
    // smoothMove(
    //   car, 
    //   path[step-1].x * 8, 
    //   path[step-1].y * 8, 
    //   path[step].x * 8, 
    //   path[step].y * 8
    // );

    setTimeout(function () {
      drive(car, step + 1, path);
    }, 300);
  } else {
    document.getElementById("canvas").removeChild(car);
  }
}

function roadNetwork() {
  let network = createArray(w, h); // Road network is flipped vs grid for the A* implementation

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

function createCar(x, y) {
  let car = document.createElement("div");
  car.classList = "car car-" + rand1toN(6);
  car.style.left = (x * 8) + "px";
  car.style.top = (y * 8) + "px";
  document.getElementById("canvas").appendChild(car);
  return car;
}

/*
 * Runs intermittently.
 * Probability of executing grows from 0.02% to a maximum of 100% depending on
 * the number of possible car spawn points exist. Car spawn points include any
 * road cell that has at least one of its four neighbouring cells as: a house,
 * supermarket, farm, outside of the canvas.
 * From this possible spawn points a random start and finish point is selected.
 * The A* algorithm is used to find the shortest path between these points, only
 * using road cells. If a path is found the car is created and begins its 
 * journey. 
 */
function tryCarDrive() {
  let startLocations = driveLocations();

  let p = Math.min(startLocations.length * 0.0002, 1);
  if (p >= Math.random()) {
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
          let car = createCar(sx, sy);
          drive(car, 1, path);
        }
      }
    }
  }

  setTimeout(tryCarDrive, 500);
}

function cellTypeMask(cellType) {
  let network = createArray(w, h); // Road network is flipped vs grid for the A* implementation

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].cellType == cellType) {
        network[x][y] = 1;
      } else {
        network[x][y] = 0;
      }
    }
  }
  return network;
}

function surroundedBy(x, y, obj) {
  if (x < 1 || y < 1 || x > w - 2 || y > h - 2) {
    return false;
  } else if (grid[y][x + 1].cellType != obj || 
    grid[y][x - 1].cellType != obj || 
    grid[y + 1][x].cellType != obj ||
    grid[y - 1][x].cellType != obj ||
    grid[y - 1][x - 1].cellType != obj ||
    grid[y + 1][x - 1].cellType != obj ||
    grid[y - 1][x + 1].cellType != obj ||
    grid[y + 1][x + 1].cellType != obj) {
    return false;
  }
  return true;
}

function fishingLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].cellType == "water" && surroundedBy(x, y, "water")) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

function boatSpawnLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].cellType == "water" && neighbourIs(x, y, "fishing")) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

function createBoat(x, y) {
  let boat = document.createElement("div");
  boat.classList = "boat";
  boat.style.left = (x * 8) + "px";
  boat.style.top = (y * 8) + "px";
  boat.spawnX = x;
  boat.spawnY = y;
  document.getElementById("canvas").appendChild(boat);
  return boat;
}

function boatPosition(boat) {
  // Remove 'px' and convert to int
  let x = parseInt(boat.style.left.slice(0, -2)) / 8;
  let y = parseInt(boat.style.top.slice(0, -2)) / 8;
  return [x, y];
}

function nextFishingLocation(boat) {
  let [sx, sy] = boatPosition(boat); // Current boat location

  let graph = new Graph(cellTypeMask("water"));
  let start = graph.grid[sx][sy];

  if (0.8 >= Math.random()) {
    // Find a new fishing location and move to it
    let finishLocations = fishingLocations();
    let [fx, fy] = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 2));

    if (fx != null) {
      let finish = graph.grid[fx][fy];
      let path = astar.search(graph, start, finish);
      if (path.length > 0) {
        // If found a path that the boat can take
        sail(boat, 1, path, false);
      }
    }
  } else {
    // Return home
    let finish = graph.grid[boat.spawnX][boat.spawnY];
    let path = astar.search(graph, start, finish);
    if (path.length > 0) {
      // If found a path that the boat can take
      sail(boat, 1, path, true);
    }
  }
}

/*
 * Runs intermittently.
 * Moves the car div along its input path with each run until it reaches the 
 * final location and the car is removed from the canvas.
 */
function sail(boat, step, path, destroyBoat) {
  if (step < path.length) {
    boat.style.left = (path[step].x * 8) + "px";
    boat.style.top = (path[step].y * 8) + "px";

    setTimeout(function () {
      sail(boat, step + 1, path, destroyBoat);
    }, 800);
  } else {
    if (destroyBoat) {
      document.getElementById("canvas").removeChild(boat);
    } else {
      let fishingTime = rand1toN(500) * 1000;
      setTimeout(function () {
        nextFishingLocation(boat);
      }, fishingTime);
    }
  }
}

function tryGoFishing() {
  let startLocations = boatSpawnLocations();

  let p = Math.min(startLocations.length * 0.0002, 1);
  if (p >= Math.random()) {
    let [sx, sy] = selectRandomLocation(startLocations);

    if (sx != null) {
      let finishLocations = fishingLocations();
      let [fx, fy] = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 2));

      if (fx != null) {
        let graph = new Graph(cellTypeMask("water"));
        let start = graph.grid[sx][sy];
        let finish = graph.grid[fx][fy];
        let path = astar.search(graph, start, finish);
        if (path.length > 0) {
          // If found a path that the boat can take
          let boat = createBoat(sx, sy);
          sail(boat, 1, path, false);
        }
      }
    }
  }

  setTimeout(tryGoFishing, 2000);
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

function farmBorder(x, y) {
  return grid[y][x].cellType == "grass" && neighbourIs(x, y, "farm");
}

function farmLocations() {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (farmBorder(x, y)) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

/*
 * Runs intermittently.
 * 5% probability of executing.
 * A random grass cell that has a farm cell as at least one of its four 
 * neighbours is selected. An animal div is created and placed at a random 
 * location within this cell.
 */
function spawnAnimals() {
  if (0.05 >= Math.random()) {
    let [x, y] = selectRandomLocation(farmLocations());
    if (x != null) {
      let animal = document.createElement("div");
      animal.classList = "sheep";
      // avoidDirection attribute to skip travelling in direction of last failed
      // move (gradually move away from obstacles)
      animal.avoidDirection = null;
      placeAnimalOverCell(x, y, animal);
      animals.push(animal);
      document.getElementById("canvas").appendChild(animal);
    }
  }

  // Increase timeout with each additional spanwed animal
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
  if (grid[y][x].cellType == "grass") {
    animal.top = animal.top - animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveDown(animal) {
  let [x, y] = coordsToCell(animal.left, animal.top + 5 + animalBuffer, );
  if (grid[y][x].cellType == "grass") {
    animal.top = animal.top + animalMovement;
    animal.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveLeft(animal) {
  let [x, y] = coordsToCell(animal.left - animalBuffer, animal.top);
  if (grid[y][x].cellType == "grass") {
    animal.left = animal.left - animalMovement;
    animal.style.left = animal.left + "px";
    return true;
  }
  return false;
}

function moveRight(animal) {
  let [x, y] = coordsToCell(animal.left + 5 + animalBuffer, animal.top);
  if (grid[y][x].cellType == "grass") {
    animal.left = animal.left + animalMovement;
    animal.style.left = animal.left + "px";
    return true;
  }
  return false;
}

/*
 * Runs intermittently.
 * Each animal has an 50% chance of moving, independent from owhether other 
 * animals move.
 * One of the four moving directions is selected randomly. The animal attempts
 * to move in this direction. If the move fails (i.e. the new location is not a 
 * grass cell), the animal remembers not to move in this direction again (until 
 * another failed move occurs and that direction is replaced). This has the
 * effect if gradually moving the animal away from any obsticles it encounters.
 */
function moveAnimals() {
  for (let i = 0, n = animals.length; i < n; i++) {
    if (0.5 >= Math.random()) {
      let r = rand1toN(4);
      let animal = animals[i];
      if (r == 1 && animal.avoidDirection != 1) {
        if (!moveDown(animal)) {
          animal.avoidDirection = r;
        }
      } else if (r == 2 && animal.avoidDirection != 2) {
        if (!moveUp(animal)) {
          animal.avoidDirection = r;
        }
      } else if (r == 3 && animal.avoidDirection != 3) {
        if (!moveLeft(animal)) {
          animal.avoidDirection = r;
        }
      } else if (r == 4 && animal.avoidDirection != 4) {
        if (!moveRight(animal)) {
          animal.avoidDirection = r;
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
      if (grid[y][x].cellType == "grass"&& neighbourIs(x, y, "forest")) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

/*
 * Runs intermittently.
 * 10% probability of executing.
 * Finds all cells of grass with at least one of its four neighbouring cells
 * a forest cell. Selects one of these cells randomly and changes it into a 
 * forest cell.
 */
function growForest() {
  if (0.1 >= Math.random()) {
    let locations = grassForestLocations();
    if (locations.length > 0) {
      // Pick a random grass location and change it to be a forest cell
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
setTimeout(tryGoFishing, 500);
setTimeout(spawnAnimals, 10000);
setTimeout(moveAnimals, 1000);
setTimeout(growForest, 100000);
