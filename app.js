// Stage(function(stage) {

//   var Math = Stage.Math, Mouse = Stage.Mouse;

//   stage.viewbox(300, 300);

//   var j = 0, i = 0;
//   var column = Stage.column().appendTo(stage);
//   for (j = 0; j < 10; j++) {
//     var row = Stage.row().appendTo(column).spacing(0);
//     for (i = 0; i < 10; i++) {
//       // colors as frames
//       // var cell = Stage.create();
//       // cell.pin({
//       //   name: "name",
//       //   color: 'red',
//       //   width: 10,
//       //   height: 10,
//       // })
//       let cell = Stage.anim('dark');
//       cell.appendTo(row);
//       // var cell = Stage.anim('light').appendTo(row);
//       cell.on(Mouse.CLICK, function(point) {
//         this.gotoFrame(1);
//         // console.log(this)
//       });
//     }
//   }

// });
var grid = createGrid();

var currentObj = 'lake';
var mouseDown = false;

function turnDraggedCellToObj() {
  if (mouseDown) {
    let cell = document.elementFromPoint(window.event.clientX, window.event.clientY);
    if (currentObj == 'road') {
      turnCellToRoad(cell);
    } else {
      turnCellToCurrentObj(cell)
    }
  }
}


function clearChunkClasses(cell) {
  cell.className = "cell";
  grid[cell.y][cell.x+1].className = "cell";
  grid[cell.y+1][cell.x].className = "cell";
  grid[cell.y+1][cell.x+1].className = "cell";
}
function turnCellToRoad(cell) {
  clearChunkClasses(cell);

  cell.classList.add('road');
  grid[cell.y][cell.x+1].classList.add('road');
  grid[cell.y+1][cell.x].classList.add('road');
  grid[cell.y+1][cell.x+1].classList.add('road');
}

function turnCellToCurrentObj(cell) {
  cell.className = "cell";
  cell.classList.add(currentObj);
  // grid[cell.y][cell.x+1].classList.add(currentObj);
  // grid[cell.y+1][cell.x].classList.add(currentObj);
  // grid[cell.y+1][cell.x+1].classList.add(currentObj);
}

function turnCellToObj(cell) {
  if (currentObj == 'road') {
    turnCellToRoad(cell)
  } else {
    turnCellToCurrentObj(cell)
  }
}

function createArray(length) {
  var arr = new Array(length || 0),
      i = length;

  if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }

  return arr;
}

function createGrid() {
  let grid = createArray(120, 100);

  let container = document.getElementById("main");
  for (i = 0; i < 100; i++) {
    for (j = 0; j < 120; j++) {
      var cell = document.createElement("div");
      cell.classList.add("cell", "neutral");
      cell.y = i;
      cell.x = j;

      cell.addEventListener('mousedown', function() {
        mouseDown = true;
        turnCellToObj(this);
      }, false)
      cell.addEventListener('mousemove', turnDraggedCellToObj, false)
      cell.addEventListener('mouseup', function() {
        mouseDown = false;
      }, false)

      grid[i][j] = cell;
      container.appendChild(cell);
    }
  }
  return grid
}

