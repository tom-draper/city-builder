function turnDraggedCellToObj() {
  if (mouseDown) {
    turnCellToObj(
      document.elementFromPoint(window.event.clientX, window.event.clientY)
    );
  }
}

function objSize(obj: string): number[] {
  if (obj == "road") {
    return [2, 2];
  } else {
    return [1, 1];
  }
}

function rand1toN(upTo: number): number {
  return Math.floor(Math.random() * upTo) + 1;
}

function applyObj(x: number, y: number) {
  let objClass = currentObj;

  if (currentObj == "water") {
    objClass = "water-" + rand1toN(3);
    if (!waterPlaced) {
      waterPlaced = true; // Begin animation
    }
  } else if (
    currentObj == "grass" ||
    currentObj == "sand" ||
    currentObj == "forest"
  ) {
    objClass = currentObj + "-" + rand1toN(5);
  } else if (currentObj == "hedge") {
    objClass = currentObj + "-" + rand1toN(3);
  }

  grid[y][x].className = "cell " + objClass;
  grid[y][x].type = currentObj;
}

function fill(cell: Cell, targetCellType: string) {
  if (cell.type == targetCellType) {
    const x = cell.x;
    const y = cell.y;
    applyObj(x, y);
    if (y < h - 1) {
      fill(grid[y + 1][x], targetCellType);
    }
    if (x < w - 1) {
      fill(grid[y][x + 1], targetCellType);
    }
    if (y > 0) {
      fill(grid[y - 1][x], targetCellType);
    }
    if (x > 0) {
      fill(grid[y][x - 1], targetCellType);
    }
  }
}

function turnCellToObj(cell: Cell) {
  if (fillMode) {
    if (cell.type != currentObj) {
      fill(cell, cell.type);
    }
  } else {
    const [objWidth, objHeight] = objSize(currentObj);
    for (let y = 0; y < objHeight; y++) {
      for (let x = 0; x < objWidth; x++) {
        if (onGrid(cell.x + x, cell.y + y)) {
          applyObj(cell.x + x, cell.y + y);
        }
      }
    }
  }
}

function setCurrentObj(obj: string) {
  document.getElementById(obj + "-btn").className = "active";
  document.getElementById(currentObj + "-btn").className = "";
  currentObj = obj;
}

function toggleFill() {
  fillMode = !fillMode;
  document.getElementById("fill-btn").classList.toggle("active");
  document.getElementById("fill-active").classList.toggle("fill-inactive");
}

function createArray2(length: number): any[][] {
  let arr = new Array(length || 0);
  let i = length;

  if (arguments.length > 1) {
    let args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = createArray.apply(this, args);
  }
  return arr;
}

function createArray(h: number, w: number): any[][] {
  return new Array(h).fill(null).map(() => new Array(w).fill(null));
}

interface Cell extends HTMLDivElement {
  type: string;
  x: number;
  y: number;
}

function createCell(x: number, y: number): Cell {
  let cell: Cell = document.createElement("div");
  cell.className = "cell neutral ";
  cell.type = "neutral";
  cell.x = x;
  cell.y = y;
  return cell;
}

function createGrid() {
  let grid = createArray(h, w);
  let canvas = document.getElementById("canvas");

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Modified HTMLDivElement, with additional attributes 'type', 'x' and 'y'
      // Using a HTMLDivElement rather than a custom Cell type as its information
      // can be accessed through document.elementFromPoint
      let cell = createCell(x, y);

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

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBlue(): string {
  return `rgb(${randInt(28, 40)},${randInt(165, 185)},${randInt(240, 255)})`;
}

function animateWater() {
  if (waterPlaced) {
    document.documentElement.style.setProperty("--water-1", randomBlue());
    document.documentElement.style.setProperty("--water-2", randomBlue());
    document.documentElement.style.setProperty("--water-3", randomBlue());
  }

  setTimeout(animateWater, 2000);
}

function neighbourIs(x: number, y: number, obj: string): boolean {
  return (
    (x < w - 1 && grid[y][x + 1].type == obj) ||
    (x > 0 && grid[y][x - 1].type == obj) ||
    (y < h - 1 && grid[y + 1][x].type == obj) ||
    (y > 0 && grid[y - 1][x].type == obj)
  );
}

function onEdge(x: number, y: number): boolean {
  return y == 0 || y == w - 1 || x == 0 || x == h - 1;
}

function driveLocations(): number[][] {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].type == "road") {
        const location = [x, y];
        if (onEdge(x, y) || neighbourIs(x, y, "farm")) {
          locations.push(location);
        } else if (neighbourIs(x, y, "house")) {
          // Give x2 greater weight to house locations
          locations.push(location, location);
        } else if (neighbourIs(x, y, "supermarket")) {
          // Give x4 greater weight to supermarket locations
          locations.push(location, location, location);
        }
      }
    }
  }
  return locations;
}

