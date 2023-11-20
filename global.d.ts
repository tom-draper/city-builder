import { Animal } from "./src/animals";

type Config = {
  w: number;
  h: number;
  nCars: number;
  currentObj: string;
  mouseDown: boolean;
  fillMode: boolean;
  waterPlaced: boolean;
  animals: Animal[];
  animalMovement: number;
  animalBuffer: number;
};
