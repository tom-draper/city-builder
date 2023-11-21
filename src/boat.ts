import { Config } from "../global.js";
import { Graph, astar } from "./astar.js";
import {
    type Cell,
    cellTypeMask,
    distance,
    filterByDistance,
    neighbourIs,
    rand1toN,
    selectRandomLocation,
    surroundedBy,
} from "./canvas";

function fishingLocations(
    grid: Cell[][],
    w: number,
    h: number,
    currentX: number,
    currentY: number
): number[][] {
    const locations = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (
                grid[y][x].type === "water" &&
                surroundedBy(grid, w, h, x, y, "water") &&
                distance(x, y, currentX, currentY) > 2
            ) {
                locations.push([x, y]);
            }
        }
    }
    return locations;
}

function boatSpawnLocations(grid: Cell[][], w: number, h: number): number[][] {
    const locations = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (
                grid[y][x].type === "water" &&
                neighbourIs(grid, w, h, x, y, "fishing")
            ) {
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
    const boat: Boat = {
        div: document.createElement("div"),
        spawnX: x,
        spawnY: y,
    };
    boat.div.className = "boat";
    boat.div.style.left = x * 8 + "px";
    boat.div.style.top = y * 8 + "px";

    document.getElementById("canvas")?.appendChild(boat.div);
    return boat;
}

function boatPosition(boat: Boat): number[] {
    // Remove 'px' and convert to int
    const x = parseInt(boat.div.style.left.slice(0, -2)) / 8;
    const y = parseInt(boat.div.style.top.slice(0, -2)) / 8;
    return [x, y];
}

function nextFishingLocation(grid: Cell[][], w: number, h: number, boat: Boat) {
    const [sx, sy] = boatPosition(boat); // Current boat location

    const graph = new Graph(cellTypeMask(grid, w, h, "water"));
    const start = graph.grid[sx][sy];

    if (0.8 >= Math.random()) {
        // Find a new fishing location and move to it
        const finishLocations = fishingLocations(grid, w, h, sx, sy);
        const [fx, fy] = selectRandomLocation(
            filterByDistance(sx, sy, finishLocations, 2)
        );

        if (fx != null && fy != null) {
            const finish = graph.grid[fx][fy];
            const path = astar.search(graph, start, finish);
            if (path.length > 0) {
                // If found a path that the boat can take
                sail(grid, w, h, boat, 1, path, false);
            }
        }
    } else {
        // Return home
        const finish = graph.grid[boat.spawnX][boat.spawnY];
        const path = astar.search(graph, start, finish);
        if (path.length > 0) {
            // If found a path that the boat can take
            sail(grid, w, h, boat, 1, path, true);
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
function sail(
    grid: Cell[][],
    w: number,
    h: number,
    boat: Boat,
    step: number,
    path: any[],
    destroyBoat: boolean
) {
    if (step < path.length) {
        boat.div.style.left = path[step].x * 8 + "px";
        boat.div.style.top = path[step].y * 8 + "px";

        setTimeout(function () {
            sail(grid, w, h, boat, step + 1, path, destroyBoat);
        }, 1200);
    } else {
        if (destroyBoat) {
            document.getElementById("canvas")?.removeChild(boat.div);
        } else {
            const fishingTime = rand1toN(500) * 1000;
            setTimeout(function () {
                nextFishingLocation(grid, w, h, boat);
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
export function tryGoFishing(grid: Cell[][], config: Config) {
    const startLocations = boatSpawnLocations(grid, config.w, config.h);

    const p = Math.min(startLocations.length * 0.01, 1);
    if (p >= Math.random()) {
        const [sx, sy] = selectRandomLocation(startLocations);

        if (sx != null && sy != null) {
            const finishLocations = fishingLocations(
                grid,
                config.w,
                config.h,
                sx,
                sy
            );
            const [fx, fy] = selectRandomLocation(
                filterByDistance(sx, sy, finishLocations, 2)
            );

            if (fx != null && fy != null) {
                let graph = new Graph(cellTypeMask(grid, config.w, config.h, "water"));
                const start = graph.grid[sx][sy];
                const finish = graph.grid[fx][fy];
                const path = astar.search(graph, start, finish);
                if (path.length > 0) {
                    console.log("Spawning fishing boat");
                    // If found a path that the boat can take
                    const boat = createBoat(sx, sy);
                    sail(grid, config.w, config.h, boat, 1, path, false);
                }
            }
        }
    }

    setTimeout(() => {
        tryGoFishing(grid, config);
    }, 2000);
}
