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
    }
    return [1, 1];
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
    }
    return [null, null];
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

function onGrid(w: number, h: number, x: number, y: number): boolean {
    return x >= 0 && x < w && y >= 0 && y < h;
}

export function cellTypeMask(
    grid: Cell[][],
    w: number,
    h: number,
    cellType: string
): number[][] {
    const network = createArray(w, h); // Road network is flipped vs grid to match the A* implementation
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
    // Check centre cell if off the canvas
    if (x < 1 || y < 1 || x > w - 2 || y > h - 2) {
        return false;
    }

    return (
        grid[y][x + 1].type === obj &&
        grid[y][x - 1].type === obj &&
        grid[y + 1][x].type === obj &&
        grid[y - 1][x].type === obj &&
        grid[y - 1][x - 1].type === obj &&
        grid[y + 1][x - 1].type === obj &&
        grid[y - 1][x + 1].type === obj &&
        grid[y + 1][x + 1].type === obj
    )
}
