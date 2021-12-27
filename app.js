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
  if (fillMode && (currentObj == "grass" || currentObj == "water" || currentObj == "forest")) {
    fill(cell);
  } else {
    let [objWidth, objHeight] = objSize(currentObj);
    for (let i = 0; i < objHeight; i++) {
      for (let j = 0; j < objWidth; j++) {
        if (onGrid(cell.x+i, cell.y+j)) {
          await applyObj(cell.x+i, cell.y+j);
        }
      }
    }
  }
}

function setCurrentObj(obj) {
  document.getElementById("roadBtn").classList.remove("active");
  document.getElementById("waterBtn").classList.remove("active");
  document.getElementById("grassBtn").classList.remove("active");
  document.getElementById("forestBtn").classList.remove("active");
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
  let grid = createArray(h, w);

  let container = document.getElementById("canvas");
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
  let down = false;
  let up = false;
  let left = false;
  let right = false;
  if (x < w-1) {
    down = grid[x+1][y].className == classN;
  }
  if (y < h-1) {
    right = grid[x][y+1].className == classN;
  }
  if (x > 0) {
    left = grid[x-1][y].className == classN;
  }
  if (y > 0) {
    up = grid[x][y-1].className == classN;
  }
  return (up || down || left || right
  );
}

function onEdge(x, y) {
  return (x == 0 || y == 0 || x == h-1 || y == w-1);
}

function driveLocations() {
  let locations = [];
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (grid[i][j].className == "cell road") {
        if (onEdge(i, j) || neighbourIs(i, j, "farm")) {
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
  let filteredLocations = [];
  locations.forEach((element) => {
    let [x, y] = element;
    if (distance(startx, starty, x, y) > maxd) {
      filteredLocations.push(element);
    }
  });
  return filteredLocations;
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
  let network = createArray(h, w);

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

  let p = Math.min(startLocations.length*0.0001, 1);

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
          console.log('Car driving from (' + sx + ', ', + sy + ') to (' + fx + ', ', + fy + ')');
          carDrive([sx, sy], null, 0, path, "car-" + rand1toN(6));
        }
      }
    }
  }

  setTimeout(tryCarDrive, 1000);
}

function cellToCoord(x, y) {
  return [x * 8, y * 8];
}

function placeAnimalOverCell(x, y, animal, size) {
  let [xCoord, yCoord] = cellToCoord(x, y);
  animal.top = xCoord + Math.floor(Math.random() * 3);
  animal.left = yCoord + Math.floor(Math.random() * 3);
  // animal.top = xCoord;
  // animal.left = yCoord;
  animal.style.top = animal.top + 'px';
  animal.style.left = animal.left + 'px';
}

function farmLocation(x, y) {
  return cellIsGrass(x, y) && neighbourIs(x, y, "farm");
}

function farmLocations() {
  let locations = [];
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (farmLocation(i, j)) {
        locations.push([i, j]);
      }
    }
  }

  return locations;
}

function spawnAnimals() {
  if (0.01>= Math.random()) {
    let [x, y] = selectRandomLocation(farmLocations());
    if (x != null) {
      console.log('Spawning animal at ', x, y);
      let animal = document.createElement("div");
      animal.classList = 'sheep';
      placeAnimalOverCell(x, y, animal, 5);
      animals.push(animal);
      document.getElementById('canvas').appendChild(animal);
    }
  }

  setTimeout(spawnAnimals, animals.length*1000);
}

function coordsToCell(xCoord, yCoord) {
  return [Math.floor(xCoord/8), Math.floor(yCoord/8)];
}

function cellIsGrass(x, y) {
  return grid[x][y].className.slice(0, 10) == "cell grass";
}

function moveUp(animal, buffer, movement) {
  let [x, y] = coordsToCell(animal.top-buffer, animal.left);
  // console.log(x, y);
  // console.log("attempting up");
  if (cellIsGrass(x, y)) {
    // console.log("moving animal up");
    animal.top = animal.top - movement;
    animal.style.top = animal.top + 'px';
    return true;
  }
  return false;
}
function moveDown(animal, buffer, movement) {
  let [x, y] = coordsToCell(animal.top+5+buffer, animal.left);
  // console.log(x, y);
  // console.log("attempting down");
  if (cellIsGrass(x, y)) {
    // console.log("moving animal down");
    animal.top = animal.top + movement;
    animal.style.top = animal.top + 'px';
    return true;
  }
  return false;
}
function moveLeft(animal, buffer, movement) {
  let [x, y] = coordsToCell(animal.top, animal.left-buffer);
  // console.log(x, y);
  // console.log("attempting left");
  if (cellIsGrass(x, y)) {
    // console.log("moving animal left");
    animal.left = animal.left - movement;
    animal.style.left = animal.left + 'px';
    return true;
  }
  return false;
}
function moveRight(animal, buffer, movement) {
  let [x, y] = coordsToCell(animal.top, animal.left+5+buffer);
  // console.log(x, y);
  // console.log("attempting right");
  if (cellIsGrass(x, y)) {
    // console.log("moving animal right");
    animal.left =  animal.left + movement;
    animal.style.left = animal.left + 'px';
    return true;
  }
  return false;
}

function moveAnimals() {
  let movement = 3;
  let buffer = 4;
  let p = 0.4;

  let nAnimals = animals.length;
  for (let i = 0; i < nAnimals; i++) {
    if (p >= Math.random()) {
      let n = rand1toN(4);
      if (n == 1) {
        if (!moveDown(animals[i], buffer, movement)) {
          moveUp(animals[i], buffer, movement);
        }
      } else if (n == 2) {
        if (!moveUp(animals[i], buffer, movement)) {
          moveDown(animals[i], buffer, movement);
        }
      } else if (n == 3) {
        if (!moveLeft(animals[i], buffer, movement)) {
          moveRight(animals[i], buffer, movement);
        }
      } else {
        if (!moveRight(animals[i], buffer, movement)) {
          moveLeft(animals[i], buffer, movement);
        }
      }
    }
  }
  
  setTimeout(moveAnimals, 1000);
}


var w = 180;
var h = 110;
var currentObj = "road";
var mouseDown = false;
var fillMode = false;
var waterPlaced = false;
var animals = [];

var grid = createGrid();

setTimeout(updateWater, 2000);
setTimeout(tryCarDrive, 1000);
setTimeout(spawnAnimals, 10000);
setTimeout(moveAnimals, 1000);