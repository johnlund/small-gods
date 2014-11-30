/*
/ Small Gods
*/

//Debug
var dDrawGrid = false;

//Dimensions
var kGridSize = 500;
var kTileSize = 25;
var kHumanSize = 4;

//Resources
var kResourceRange = 200;

//Humans
var kPopulationSize = 100;

var kFrameRate = 50;

var gCanvasElement;
var gDrawingContext;

var gGrid;
var population = new Array();

function createGrid()
{
	gGrid = new grid();
}

function createPopulation()
{
	for (var i = 0; i <= kPopulationSize; i++) {
		var gHuman = new human();
		population.push(gHuman);
	}
}

function drawPopulation()
{
	for (var i = 0; i < population.length; i++) {
		population[i].drawHuman();
	}
}

function drawGrid()
{
	for (var i = 0; i < gGrid.numTiles; i++) {
		for (var j = 0; j < gGrid.numTiles; j++) {
			gGrid.tiles[i][j].drawTile();
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
	humanMovement();
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

    //Start program
    createGrid();
    createPopulation();

		setInterval('updateScene()', kFrameRate);
    setInterval('drawScene()', kFrameRate);
}

/*
/
/ GRID
/
/	An multi-dimensional array of tiles
/
*/

function grid()
{
	this.numTiles = kGridSize / kTileSize;

	this.tiles = new Array();

	for (var i = 0; i < this.numTiles; i++) {
		this.tiles[i] = new Array();
		for (var j = 0; j < this.numTiles; j++) {
			this.tiles[i][j] = new tile(i, j);
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

function tile(x, y)
{
	this.xPos = x * kTileSize;
	this.yPos = y * kTileSize;

	this.drawTile = drawTile;

	this.resBase = (Math.random() * kResourceRange) - 100; // -100 to 100
	this.resCurr = this.resBase;
}

function drawTile()
{
	if(dDrawGrid) {
		gDrawingContext.strokeStyle = "#000";
		gDrawingContext.strokeRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
	//TODO update tile with a hex color representing it's current level of resources (from green to brown)
	if(this.resCurr > 0) {
		gDrawingContext.fillStyle = "#00FF00";
		gDrawingContext.fillRect(this.xPos, this.yPos, kTileSize, kTileSize);
	}
}

/*
/
/ HUMAN
/
/	A character with traits
/
*/

function human()
{
	//TODO clamp positions to make sure they are inside the grid
	this.xPos = Math.random() * kGridSize;
	this.yPos = Math.random() * kGridSize;

	this.speed = Math.random() * 10; // 0 to 10
	this.consumption = Math.random() * 10; // 0 to 10

	this.drawHuman = drawHuman;
	this.walk = walk;
	this.onTile = onTile;
}

function drawHuman()
{
	gDrawingContext.beginPath();
	gDrawingContext.arc(this.xPos, this.yPos, (kHumanSize/2), 0, Math.PI * 2, false);
	gDrawingContext.closePath();

	gDrawingContext.strokeStyle = "#000";
	gDrawingContext.stroke();
	
	gDrawingContext.fillStyle = "#000";
  gDrawingContext.fill();
}

function walk(closeTile)
{
	var xDist;
	var yDist;
	var xVel;
	var yVel;
	var rad;
	var tileCentX = closeTile.xPos + (kTileSize / 2);
	var tileCentY = closeTile.yPos + (kTileSize / 2);
	
	if(!this.onTile(closeTile)) {
		//calculate direction to walk and walk
		xDist = tileCentX - this.xPos;
		yDist = tileCentY - this.yPos;
		rad = Math.atan2(yDist, xDist)
		
		xVel = Math.cos(rad) * this.speed;
		yVel = Math.sin(rad) * this.speed;
		
		this.xPos += xVel;
		this.yPos += yVel;
	}
	else {
		//drain resources
		//closeTile.resCurrent -= this.consumption;
	}
}

function onTile(tile)
{
	//if this (human) is within the bounds of that (tile), return true, else false
	var xMinH = this.xPos;
	var yMinH = this.yPos;
	var xMaxH = this.xPos + kHumanSize;
	var yMaxH = this.yPos + kHumanSize;

	var xMinT = tile.xPos;
	var yMinT = tile.yPos;
	var xMaxT = tile.xPos + kTileSize;
	var yMaxT = tile.yPos + kTileSize;

	/*
	if (xMinH <= xMaxT) {
		if (yMinH <= yMaxT) {
			
		}
	}
	else if (xMaxH 
	*/
	return true;
}

/*
/
/ LOGIC
/
*/

function resourceManagement()
{
	/*
	for (var i:uint = 0; i < grid.length; i++) {
		for (var j:uint = 0; j < grid.length; j++) {
			grid[i][j].tileUpdate()
		}
	}
	*/
}

function humanMovement()
{	
	for (var h = 0; h < population.length; h++) {
		var dist;
		var distTemp;
		var xDiff = 0;
		var yDiff = 0;
		
		var closeTile;
		
		for (var i = 0; i < gGrid.numTiles; i++) {
			for (var j = 0; j < gGrid.numTiles; j++) {
				//find tile with resources, store distance in var:dist & tile pos in vars
				//loop through all tiles,
				//if next tile w/ res is closer than dist, store tile in vars, move to closest tile
				//TODO fix clockwise preference
				
				if(gGrid.tiles[i][j].resCurr > 0) {
					xDiff = population[h].xPos - gGrid.tiles[i][j].xPos;
					yDiff = population[h].yPos - gGrid.tiles[i][j].yPos;
					distTemp = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
					
					if(distTemp < dist || !dist) {
						dist = distTemp;
						closeTile = gGrid.tiles[i][j];
					}
				}
			}
		}
		
		if (!closeTile) {
			closeTile = gGrid.tiles[0][0];
		}
		
		population[h].walk(closeTile);
		//reset dist for next human
		dist = undefined;
	}
}
