/*
/ Small Gods
/
/ 
/
*/

//Debug
var dDrawGrid = false;
var dCtl = true;

//Dimensions
var kGridSize = 500;
var kTileSize = 25;
var kLifeSize = 4;

//Energys
//Initial resource range
var kEnergyRange = 10;

//Life
var population = new Array();
//Initial population size
var kPopulationSize = 0;

//View
//Turn speed
var kFrameRate = 50;

var gCanvasElement;
var gDrawingContext;
var gGrid;

var kUpdateInterval = null;
var kDrawInterval = null;


/*
/
/ GRID
/
/	An multi-dimensional array of tiles
/
*/


function Grid()
{
	//a multidimensional array of objects
	//each column of the grid array has an array of objects functioning like a row
	//create a sprite tile, give it properties (x and y position), insert into vertical array, loop until height is reached,
	//push finished vertical array into grid, loop to create next vertical array until width is reached
	this.numTiles = kGridSize / kTileSize;
	this.totalTiles = this.numTiles * this.numTiles;

	this.tiles = new Array();

	for (var i = 0; i < this.numTiles; i++) {
		this.tiles[i] = new Array();
		for (var j = 0; j < this.numTiles; j++) {
			this.tiles[i][j] = new Tile(i, j);
		}
	}
}

Grid.prototype.totalEnergys = function()
{
	var temp = 0;
	
	for (var i = 0; i < gGrid.numTiles; i++) {
		for (var j = 0; j < gGrid.numTiles; j++) {
			temp += gGrid.tiles[i][j].curEnergy;
		}
	}
	
	return Math.floor(temp);
}

Grid.prototype.positiveTiles = function()
{
	var temp = 0;
	
	for (var i = 0; i < gGrid.numTiles; i++) {
		for (var j = 0; j < gGrid.numTiles; j++) {
			if (gGrid.tiles[i][j].curEnergy > 0) {
				temp++;
			}
		}
	}
	
	return temp;
}

Grid.prototype.negativeTiles = function()
{
	var temp = 0;
	
	for (var i = 0; i < gGrid.numTiles; i++) {
		for (var j = 0; j < gGrid.numTiles; j++) {
			if (gGrid.tiles[i][j].curEnergy < 0) {
				temp++;
			}
		}
	}
	
	return temp;
}

/*
/
/ TILE
/
/	A square tile holding certain properties
/
*/

function Tile(x, y)
{
	this.xPos = x * kTileSize;
	this.yPos = y * kTileSize;

	//Base resources = -100 to 100
	this.baseEnergy = (Math.random() * kEnergyRange) - kEnergyRange/2;
	this.curEnergy = this.baseEnergy;
	//Surrounding resources
	this.surEnergy = 0;
	
	this.updated = false;
}