function selectRandomLocation(locations: number[][]): number[] | null[] {
  if (locations.length > 0) {
    return locations[Math.floor(Math.random() * locations.length)];
  } else {
    return [null, null];
  }
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function filterByDistance(
  startx: number,
  starty: number,
  locations: number[][],
  maxd: number
): number[][] {
  let filteredLocations = [];
  for (let i = 0, n = locations.length; i < n; i++) {
    const [x, y] = locations[i];
    if (distance(startx, starty, x, y) > maxd) {
      filteredLocations.push(locations[i]);
    }
  }
  return filteredLocations;
}

function indexOfNode(arr: any[][], value: any[]): number {
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

function removeNode(arr: any[][], node: any[]): any[][] {
  let index = indexOfNode(arr, node);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function onGrid(x: number, y: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < h;
}

async function smoothMove(
  object: HTMLDivElement,
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number
) {
  let nextX = currentX;
  const diffX = targetX - currentX;
  if (diffX > 0) {
    nextX += 4;
  } else if (diffX < 0) {
    nextX -= 4;
  }

  let nextY = currentY;
  const diffY = targetY - currentY;
  if (diffY > 0) {
    nextY += 4;
  } else if (diffY < 0) {
    nextY -= 4;
  }
  object.style.left = nextX + "px";
  object.style.top = nextY + "px";

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
function drive(car: HTMLDivElement, step: number, path: any[]) {
  if (step < path.length) {
    car.style.left = path[step].x * 8 + "px";
    car.style.top = path[step].y * 8 + "px";
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
    nCars -= 1;
    document.getElementById("canvas").removeChild(car);
  }
}

function roadNetwork(): number[][] {
  let network = createArray(w, h); // Road network is flipped vs grid for the A* implementation

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].type == "road") {
        network[x][y] = 1;
      } else {
        network[x][y] = 0;
      }
    }
  }
  return network;
}

function createCar(x: number, y: number): HTMLDivElement {
  let car = document.createElement("div");
  car.className = "car car-" + rand1toN(6);
  car.style.left = x * 8 + "px";
  car.style.top = y * 8 + "px";
  document.getElementById("canvas").appendChild(car);
  return car;
}

/*
 * Runs intermittently.
 * Probability of executing grows from 0.02% to a maximum of 100% depending on
 * the number of existing car spawn points. Car spawn points include any
 * road cell that has at least one of its four neighbouring cells as: a house,
 * supermarket, farm, outside of the canvas.
 * From this possible spawn points a random start and finish point is selected.
 * The A* algorithm is used to find the shortest path between these points, only
 * using road cells. If a path is found, the car is created and begins its
 * journey.
 */
function tryCarDrive() {
  const startLocations = driveLocations();

  const p = Math.min(startLocations.length * 0.001, 1);
  if (p >= Math.random()) {
    const [sx, sy] = selectRandomLocation(startLocations);

    if (sx != null && sy != null) {
      const finishLocations = driveLocations();
      const [fx, fy] = selectRandomLocation(
        filterByDistance(sx, sy, finishLocations, 10)
      );

      if (fx != null && fy != null) {
        let graph = new Graph(roadNetwork());
        const start = graph.grid[sx][sy];
        const finish = graph.grid[fx][fy];
        const path = astar.search(graph, start, finish);
        if (path.length > 0) {
          // If found a path that the car can take
          let car = createCar(sx, sy);
          nCars += 1;
          drive(car, 1, path);
        }
      }
    }
  }

  setTimeout(tryCarDrive, 500);
}

function cellTypeMask(cellType: string): number[][] {
  let network = createArray(w, h); // Road network is flipped vs grid to match the A* implementation

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].type == cellType) {
        network[x][y] = 1;
      } else {
        network[x][y] = 0;
      }
    }
  }
  return network;
}

