import { Config } from "../global";
import { Cell, neighbourIs, rand1toN, selectRandomLocation } from "./terrain";

function cellToCoord(x: number, y: number): number[] {
  return [x * 8, y * 8];
}

function placeAnimalOverCell(x: number, y: number, animal: Animal) {
  const [xCoord, yCoord] = cellToCoord(x, y);
  animal.left = xCoord + Math.floor(Math.random() * 3);
  animal.top = yCoord + Math.floor(Math.random() * 3);
  animal.div.style.left = animal.left + "px";
  animal.div.style.top = animal.top + "px";
}

function farmBorder(grid: Cell[][], w: number, h: number, x: number, y: number) {
  return grid[y][x].type === "grass" && neighbourIs(grid, w, h, x, y, "farm");
}

function farmLocations(grid: Cell[][], w: number, h: number): number[][] {
  const locations = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (farmBorder(grid, w, h, x, y)) {
        locations.push([x, y]);
      }
    }
  }
  return locations;
}

export type Animal = {
  div: HTMLDivElement;
  top: number;
  left: number;
  avoidDirection: number;
};

function createAnimal(): Animal {
  const animal: Animal = {
    div: document.createElement("div"),
    top: 0,
    left: 0,
    avoidDirection: 0,
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
export function spawnAnimals(grid: Cell[][], config: Config) {
  if (0.05 >= Math.random()) {
    const [x, y] = selectRandomLocation(farmLocations(grid, config.w, config.h));
    if (x != null && y != null) {
      let animal = createAnimal();
      placeAnimalOverCell(x, y, animal);
      config.animals.push(animal);
      document.getElementById("canvas")?.appendChild(animal.div);
    }
  }

  // Increase timeout with each additional spanwed animal
  setTimeout(() => {spawnAnimals(grid, config)}, (config.animals.length + 1) * 1000);
}

function coordsToCell(xCoord: number, yCoord: number): number[] {
  return [Math.floor(xCoord / 8), Math.floor(yCoord / 8)];
}

function cellIs(grid: Cell[][], x: number, y: number, cellType: string): boolean {
  return grid[y][x].type == cellType;
}

function moveUp(grid: Cell[][], config: Config, animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left, animal.top - config.animalBuffer);
  if (grid[y][x].type === "grass") {
    animal.top = animal.top - config.animalMovement;
    animal.div.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveDown(grid: Cell[][], config: Config, animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left, animal.top + 5 + config.animalBuffer);
  if (grid[y][x].type === "grass") {
    animal.top = animal.top + config.animalMovement;
    animal.div.style.top = animal.top + "px";
    return true;
  }
  return false;
}

function moveLeft(grid: Cell[][], config: Config, animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left - config.animalBuffer, animal.top);
  if (grid[y][x].type === "grass") {
    animal.left = animal.left - config.animalMovement;
    animal.div.style.left = animal.left + "px";
    return true;
  }
  return false;
}

function moveRight(grid: Cell[][], config: Config, animal: Animal): boolean {
  const [x, y] = coordsToCell(animal.left + 5 + config.animalBuffer, animal.top);
  if (grid[y][x].type === "grass") {
    animal.left = animal.left + config.animalMovement;
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
export function moveAnimals(grid: Cell[][], config: Config) {
  for (let i = 0, n = config.animals.length; i < n; i++) {
    if (0.5 >= Math.random()) {
      const r = rand1toN(4);
      const animal = config.animals[i];
      if (r === 1 && animal.avoidDirection != 1) {
        if (!moveDown(grid, config, animal)) {
          animal.avoidDirection = r;
        }
      } else if (r === 2 && animal.avoidDirection != 2) {
        if (!moveUp(grid, config, animal)) {
          animal.avoidDirection = r;
        }
      } else if (r === 3 && animal.avoidDirection != 3) {
        if (!moveLeft(grid, config, animal)) {
          animal.avoidDirection = r;
        }
      } else if (r === 4 && animal.avoidDirection != 4) {
        if (!moveRight(grid, config, animal)) {
          animal.avoidDirection = r;
        }
      }
    }
  }

  setTimeout(() => {moveAnimals(grid, config)}, 1000);
}
