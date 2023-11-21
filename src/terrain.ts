import { Config } from "../global";
import { type Cell, neighbourIs, rand1toN } from "./canvas";

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

    setTimeout(() => {
        animateWater(config);
    }, 2000);
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
        const locations = grassForestLocations(grid, config.w, config.h);
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