function surroundedBy(x: number, y: number, obj: string): boolean {
  if (x < 1 || y < 1 || x > w - 2 || y > h - 2) {
    return false;
  } else if (
    grid[y][x + 1].type != obj ||
    grid[y][x - 1].type != obj ||
    grid[y + 1][x].type != obj ||
    grid[y - 1][x].type != obj ||
    grid[y - 1][x - 1].type != obj ||
    grid[y + 1][x - 1].type != obj ||
    grid[y - 1][x + 1].type != obj ||
    grid[y + 1][x + 1].type != obj
  ) {
    return false;
  }
  return true;
}

function fishingLocations(currentX: number, currentY: number): number[][] {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (
        grid[y][x].type == "water" &&
        surroundedBy(x, y, "water") &&
        distance(x, y, currentX, currentY) > 2
      ) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

function boatSpawnLocations(): number[][] {
  let locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].type == "water" && neighbourIs(x, y, "fishing")) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

type Boat = {
  div: HTMLDivElement;
  spawnX: number;
  spawnY: number;
};

function createBoat(x: number, y: number): Boat {
  let boat: Boat = {
    div: document.createElement("div"),
    spawnX: x,
    spawnY: y,
  };
  boat.div.className = "boat";
  boat.div.style.left = x * 8 + "px";
  boat.div.style.top = y * 8 + "px";

  document.getElementById("canvas").appendChild(boat.div);
  return boat;
}

function boatPosition(boat: Boat): number[] {
  // Remove 'px' and convert to int
  let x = parseInt(boat.div.style.left.slice(0, -2)) / 8;
  let y = parseInt(boat.div.style.top.slice(0, -2)) / 8;
  return [x, y];
}

function nextFishingLocation(boat: Boat) {
  const [sx, sy] = boatPosition(boat); // Current boat location

  const graph = new Graph(cellTypeMask("water"));
  const start = graph.grid[sx][sy];

  if (0.8 >= Math.random()) {
    // Find a new fishing location and move to it
    const finishLocations = fishingLocations(sx, sy);
    const [fx, fy] = selectRandomLocation(
      filterByDistance(sx, sy, finishLocations, 2)
    );

    if (fx != null && fy != null) {
      const finish = graph.grid[fx][fy];
      const path = astar.search(graph, start, finish);
      if (path.length > 0) {
        // If found a path that the boat can take
        sail(boat, 1, path, false);
      }
    }
  } else {
    // Return home
    const finish = graph.grid[boat.spawnX][boat.spawnY];
    const path = astar.search(graph, start, finish);
    if (path.length > 0) {
      // If found a path that the boat can take
      sail(boat, 1, path, true);
    }
  }
}

/*
 * Runs intermittently.
 * Moves the boat div along its input path with each run until it reaches the
 * final location. The boat then waits for a random amount of time before
 * sailing to a new location or returning to its original spawn point and
 * despawning.
 */
function sail(boat: Boat, step: number, path: any[], destroyBoat: boolean) {
  if (step < path.length) {
    boat.div.style.left = path[step].x * 8 + "px";
    boat.div.style.top = path[step].y * 8 + "px";

    setTimeout(function () {
      sail(boat, step + 1, path, destroyBoat);
    }, 1200);
  } else {
    if (destroyBoat) {
      document.getElementById("canvas").removeChild(boat.div);
    } else {
      const fishingTime = rand1toN(500) * 1000;
      setTimeout(function () {
        nextFishingLocation(boat);
      }, fishingTime);
    }
  }
}

/*
 * Runs intermittently.
 * Probability of executing grows from 0.02% to a maximum of 100% depending on
 * the number of existing boat spawn points. Boat spawn points include any
 * water cell that has at least one of its four neighbouring cells as a fishing
 * hut. Fishing locatiosn are water cells that are also surrounded by water cells.
 * A random boat spawn point is selected as the starting location, and a random
 * fishing location is selected as the finishing location.
 * The A* algorithm is used to find the shortest path between these points, only
 * using water cells. If a path is found, the boat is created at the selected
 * spawn point and sails to its fishing location. It then repeatedly waits for
 * a random amount of time followed by either: sailing to a new fishing location,
 * or returning home and removed from the map.
 */
