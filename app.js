var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function turnDraggedCellToObj() {
    if (mouseDown) {
        turnCellToObj(document.elementFromPoint(window.event.clientX, window.event.clientY));
    }
}
function objSize(obj) {
    if (obj == "road") {
        return [2, 2];
    }
    else {
        return [1, 1];
    }
}
function rand1toN(upTo) {
    return Math.floor(Math.random() * upTo) + 1;
}
function applyObj(x, y) {
    var objClass = currentObj;
    if (currentObj == "water") {
        objClass = "water-" + rand1toN(3);
        if (!waterPlaced) {
            waterPlaced = true; // Begin animation
        }
    }
    else if (currentObj == "grass" || currentObj == "sand" || currentObj == "forest") {
        objClass = currentObj + "-" + rand1toN(5);
    }
    else if (currentObj == "hedge") {
        objClass = currentObj + "-" + rand1toN(3);
    }
    grid[y][x].className = "cell " + objClass;
    grid[y][x].type = currentObj;
}
function fill(cell, targetCellType) {
    if (cell.type == targetCellType) {
        var x = cell.x;
        var y = cell.y;
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
function turnCellToObj(cell) {
    if (fillMode) {
        if (cell.type != currentObj) {
            fill(cell, cell.type);
        }
    }
    else {
        var _a = objSize(currentObj), objWidth = _a[0], objHeight = _a[1];
        for (var y = 0; y < objHeight; y++) {
            for (var x = 0; x < objWidth; x++) {
                if (onGrid(cell.x + x, cell.y + y)) {
                    applyObj(cell.x + x, cell.y + y);
                }
            }
        }
    }
}
function setCurrentObj(obj) {
    document.getElementById(obj + "-btn").className = "active";
    document.getElementById(currentObj + "-btn").className = "";
    currentObj = obj;
}
function toggleFill() {
    fillMode = !fillMode;
    document.getElementById("fill-btn").classList.toggle("active");
    document.getElementById("fill-active").classList.toggle("fill-inactive");
}
function createArray2(length) {
    var arr = new Array(length || 0);
    var i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--)
            arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}
function createArray(h, w) {
    return new Array(h).fill(null).map(function () { return new Array(w).fill(null); });
}
function createCell(x, y) {
    var cell = document.createElement("div");
    cell.className = "cell neutral ";
    cell.type = "neutral";
    cell.x = x;
    cell.y = y;
    return cell;
}
function createGrid() {
    var grid = createArray(h, w);
    var canvas = document.getElementById("canvas");
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // Modified HTMLDivElement, with additional attributes 'type', 'x' and 'y'
            // Using a HTMLDivElement rather than a custom Cell type as its information
            // can be accessed through document.elementFromPoint
            var cell = createCell(x, y);
            cell.addEventListener("mousedown", function () {
                mouseDown = true;
                turnCellToObj(this);
            }, false);
            cell.addEventListener("mousemove", turnDraggedCellToObj, false);
            cell.addEventListener("mouseup", function () {
                mouseDown = false;
            }, false);
            grid[y][x] = cell;
            canvas.appendChild(cell);
        }
    }
    // If mouse released outside of the canvas, reset mouseDown flag
    document.getElementById("main").addEventListener("mouseup", function () {
        mouseDown = false;
    }, false);
    return grid;
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomBlue() {
    return "rgb(".concat(randInt(28, 40), ",").concat(randInt(165, 185), ",").concat(randInt(240, 255), ")");
}
function animateWater() {
    if (waterPlaced) {
        document.documentElement.style.setProperty("--water-1", randomBlue());
        document.documentElement.style.setProperty("--water-2", randomBlue());
        document.documentElement.style.setProperty("--water-3", randomBlue());
    }
    setTimeout(animateWater, 2000);
}
function neighbourIs(x, y, obj) {
    return ((x < w - 1 && grid[y][x + 1].type == obj) ||
        (x > 0 && grid[y][x - 1].type == obj) ||
        (y < h - 1 && grid[y + 1][x].type == obj) ||
        (y > 0 && grid[y - 1][x].type == obj));
}
function onEdge(x, y) {
    return y == 0 || y == w - 1 || x == 0 || x == h - 1;
}
function driveLocations() {
    var locations = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (grid[y][x].type == "road") {
                var location_1 = [x, y];
                if (onEdge(x, y) || neighbourIs(x, y, "farm")) {
                    locations.push(location_1);
                }
                else if (neighbourIs(x, y, "house")) {
                    // Give x2 greater weight to house locations
                    locations.push(location_1, location_1);
                }
                else if (neighbourIs(x, y, "supermarket")) {
                    // Give x4 greater weight to supermarket locations
                    locations.push(location_1, location_1, location_1);
                }
            }
        }
    }
    return locations;
}
function selectRandomLocation(locations) {
    if (locations.length > 0) {
        return locations[Math.floor(Math.random() * locations.length)];
    }
    else {
        return [null, null];
    }
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}
function filterByDistance(startx, starty, locations, maxd) {
    var filteredLocations = [];
    for (var i = 0, n = locations.length; i < n; i++) {
        var _a = locations[i], x = _a[0], y = _a[1];
        if (distance(startx, starty, x, y) > maxd) {
            filteredLocations.push(locations[i]);
        }
    }
    return filteredLocations;
}
function indexOfNode(arr, value) {
    for (var i = 0, n = arr.length; i < n; i++) {
        if (arr[i][0] == value[0] && arr[i][1] == value[1] && arr[i][2] == value[2]) {
            return i;
        }
    }
    return -1;
}
function removeNode(arr, node) {
    var index = indexOfNode(arr, node);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function onGrid(x, y) {
    return x >= 0 && x < w && y >= 0 && y < h;
}
function smoothMove(object, currentX, currentY, targetX, targetY) {
    return __awaiter(this, void 0, void 0, function () {
        var nextX, diffX, nextY, diffY;
        return __generator(this, function (_a) {
            nextX = currentX;
            diffX = targetX - currentX;
            if (diffX > 0) {
                nextX += 4;
            }
            else if (diffX < 0) {
                nextX -= 4;
            }
            nextY = currentY;
            diffY = targetY - currentY;
            if (diffY > 0) {
                nextY += 4;
            }
            else if (diffY < 0) {
                nextY -= 4;
            }
            object.style.left = nextX + 'px';
            object.style.top = nextY + 'px';
            if (nextX != targetX || nextY != targetY) {
                setTimeout(function () {
                    smoothMove(object, nextX, nextY, targetX, targetY);
                }, 150);
            }
            return [2 /*return*/];
        });
    });
}
/*
 * Runs intermittently.
 * Moves the car div along its input path with each run until it reaches the
 * final location and the car is removed from the canvas.
 */
function drive(car, step, path) {
    if (step < path.length) {
        car.style.left = (path[step].x * 8) + "px";
        car.style.top = (path[step].y * 8) + "px";
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
    }
    else {
        nCars -= 1;
        document.getElementById("canvas").removeChild(car);
    }
}
function roadNetwork() {
    var network = createArray(w, h); // Road network is flipped vs grid for the A* implementation
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (grid[y][x].type == "road") {
                network[x][y] = 1;
            }
            else {
                network[x][y] = 0;
            }
        }
    }
    return network;
}
function createCar(x, y) {
    var car = document.createElement("div");
    car.className = "car car-" + rand1toN(6);
    car.style.left = (x * 8) + "px";
    car.style.top = (y * 8) + "px";
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
    var startLocations = driveLocations();
    var p = Math.min(startLocations.length * 0.001, 1);
    if (p >= Math.random()) {
        var _a = selectRandomLocation(startLocations), sx = _a[0], sy = _a[1];
        if (sx != null && sy != null) {
            var finishLocations = driveLocations();
            var _b = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 10)), fx = _b[0], fy = _b[1];
            if (fx != null && fy != null) {
                var graph = new Graph(roadNetwork());
                var start = graph.grid[sx][sy];
                var finish = graph.grid[fx][fy];
                var path = astar.search(graph, start, finish);
                if (path.length > 0) {
                    // If found a path that the car can take
                    var car = createCar(sx, sy);
                    nCars += 1;
                    drive(car, 1, path);
                }
            }
        }
    }
    setTimeout(tryCarDrive, 500);
}
function cellTypeMask(cellType) {
    var network = createArray(w, h); // Road network is flipped vs grid to match the A* implementation
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (grid[y][x].type == cellType) {
                network[x][y] = 1;
            }
            else {
                network[x][y] = 0;
            }
        }
    }
    return network;
}
function surroundedBy(x, y, obj) {
    if (x < 1 || y < 1 || x > w - 2 || y > h - 2) {
        return false;
    }
    else if (grid[y][x + 1].type != obj ||
        grid[y][x - 1].type != obj ||
        grid[y + 1][x].type != obj ||
        grid[y - 1][x].type != obj ||
        grid[y - 1][x - 1].type != obj ||
        grid[y + 1][x - 1].type != obj ||
        grid[y - 1][x + 1].type != obj ||
        grid[y + 1][x + 1].type != obj) {
        return false;
    }
    return true;
}
function fishingLocations(currentX, currentY) {
    var locations = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (grid[y][x].type == "water" &&
                surroundedBy(x, y, "water") &&
                distance(x, y, currentX, currentY) > 2) {
                locations.push([x, y]);
            }
        }
    }
    return locations;
}
function boatSpawnLocations() {
    var locations = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (grid[y][x].type == "water" && neighbourIs(x, y, "fishing")) {
                locations.push([x, y]);
            }
        }
    }
    return locations;
}
function createBoat(x, y) {
    var boat = {
        div: document.createElement("div"),
        spawnX: x,
        spawnY: y
    };
    boat.div.className = "boat";
    boat.div.style.left = (x * 8) + "px";
    boat.div.style.top = (y * 8) + "px";
    document.getElementById("canvas").appendChild(boat.div);
    return boat;
}
function boatPosition(boat) {
    // Remove 'px' and convert to int
    var x = parseInt(boat.div.style.left.slice(0, -2)) / 8;
    var y = parseInt(boat.div.style.top.slice(0, -2)) / 8;
    return [x, y];
}
function nextFishingLocation(boat) {
    var _a = boatPosition(boat), sx = _a[0], sy = _a[1]; // Current boat location
    var graph = new Graph(cellTypeMask("water"));
    var start = graph.grid[sx][sy];
    if (0.8 >= Math.random()) {
        // Find a new fishing location and move to it
        var finishLocations = fishingLocations(sx, sy);
        var _b = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 2)), fx = _b[0], fy = _b[1];
        if (fx != null && fy != null) {
            var finish = graph.grid[fx][fy];
            var path = astar.search(graph, start, finish);
            if (path.length > 0) {
                // If found a path that the boat can take
                sail(boat, 1, path, false);
            }
        }
    }
    else {
        // Return home
        var finish = graph.grid[boat.spawnX][boat.spawnY];
        var path = astar.search(graph, start, finish);
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
function sail(boat, step, path, destroyBoat) {
    if (step < path.length) {
        boat.div.style.left = (path[step].x * 8) + "px";
        boat.div.style.top = (path[step].y * 8) + "px";
        setTimeout(function () {
            sail(boat, step + 1, path, destroyBoat);
        }, 1200);
    }
    else {
        if (destroyBoat) {
            document.getElementById("canvas").removeChild(boat.div);
        }
        else {
            var fishingTime = rand1toN(500) * 1000;
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
    console.log("running");
    var startLocations = boatSpawnLocations();
    // const p = Math.min(startLocations.length * 0.0002, 1);
    var p = Math.min(startLocations.length * 0.01, 1);
    if (p >= Math.random()) {
        var _a = selectRandomLocation(startLocations), sx = _a[0], sy = _a[1];
        if (sx != null && sy != null) {
            var finishLocations = fishingLocations(sx, sy);
            var _b = selectRandomLocation(filterByDistance(sx, sy, finishLocations, 2)), fx = _b[0], fy = _b[1];
            if (fx != null && fy != null) {
                var graph = new Graph(cellTypeMask("water"));
                var start = graph.grid[sx][sy];
                var finish = graph.grid[fx][fy];
                var path = astar.search(graph, start, finish);
                console.log(path);
                if (path.length > 0) {
                    console.log("Spawning fishing boat");
                    // If found a path that the boat can take
                    var boat = createBoat(sx, sy);
                    sail(boat, 1, path, false);
                }
            }
        }
    }
    setTimeout(tryGoFishing, 2000);
}
function cellToCoord(x, y) {
    return [x * 8, y * 8];
}
function placeAnimalOverCell(x, y, animal) {
    var _a = cellToCoord(x, y), xCoord = _a[0], yCoord = _a[1];
    animal.left = xCoord + Math.floor(Math.random() * 3);
    animal.top = yCoord + Math.floor(Math.random() * 3);
    animal.div.style.left = animal.left + "px";
    animal.div.style.top = animal.top + "px";
}
function farmBorder(x, y) {
    return grid[y][x].type == "grass" && neighbourIs(x, y, "farm");
}
function farmLocations() {
    var locations = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (farmBorder(x, y)) {
                locations.push([x, y]);
            }
        }
    }
    return locations;
}
function createAnimal() {
    var animal = {
        div: document.createElement("div"),
        top: null,
        left: null,
        avoidDirection: null
    };
    if (Math.round(Math.random())) {
        animal.div.className = "sheep";
    }
    else {
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
        var _a = selectRandomLocation(farmLocations()), x = _a[0], y = _a[1];
        if (x != null && y != null) {
            var animal = createAnimal();
            placeAnimalOverCell(x, y, animal);
            animals.push(animal);
            document.getElementById("canvas").appendChild(animal.div);
        }
    }
    // Increase timeout with each additional spanwed animal
    setTimeout(spawnAnimals, (animals.length + 1) * 1000);
}
function coordsToCell(xCoord, yCoord) {
    return [Math.floor(xCoord / 8), Math.floor(yCoord / 8)];
}
function cellIs(x, y, cellType) {
    return grid[y][x].type == cellType;
}
function moveUp(animal) {
    var _a = coordsToCell(animal.left, animal.top - animalBuffer), x = _a[0], y = _a[1];
    if (grid[y][x].type == "grass") {
        animal.top = animal.top - animalMovement;
        animal.div.style.top = animal.top + "px";
        return true;
    }
    return false;
}
function moveDown(animal) {
    var _a = coordsToCell(animal.left, animal.top + 5 + animalBuffer), x = _a[0], y = _a[1];
    if (grid[y][x].type == "grass") {
        animal.top = animal.top + animalMovement;
        animal.div.style.top = animal.top + "px";
        return true;
    }
    return false;
}
function moveLeft(animal) {
    var _a = coordsToCell(animal.left - animalBuffer, animal.top), x = _a[0], y = _a[1];
    if (grid[y][x].type == "grass") {
        animal.left = animal.left - animalMovement;
        animal.div.style.left = animal.left + "px";
        return true;
    }
    return false;
}
function moveRight(animal) {
    var _a = coordsToCell(animal.left + 5 + animalBuffer, animal.top), x = _a[0], y = _a[1];
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
    for (var i = 0, n = animals.length; i < n; i++) {
        if (0.5 >= Math.random()) {
            var r = rand1toN(4);
            var animal = animals[i];
            if (r == 1 && animal.avoidDirection != 1) {
                if (!moveDown(animal)) {
                    animal.avoidDirection = r;
                }
            }
            else if (r == 2 && animal.avoidDirection != 2) {
                if (!moveUp(animal)) {
                    animal.avoidDirection = r;
                }
            }
            else if (r == 3 && animal.avoidDirection != 3) {
                if (!moveLeft(animal)) {
                    animal.avoidDirection = r;
                }
            }
            else if (r == 4 && animal.avoidDirection != 4) {
                if (!moveRight(animal)) {
                    animal.avoidDirection = r;
                }
            }
        }
    }
    setTimeout(moveAnimals, 1000);
}
function grassForestLocations() {
    var locations = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
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
        var locations = grassForestLocations();
        if (locations.length > 0) {
            // Pick a random grass location and change it to be a forest cell
            var _a = locations[Math.floor(Math.random() * locations.length)], x = _a[0], y = _a[1];
            grid[y][x].className = "cell forest-" + rand1toN(5);
            grid[y][x].type = "forest";
        }
    }
    setTimeout(growForest, 100000);
}
var w = 180;
var h = 110;
var currentObj = "road";
var mouseDown = false;
var fillMode = false;
var waterPlaced = false;
var nCars = 0;
var animals = [];
var animalMovement = 2;
var animalBuffer = 6;
var grid = createGrid();
setTimeout(animateWater, 2000);
setTimeout(tryCarDrive, 500);
setTimeout(tryGoFishing, 2000);
setTimeout(spawnAnimals, 10000);
setTimeout(moveAnimals, 1000);
setTimeout(growForest, 100000);
