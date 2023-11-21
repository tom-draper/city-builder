import { Config } from "../global.js";
import { Graph, astar } from "./astar.js";
import {
    createArray,
    type Cell,
    neighbourIs,
    onEdge,
    rand1toN,
    selectRandomLocation,
    filterByDistance,
} from "./canvas";

/*
 * Runs intermittently.
 * Moves the car div along its input path with each run until it reaches the
 * final location and the car is removed from the canvas.
 */
function drive(car: HTMLDivElement, step: number, path: any[], config: Config) {
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
            drive(car, step + 1, path, config);
        }, 300);
    } else {
        config.nCars -= 1;
        document.getElementById("canvas")?.removeChild(car);
    }
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

function driveLocations(grid: Cell[][], w: number, h: number): number[][] {
    const locations = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (grid[y][x].type !== "road") {
                continue;
            }

            const location = [x, y];
            if (onEdge(w, h, x, y) || neighbourIs(grid, w, h, x, y, "farm")) {
                locations.push(location);
            } else if (neighbourIs(grid, w, h, x, y, "house")) {
                // Give x2 greater weight to house locations
                locations.push(location, location);
            } else if (neighbourIs(grid, w, h, x, y, "supermarket")) {
                // Give x4 greater weight to supermarket locations
                locations.push(location, location, location);
            }
        }
    }
    return locations;
}

function roadNetwork(grid: Cell[][], w: number, h: number): number[][] {
    const network = createArray(h, w); // Road network is flipped vs grid for the A* implementation

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (grid[y][x].type === "road") {
                network[x][y] = 1;
            } else {
                network[x][y] = 0;
            }
        }
    }
    return network;
}

function createCar(x: number, y: number): HTMLDivElement {
    const car = document.createElement("div");
    car.className = "car car-" + rand1toN(6);
    car.style.left = x * 8 + "px";
    car.style.top = y * 8 + "px";
    document.getElementById("canvas")?.appendChild(car);
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
export function tryCarDrive(grid: Cell[][], config: Config) {
    const startLocations = driveLocations(grid, config.w, config.h);

    const p = Math.min(startLocations.length * 0.001, 1);
    if (p >= Math.random()) {
        const [sx, sy] = selectRandomLocation(startLocations);

        if (sx != null && sy != null) {
            const finishLocations = driveLocations(grid, config.w, config.h);
            const [fx, fy] = selectRandomLocation(
                filterByDistance(sx, sy, finishLocations, 10)
            );

            if (fx != null && fy != null) {
                const graph = new Graph(roadNetwork(grid, config.w, config.h));
                const start = graph.grid[sx][sy];
                const finish = graph.grid[fx][fy];
                const path = astar.search(graph, start, finish);
                if (path.length > 0) {
                    // If found a path that the car can take
                    const car = createCar(sx, sy);
                    config.nCars += 1;
                    drive(car, 1, path, config);
                }
            }
        }
    }

    setTimeout(() => {
        tryCarDrive(grid, config);
    }, 500);
}