function tryGoFishing() {
  const startLocations = boatSpawnLocations();

  // const p = Math.min(startLocations.length * 0.0002, 1);
  const p = Math.min(startLocations.length * 0.01, 1);
  if (p >= Math.random()) {
    const [sx, sy] = selectRandomLocation(startLocations);

    if (sx != null && sy != null) {
      const finishLocations = fishingLocations(sx, sy);
      const [fx, fy] = selectRandomLocation(
        filterByDistance(sx, sy, finishLocations, 2)
      );

      if (fx != null && fy != null) {
        let graph = new Graph(cellTypeMask("water"));
        const start = graph.grid[sx][sy];
        const finish = graph.grid[fx][fy];
        const path = astar.search(graph, start, finish);
        console.log(path);
        if (path.length > 0) {
          console.log("Spawning fishing boat");
          // If found a path that the boat can take
          let boat = createBoat(sx, sy);
          sail(boat, 1, path, false);
        }
      }
    }
  }

  setTimeout(tryGoFishing, 2000);
}

function cellToCoord(x: number, y: number): number[] {
  return [x * 8, y * 8];
}

function placeAnimalOverCell(x: number, y: number, animal: Animal) {
  let [xCoord, yCoord] = cellToCoord(x, y);
  animal.left = xCoord + Math.floor(Math.random() * 3);
  animal.top = yCoord + Math.floor(Math.random() * 3);
  animal.div.style.left = animal.left + "px";
  animal.div.style.top = animal.top + "px";
}

function farmBorder(x: number, y: number): boolean {
  return grid[y][x].type == "grass" && neighbourIs(x, y, "farm");
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

type Animal = {
  div: HTMLDivElement;
  top: number | null;
  left: number | null;
  avoidDirection: number | null;
};

function createAnimal(): Animal {
  let animal: Animal = {
    div: document.createElement("div"),
    top: null,
    left: null,
    avoidDirection: null,
  };
  if (Math.round(Math.random())) {
    animal.div.className = "sheep";
  } else {
    animal.div.className = "cow";
  }
  return animal;
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
    const [x, y] = selectRandomLocation(farmLocations());
    if (x != null && y != null) {
      let animal = createAnimal();
      placeAnimalOverCell(x, y, animal);
      animals.push(animal);
      document.getElementById("canvas").appendChild(animal.div);
    }
  }

  // Increase timeout with each additional spanwed animal
  setTimeout(spawnAnimals, (animals.length + 1) * 1000);
}

function coordsToCell(xCoord: number, yCoord: number): number[] {
  return [Math.floor(xCoord / 8), Math.floor(yCoord / 8)];
}

function cellIs(x: number, y: number, cellType: string): boolean {
  return grid[y][x].type == cellType;
}

function moveUp(animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left, animal.top - animalBuffer);
  if (grid[y][x].type == "grass") {
    animal.top = animal.top - animalMovement;
    animal.div.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveDown(animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left, animal.top + 5 + animalBuffer);
  if (grid[y][x].type == "grass") {
    animal.top = animal.top + animalMovement;
    animal.div.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveLeft(animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left - animalBuffer, animal.top);
  if (grid[y][x].type == "grass") {
    animal.left = animal.left - animalMovement;
    animal.div.style.left = animal.left + "px";
    return true;
  }
  return false;
}

function moveRight(animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left + 5 + animalBuffer, animal.top);
  if (grid[y][x].type == "grass") {
    animal.left = animal.left + animalMovement;
    animal.div.style.left = animal.left + "px";
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
      const r = rand1toN(4);
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
      if (grid[y][x].type == "grass" && neighbourIs(x, y, "forest")) {
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
      const [x, y] = locations[Math.floor(Math.random() * locations.length)];
      grid[y][x].className = "cell forest-" + rand1toN(5);
      grid[y][x].type = "forest";
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
let nCars = 0;
let animals: Animal[] = [];
let animalMovement = 2;
let animalBuffer = 6;

let grid: Cell[][] = createGrid();

setTimeout(animateWater, 2000);
setTimeout(tryCarDrive, 500);
setTimeout(tryGoFishing, 2000);
setTimeout(spawnAnimals, 10000);
setTimeout(moveAnimals, 1000);
setTimeout(growForest, 100000);
