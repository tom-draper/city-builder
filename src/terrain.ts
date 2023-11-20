import { Config } from "../global";

function turnDraggedCellToObj(grid: Cell[][], config: Config) {
  if (!config.mouseDown) {
    return;
  }
  turnCellToObj(
    grid,
    config,
    //@ts-ignore
    document.elementFromPoint(window.event.clientX, window.event.clientY)
  );
}

function objSize(obj: string) {
  if (obj === "road") {
    return [2, 2];
  } else {
    return [1, 1];
  }
}

export function rand1toN(upTo: number) {
  return Math.floor(Math.random() * upTo) + 1;
}

function applyObj(grid: Cell[][], config: Config, x: number, y: number) {
  let objClass = config.currentObj;
  if (objClass === "water") {
    objClass = "water-" + rand1toN(3);
    if (!config.waterPlaced) {
      config.waterPlaced = true; // Begin animation
    }
  } else if (
    config.currentObj === "grass" ||
    config.currentObj === "sand" ||
    config.currentObj === "forest"
  ) {
    objClass = config.currentObj + "-" + rand1toN(5);
  } else if (config.currentObj == "hedge") {
    objClass = config.currentObj + "-" + rand1toN(3);
  }

  grid[y][x].className = "cell " + objClass;
  grid[y][x].type = config.currentObj;
}

function fill(
  grid: Cell[][],
  config: Config,
  cell: Cell,
  targetCellType: string
) {
  if (cell.type == targetCellType) {
    const x = cell.x;
    const y = cell.y;
    applyObj(grid, config, x, y);
    if (y < config.h - 1) {
      fill(grid, config, grid[y + 1][x], targetCellType);
    }
    if (x < config.w - 1) {
      fill(grid, config, grid[y][x + 1], targetCellType);
    }
    if (y > 0) {
      fill(grid, config, grid[y - 1][x], targetCellType);
    }
    if (x > 0) {
      fill(grid, config, grid[y][x - 1], targetCellType);
    }
  }
}

function turnCellToObj(grid: Cell[][], config: Config, cell: Cell) {
  if (config.fillMode) {
    if (cell.type != config.currentObj) {
      fill(grid, config, cell, cell.type);
    }
  } else {
    const [objWidth, objHeight] = objSize(config.currentObj);
    for (let y = 0; y < objHeight; y++) {
      for (let x = 0; x < objWidth; x++) {
        if (onGrid(config.w, config.h, cell.x + x, cell.y + y)) {
          applyObj(grid, config, cell.x + x, cell.y + y);
        }
      }
    }
  }
}



// function createArray2(length: number): any[][] {
//     const arr = new Array(length || 0);
//     let i = length;

//     if (arguments.length > 1) {
//         const args = Array.prototype.slice.call(arguments, 1);
//         while (i--) arr[length - 1 - i] = createArray.apply(this, args);
//     }
//     return arr;
// }

export function createArray(w: number, h: number): any[][] {
  return new Array(h).fill(null).map(() => new Array(w).fill(null));
}

export interface Cell extends HTMLDivElement {
  type: string;
  x: number;
  y: number;
}

function createCell(x: number, y: number): Cell {
  const cell = document.createElement("div") as Cell;
  cell.className = "cell neutral ";
  cell.type = "neutral";
  cell.x = x;
  cell.y = y;
  return cell;
}

export function createGrid(config: Config): Cell[][] {
  const grid = createArray(config.w, config.h);
  const canvas = document.getElementById("canvas");
  if (canvas === null) {
    return [];
  }

  for (let y = 0; y < config.h; y++) {
    for (let x = 0; x < config.w; x++) {
      // Modified HTMLDivElement, with additional attributes 'type', 'x' and 'y'
      // Using a HTMLDivElement rather than a custom Cell type as its information
      // can be accessed through document.elementFromPoint
      const cell = createCell(x, y);

      cell.addEventListener(
        "mousedown",
        function () {
          config.mouseDown = true;
          turnCellToObj(grid, config, this as Cell);
        },
        false
      );
      cell.addEventListener(
        "mousemove",
        () => {
          turnDraggedCellToObj(grid, config);
        },
        false
      );
      cell.addEventListener(
        "mouseup",
        function () {
          config.mouseDown = false;
        },
        false
      );
      grid[y][x] = cell;
      canvas.appendChild(cell);
    }
  }

  // If mouse released outside of the canvas, reset mouseDown flag
  document.getElementById("main")?.addEventListener(
    "mouseup",
    function () {
      config.mouseDown = false;
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

export function animateWater(config: Config) {
  if (config.waterPlaced) {
    document.documentElement.style.setProperty("--water-1", randomBlue());
    document.documentElement.style.setProperty("--water-2", randomBlue());
    document.documentElement.style.setProperty("--water-3", randomBlue());
  }

  setTimeout(() => {animateWater(config)}, 2000);
}

export function neighbourIs(
  grid: Cell[][],
  w: number,
  h: number,
  x: number,
  y: number,
  obj: string
) {
  return (
    (x < w - 1 && grid[y][x + 1].type === obj) ||
    (x > 0 && grid[y][x - 1].type === obj) ||
    (y < h - 1 && grid[y + 1][x].type === obj) ||
    (y > 0 && grid[y - 1][x].type === obj)
  );
}

export function onEdge(w: number, h: number, x: number, y: number) {
  return y === 0 || y === w - 1 || x === 0 || x === h - 1;
}

export function selectRandomLocation(locations: number[][]): number[] | null[] {
  if (locations.length > 0) {
    return locations[Math.floor(Math.random() * locations.length)];
  } else {
    return [null, null];
  }
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function filterByDistance(
  startx: number,
  starty: number,
  locations: number[][],
  maxd: number
): number[][] {
  const filteredLocations = [];
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
      arr[i][0] === value[0] &&
      arr[i][1] === value[1] &&
      arr[i][2] === value[2]
    ) {
      return i;
    }
  }
  return -1;
}

export function removeNode(arr: any[][], node: any[]): any[][] {
  const index = indexOfNode(arr, node);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function onGrid(w: number, h: number, x: number, y: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < h;
}

export async function smoothMove(
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

export function cellTypeMask(
  grid: Cell[][],
  w: number,
  h: number,
  cellType: string
): number[][] {
  let network = createArray(w, h); // Road network is flipped vs grid to match the A* implementation

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x].type === cellType) {
        network[x][y] = 1;
      } else {
        network[x][y] = 0;
      }
    }
  }
  return network;
}

export function surroundedBy(
  grid: Cell[][],
  w: number,
  h: number,
  x: number,
  y: number,
  obj: string
): boolean {
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

function grassForestLocations(grid: Cell[][], w: number, h: number) {
  const locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (
        grid[y][x].type === "grass" &&
        neighbourIs(grid, w, h, x, y, "forest")
      ) {
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
export function growForest(grid: Cell[][], config: Config) {
  if (0.1 >= Math.random()) {
    let locations = grassForestLocations(grid, config.w, config.h);
    if (locations.length > 0) {
      // Pick a random grass location and change it to be a forest cell
      const [x, y] = locations[Math.floor(Math.random() * locations.length)];
      grid[y][x].className = "cell forest-" + rand1toN(5);
      grid[y][x].type = "forest";
    }
  }

  setTimeout(() => {
    growForest(grid, config);
  }, 100000);
}