Tile.prototype.draw = function()
{
	if(dDrawGrid) {
		gDrawingContext.strokeStyle = "#000";
		gDrawingContext.strokeRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
	//update tile with a hex color and alpha representing it's current level of resources (from green to brown)
	if(this.curEnergy > 0) {
		gDrawingContext.fillStyle = "rgba(0, 0, 255, "+Math.abs(this.curEnergy)/kEnergyRange+")";
		gDrawingContext.fillRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
	if(this.curEnergy < 0) {
		gDrawingContext.fillStyle = "rgba(102, 51, 0, "+Math.abs(this.curEnergy)/kEnergyRange+")";
		gDrawingContext.fillRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
}

Tile.prototype.update = function()
{
	//Energy to increase if surrounded by tiles with resources
	
	var xNum = this.xPos / kTileSize;
	var yNum = this.yPos / kTileSize;
	
	//Reset surrounding resources to zero
	this.surEnergy = 0;
	
	//Add up all the curEnergy of the tiles surrounding this tile
	//0 1 2
	//3 * 4
	//5 6 7
	//TODO - Connect the edges of space to make a sphere.
	//0
	if (xNum > 0 && yNum > 0) {
		var x = xNum-1;
		var y = yNum-1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == 0 && yNum == 0) {
		var x = grid.numTiles;
		var y = grid.numTiles;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == 0 && yNum > 0) {
		var x = grid.numTiles;
		var y = yNum-1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum > 0 && yNum == 0) {
		var x = xNum-1;
		var y = grid.numTiles;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//1
	if (yNum > 0) {
		var x = xNum;
		var y = yNum-1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (yNum == 0) {
		var x = xNum;
		var y = grid.numTiles;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//2
	if ((xNum < (grid.numTiles - 1)) && yNum > 0) {
		var x = xNum+1;
		var y = yNum-1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if ((xNum < (grid.numTiles - 1)) && yNum == 0) {
		var x = xNum+1;
		var y = grid.numTiles;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == grid.numTiles && yNum > 0) {
		var x = 0;
		var y = yNum-1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == grid.numTiles && yNum == 0) {
		var x = 0;
		var y = grid.numTiles;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//3
	if (xNum > 0) {
		var x = xNum-1;
		var y = yNum;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == 0) {
		var x = grid.numTiles;
		var y = yNum;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//4
	if (xNum < (grid.numTiles - 1)) {
		var x = xNum+1;
		var y = yNum;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == grid.numTiles) {
		var x = 0;
		var y = yNum;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//5
	if (xNum > 0 && (yNum < (grid.numTiles - 1))) {
		var x = xNum-1;
		var y = yNum+1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == 0 && (yNum < (grid.numTiles - 1))) {
		var x = grid.numTiles;
		var y = yNum+1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum > 0 && yNum == grid.numTiles) {
		var x = xNum-1;
		var y = 0;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == 0 && yNum == grid.numTiles) {
		var x = grid.numTiles;
		var y = 0;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//6
	if (yNum < (grid.numTiles - 1)) {
		var x = xNum;
		var y = yNum+1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	if (yNum == grid.numTiles) {
		var x = xNum;
		var y = 0;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//7
	if ((xNum < (grid.numTiles - 1)) && (yNum < (grid.numTiles - 1))) {
		var x = xNum+1;
		var y = yNum+1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == grid.numTiles && (yNum < (grid.numTiles - 1))) {
		var x = 0;
		var y = yNum+1;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if ((xNum < (grid.numTiles - 1)) && yNum == grid.numTiles) {
		var x = xNum+1;
		var y = 0;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	else if (xNum == grid.numTiles && yNum == grid.numTiles) {
		var x = 0;
		var y = 0;
		this.surEnergy += gGrid.tiles[x][y].curEnergy;
	}
	//Divide by 10 and add to current energy
	//World became either a desert or an oasis, there needs to be some kind of balancing mechanism. I limit the top and bottom of the current energy of a tile to the Energy Range.
	var newEnergy = this.surEnergy / kEnergyRange;
	if ((this.curEnergy + newEnergy < 0) && (this.curEnergy + newEnergy > kEnergyRange*-1)) {
		this.curEnergy += newEnergy;
	}
	else if ((this.curEnergy + newEnergy < 0) && (this.curEnergy + newEnergy < kEnergyRange)) {
		this.curEnergy = kEnergyRange*-1;
	}
	if ((this.curEnergy + newEnergy > 0) && (this.curEnergy + newEnergy < kEnergyRange)) {
		this.curEnergy += newEnergy;
	}
	else if ((this.curEnergy + newEnergy > 0) && (this.curEnergy + newEnergy > kEnergyRange)) {
		this.curEnergy = kEnergyRange;
	}
	
	this.updated = true;
}

/*
/
/ Life
/
/	A life form with traits
/
*/

function Life()
{
	this.age = 0;
	this.lifeSpan = (Math.random() * 100) + 20;
	//set sex to male (0) or female (1)
	this.sex = ((Math.random() * 1) < .5) ? 0 : 1;
	this.energy = 1;

	//TODO clamp positions to make sure they are inside the grid
	this.xPos = Math.random() * kGridSize;
	this.yPos = Math.random() * kGridSize;
	
	this.curTile = gGrid.tiles[Math.floor(this.xPos / kTileSize)][Math.floor(this.yPos / kTileSize)];
	this.moveTile = this.curTile;
	
	this.moveXPos = null;
	this.moveYPos = null;

	this.speed = Math.random() * 10; // 0 to 10
	this.consumption = Math.random() * 10; // 0 to 10
}

Life.prototype.draw = function()
{
	gDrawingContext.beginPath();
	gDrawingContext.arc(this.xPos, this.yPos, (kLifeSize/2), 0, Math.PI * 2, false);
	gDrawingContext.closePath();

	if (this.age <= this.lifeSpan) {
		gDrawingContext.strokeStyle = "#000";
		gDrawingContext.stroke();
	
		gDrawingContext.fillStyle = "#000";
		gDrawingContext.fill();
	}
	else {
		gDrawingContext.strokeStyle = "#FF0000";
		gDrawingContext.stroke();
	
		gDrawingContext.fillStyle = "#FF0000";
		gDrawingContext.fill();
	}
}

Life.prototype.findEnergy = function()
{
	//Life looks at its position and if there are not resources at the tile its on, then it should (TODO shouldn't be random) randomly move to a tile next to the one they are on.
	//Which tile am I on?
	//Current tile X and Y
	var xTile = Math.floor(this.xPos / kTileSize);
	var yTile = Math.floor(this.yPos / kTileSize);
	this.curTile = gGrid.tiles[xTile][yTile];
	
	if (this.curTile.curEnergy > 0) { this.curTile.curEnergy -= this.consumption; }
	else {
		var newTile = Math.floor(Math.random() * 8);
		switch (newTile) {
			//bound by grid
			case 0:
				if (xTile > 0 && yTile > 0) {
					var i = xTile-1;
					var j = yTile-1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 1:
				if (yTile > 0) {
					var i = xTile;
					var j = yTile-1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 2:
				if ((xTile < (kGridSize / kTileSize - 1)) && yTile > 0) {
					var i = xTile+1;
					var j = yTile-1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 3:
				if (xTile > 0) {
					var i = xTile-1;
					var j = yTile;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; } 
				break;
			case 4:
				if (xTile < (kGridSize / kTileSize - 1)) {
					var i = xTile+1;
					var j = yTile;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 5:
				if (xTile > 0 && (yTile < (kGridSize / kTileSize - 1))) {
					var i = xTile-1;
					var j = yTile+1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 6:
				if (yTile < (kGridSize / kTileSize - 1)) {
					var i = xTile;
					var j = yTile+1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
			case 7:
				if ((xTile < (kGridSize / kTileSize - 1)) && (yTile < (kGridSize / kTileSize - 1))) {
					var i = xTile+1;
					var j = yTile+1;
					this.moveTile = gGrid.tiles[i][j];
				}
				else { this.moveTile = gGrid.tiles[xTile][yTile]; }
				break;
		}
	}
}

Life.prototype.move = function()
{
	if (this.moveTile != this.curTile) {
		this.xPos = this.moveTile.xPos + (kTileSize / 2);
		this.yPos = this.moveTile.yPos + (kTileSize / 2);
	}
}

function createPopulation()
{
	for (var i = 0; i < kPopulationSize; i++) {
		var gLife = new Life();
		population.push(gLife);
	}
}

function drawPopulation()
{
	for (var i = 0; i < population.length; i++) {
		population[i].draw();
	}
}

function drawGrid()
{
	for (var i = 0; i < gGrid.numTiles; i++) {
		for (var j = 0; j < gGrid.numTiles; j++) {
			gGrid.tiles[i][j].draw();
		}
	}
}

function drawInfo()
{
	$("#pnl_info").html("<p>"
		+"Total Energy:<span>"+gGrid.totalEnergys()+"</span><br>"
		+"Total Tiles:<span>"+gGrid.totalTiles+"</span><br>"
		+"Positive Tiles:<span>"+gGrid.positiveTiles()+"</span><br>"
		+"Negative Tiles:<span>"+gGrid.negativeTiles()+"</span><br>"
		+"<br>"
		+"Time Speed:<span>"+kFrameRate+"</span><br>"
	);
}

function drawScene()
{
	gCanvasElement.width = gCanvasElement.width;
	drawGrid();
  drawPopulation();
  drawInfo();
}

function updateScene()
{
	//Move Lifes
	for (var x = 0; x < population.length; x++) {
		if (population[x].age <= population[x].lifeSpan) {
			population[x].age++;
			population[x].findEnergy();
			population[x].move();
		}
	}
	//Update tiles
	for (var i = 0; i < gGrid.tiles.length; i++) {
		for (var j = 0; j < gGrid.tiles.length; j++) {
			gGrid.tiles[i][j].updated = false;
		}
	}
	//Previously, the system looked at each tile in order, from top left to bottom right, now the order of looking and updating is random.
	var updateTile = Math.floor(Math.random() * gGrid.totalTiles);
	var i = Math.floor(updateTile / (kGridSize/kTileSize));
	var j = updateTile % (kGridSize/kTileSize);
	//Why should it update all the tiles in the grid before being able to update one twice?
	//if (!gGrid.tiles[i][j].updated) {
		gGrid.tiles[i][j].update();	
	//}
}

function initSmallGods(canvasElement) {
    if (!canvasElement) {
      canvasElement = document.createElement("canvas");
			canvasElement.id = "smallgods_canvas";
			document.getElementById('smallgods').appendChild(canvasElement);
    }
    
    gCanvasElement = canvasElement;
    gCanvasElement.width = kGridSize;
    gCanvasElement.height = kGridSize;
    gDrawingContext = gCanvasElement.getContext("2d");

    //Setup
    gGrid = new Grid();
    createPopulation();

		kUpdateInterval = window.setInterval('updateScene()', kFrameRate);
    kDrawInterval = window.setInterval('drawScene()', kFrameRate);
}

/*
/
/ LOGIC
/
*/

/* Controls
/
/	Pause
/ Decrease time speed
/	Standard time speed (TODO customizable)
/	Increase time speed
/	Create life - random and placed
/	Destroy life - random and placed
/	Increase energy - random and placed
/	Decrease energy - random and placed
/
*/

function updateInterval() {
	window.clearInterval(kUpdateInterval);
	window.clearInterval(kDrawInterval);
	
	if (kFrameRate > 0) {
		kUpdateInterval = window.setInterval('updateScene()', kFrameRate);
		kDrawInterval = window.setInterval('drawScene()', kFrameRate);
	}
}