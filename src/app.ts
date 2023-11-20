import { Cell, createGrid, animateWater } from "./terrain";
import { tryGoFishing } from "./boat";
import { spawnAnimals, moveAnimals } from "./animals";
import { growForest } from "./terrain";
import { tryCarDrive } from "./car";
import { Config } from "../global";

// Used by index.html buttons to change brush type
function setCurrentObj(config: Config, obj: string) {
  document.getElementById(obj + "-btn").className = "active";
  document.getElementById(config.currentObj + "-btn").className = "";
  config.currentObj = obj;
}

// Used by index.html button to toggle fill mode
function toggleFill(config: Config) {
  config.fillMode = !config.fillMode;
  document.getElementById("fill-btn")?.classList.toggle("active");
  document.getElementById("fill-active")?.classList.toggle("fill-inactive");
}

function run() {
  const config: Config = {
    w: 170,
    h: 100,
    nCars: 0,
    currentObj: "road",
    mouseDown: false,
    fillMode: false,
    waterPlaced: false,
    animals: [],
    animalMovement: 2,
    animalBuffer: 6,
  };

  // Store config in functions used by index.html to allow buttons to manipulate 
  // the current state
  //@ts-ignore
  document.setCurrentObj = (obj) => {setCurrentObj(config, obj)};
  //@ts-ignore
  document.toggleFill = () => {toggleFill(config)};

  const grid: Cell[][] = createGrid(config);

  setTimeout(() => {
    animateWater(config);
  }, 2000);
  setTimeout(() => {
    tryCarDrive(grid, config);
  }, 500);
  setTimeout(() => {
    tryGoFishing(grid, config);
  }, 2000);
  setTimeout(() => {
    spawnAnimals(grid, config);
  }, 10000);
  setTimeout(() => {
    moveAnimals(grid, config);
  }, 1000);
  setTimeout(() => {
    growForest(grid, config);
  }, 100000);
}

run();
