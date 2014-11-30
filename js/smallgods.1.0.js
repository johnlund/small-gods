/*
/ Small Gods
*/

//Debug
var dDrawGrid = false;

//Dimensions
var kGridSize = 500;
var kTileSize = 5;
var kHumanSize = 4;

//Resources
//Initial resource range
var kResourceRange = 10;

//Humans
var population = new Array();
//Initial population size
var kPopulationSize = 0;

//View
//Turn speed
var kFrameRate = 10;

var gCanvasElement;
var gDrawingContext;
var gGrid;

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

	this.tiles = new Array();

	for (var i = 0; i < this.numTiles; i++) {
		this.tiles[i] = new Array();
		for (var j = 0; j < this.numTiles; j++) {
			this.tiles[i][j] = new Tile(i, j);
		}
	}
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
	this.baseResource = (Math.random() * kResourceRange) - kResourceRange/2;
	this.curResource = this.baseResource;
	//Surrounding resources
	this.surResource = 0;
}

Tile.prototype.draw = function()
{
	if(dDrawGrid) {
		gDrawingContext.strokeStyle = "#000";
		gDrawingContext.strokeRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
	//TODO update tile with a hex color or alpha representing it's current level of resources (from green to brown)
	if(this.curResource > 0) {
		gDrawingContext.fillStyle = "#00FF00";
		gDrawingContext.fillRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
}

Tile.prototype.update = function()
{
	//Resources to increase if surrounded by tiles with resources
	
	var xNum = this.xPos / kTileSize;
	var yNum = this.yPos / kTileSize;
	
	//Reset surrounding resources to zero
	this.surResource = 0;
	
	//Add up all the curResource of the tiles surrounding this tile
	//0
	if (xNum > 0 && yNum > 0) {
		var a = xNum-1;
		var b = yNum-1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//1
	if (yNum > 0) {
		var a = xNum;
		var b = yNum-1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//2
	if ((xNum < (kGridSize / kTileSize - 1)) && yNum > 0) {
		var a = xNum+1;
		var b = yNum-1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//3
	if (xNum > 0) {
		var a = xNum-1;
		var b = yNum;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//4
	if (xNum < (kGridSize / kTileSize - 1)) {
		var a = xNum+1;
		var b = yNum;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//5
	if (xNum > 0 && (yNum < (kGridSize / kTileSize - 1))) {
		var a = xNum-1;
		var b = yNum+1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//6
	if (yNum < (kGridSize / kTileSize - 1)) {
		var a = xNum;
		var b = yNum+1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//7
	if ((xNum < (kGridSize / kTileSize - 1)) && (yNum < (kGridSize / kTileSize - 1))) {
		var a = xNum+1;
		var b = yNum+1;
		this.surResource += gGrid.tiles[a][b].curResource;
	}
	//Divide by 10 and add to current resources
	//World becomes either a desert or an oasis, there needs to be some kind of balancing mechanism, i.e. limit on the top and bottom of the current resources of a tile, or the humans (or gods) can alter the environment to change the resource characteristics of a tile.
	this.curResource += this.surResource / kResourceRange;
}

/*
/
/ HUMAN
/
/	A character with traits
/
*/

function Human()
{
	var persOpen = Math.random() * 100;
	var persCons = Math.random() * 100;
	var persExtr = Math.random() * 100;
	var persAgre = Math.random() * 100;
	var persNeur = Math.random() * 100;
	
	this.age = 0;
	this.lifeSpan = (Math.random() * 100) + 20;
	//set sex to male (0) or female (1)
	this.sex = ((Math.random() * 1) < .5) ? 0 : 1;
	
	var energy = 1;
	var speed = (Math.random() * 5) * persExtr; //0-10
	var hunger = (Math.random() * 1) * persNeur;

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

Human.prototype.draw = function()
{
	gDrawingContext.beginPath();
	gDrawingContext.arc(this.xPos, this.yPos, (kHumanSize/2), 0, Math.PI * 2, false);
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

Human.prototype.findResource = function()
{
	//Human looks at its position and if there are not resources at the tile its on, then it should (TODO shouldn't be random) randomly move to a tile next to the one they are on.
	//Which tile am I on?
	//Current tile X and Y
	var xTile = Math.floor(this.xPos / kTileSize);
	var yTile = Math.floor(this.yPos / kTileSize);
	this.curTile = gGrid.tiles[xTile][yTile];
	
	if (this.curTile.curResource > 0) { this.curTile.curResource -= this.consumption; }
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

Human.prototype.move = function()
{
	if (this.moveTile != this.curTile) {
		this.xPos = this.moveTile.xPos + (kTileSize / 2);
		this.yPos = this.moveTile.yPos + (kTileSize / 2);
	}
}

function createPopulation()
{
	for (var i = 0; i < kPopulationSize; i++) {
		var gHuman = new Human();
		population.push(gHuman);
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

function drawScene()
{
	gCanvasElement.width = gCanvasElement.width;
	drawGrid();
  drawPopulation();
}

function updateScene()
{
	//Move Humans
	for (var x = 0; x < population.length; x++) {
		if (population[x].age <= population[x].lifeSpan) {
			population[x].age++;
			population[x].findResource();
			population[x].move();
		}
	}
	//Update tiles
	//TODO Currently, the system looks at each tile in order, from top left to bottom right, the order of looking and updating should be random (set up an update array of tiles, randomly choose a tile, update it, then remove it from the array, and repeat).
	for (var i = 0; i < gGrid.tiles.length; i++) {
		for (var j = 0; j < gGrid.tiles.length; j++) {
			gGrid.tiles[i][j].update();
		}
	}
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

		setInterval('updateScene()', kFrameRate);
    setInterval('drawScene()', kFrameRate);
}

/*
/
/ LOGIC
/
*/