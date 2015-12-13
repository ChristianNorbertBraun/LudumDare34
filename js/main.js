"use strict"

var M = Math,
	D = document,
	W = window,
	canvas,
	context,
	width,
	height,
	now,
	factor,
	last,
	beams = [],
	loadingBeams = [],
	enemies = [],
	points = [],
	player,
	keysDown = [],
	playerColor = "#D3E33F",
	beamLength = 30,
	beamAmount = 0,
	drawBeamAmount = 0,
	piRatio = M.PI / 180,
	baseVelocity = 0.2,
	startAngle = 0,
	buttonPressed = false,
	buttonReleased = false,
	button,
	particles = [];



function drawRestartBox(isWon){
	var x = (width >> 1) - 200;
	var y = (height >> 1) + 100;
	var boxText;

	context.beginPath();
	context.fillStyle = "#129EB3";
	context.fillRect(x, y, 400, 200);
	context.fill();

	if (isWon)
	   	boxText = "You won! Play again?"
	else
		boxText = "You lost! Play again?"


	context.beginPath();
   	context.fillStyle = "black";
   	context.textAlign = 'center';
   	context.font= "30px Verdana";
   	context.fillText(boxText, width >> 1, y + 60);


}

function getLivingBeams(){
	var livingBeams = [];
	for(var i = 0; i < beams.length; ++i){
		if (beams[i].lifetime == 1)
			livingBeams.push(beams[i]);
	}

	return livingBeams;
}
function resetBeam(beam){
	beam.x = width >> 1;
	beam.y = height >> 1;
	beam.lifetime = 0;
	beam.vx = 0;
	beam.vy = 0;
}

function clearScreenLeavingBeams(){
	var livingBeams = getLivingBeams();

	for(var i = 0; i < livingBeams.length; ++i){
		if(livingBeams[i].x >= width || livingBeams[i].x <= 0)
			resetBeam(livingBeams[i]);
		else if(livingBeams[i].y <= 0 || livingBeams[i].y >= height)
			resetBeam(livingBeams[i]);
	}
}

function detectCollision(){
	var livingBeams = getLivingBeams();
	var livingEnemies = getLivingEnemies();
	for(var i = 0; i < livingBeams.length; ++i){
		var m = (livingBeams[i].targetY - livingBeams[i].y) / (livingBeams[i].targetX - livingBeams[i].x);
		var t = livingBeams[i].y - m * livingBeams[i].x;

		for(var j = 0; j < points.length; ++j){
			var collisionPoint = m * points[j].x + t;

			if(M.abs(points[j].y - collisionPoint) <= 10){
					
				if((livingBeams[i].targetX > points[j].x &&
					livingBeams[i].x < points[j].x) ||
					(livingBeams[i].targetX < points[j].x &&
					livingBeams[i].x > points[j].x)){
					if(points[j].life == 1){
						points[j].color = "red";
						player.life += 2;
						points[j].life = 0;
					}
				}	
			}
		}

		for( var j = 0 ; j < livingEnemies.length; ++j){
			var collisionPoint = m * livingEnemies[j].x + t;

			if(M.abs(livingEnemies[j].y - collisionPoint) <= livingEnemies[j].r + 10){
					
				if((livingBeams[i].targetX > livingEnemies[j].x &&
					livingBeams[i].x < livingEnemies[j].x) ||
					(livingBeams[i].targetX < livingEnemies[j].x &&
					livingBeams[i].x > livingEnemies[j].x)){
					if(livingEnemies[j].life == 1){
						livingEnemies[j].color = "white";
						player.life += M.floor(livingEnemies[j].r / 3);
						livingEnemies[j].life = 0;
						createExplosion(livingEnemies[j].x, livingEnemies[j].y, "#C4104F");
						createExplosion(livingEnemies[j].x, livingEnemies[j].y, "#F89CB8");
					}
				}	
			}
		}
	}
}

function moveEnemies(){
	var livingEnemies = getLivingEnemies();

	for(var i = 0; i < livingEnemies.length; ++i){
//		pythagoras
		var distX = livingEnemies[i].x - player.x;
		var distY = livingEnemies[i].y - player.y;
		var distanceSquare = M.pow(distX,2) + M.pow(distY,2);
		var distance = M.sqrt(distanceSquare);

		if (distance > player.r/2  + livingEnemies[i].r/2) {
            //If you add mass to the objects change to obj2.mass
            //instead of 50
            var totalForce = (player.r * 7)/distanceSquare;
            livingEnemies[i].vx += totalForce * distX / distance;
            livingEnemies[i].vy += totalForce * distY / distance;
        }
        else {
            player.life -= M.floor(livingEnemies[i].r / 2);
            livingEnemies[i].life = 0;
        }

        livingEnemies[i].x -= livingEnemies[i].vx;
      	livingEnemies[i].y -= livingEnemies[i].vy;
	}

}

function getLivingEnemies(){
	var livingEnemies = [];
	for(var i = 0; i < enemies.length; ++i){
		if(enemies[i].life == 1){
			if(enemies[i].x >= width || enemies[i].x <= 0 )
				enemies[i].life = 0;
			else if (enemies[i].y <= 0 || enemies[i].y >= height)
				enemies[i].life = 0;
			else
				livingEnemies.push(enemies[i]);
		}
	}

	return livingEnemies;
}

function drawEnemies(){
	var livingEnemies = getLivingEnemies();

	if(livingEnemies.length <= 4){
		if(M.floor(player.r / player.life) < 20 )
			var amountOfEnemies = M.floor(player.r / player.life) * 2
		else
			var amountOfEnemies = M.floor(M.random() * 19);
		var factorX;
		var factorY;
		if(M.random() > 0.5)
			factorX = 1;
		else
			factorX = -1;

		if(M.random() > 0.5)
			factorY = 1;
		else
			factorY = -1;


		for(var i = 0; i < amountOfEnemies; ++i){	
			var enemieRadius = M.floor(M.random() * (player.r / 4));

			if(enemieRadius <= 15)
				enemieRadius = M.floor(M.random() * 15) + 2;

			if(enemies[i].life != 1){
				enemies[i].life = 1;
				enemies[i].x = M.random() * width;
				enemies[i].y = M.random() * height;
				enemies[i].r = enemieRadius;
				enemies[i].vx = M.random() / 2 * factorX;
				enemies[i].vy = M.random() / 2 * factorY;
			}
		}
		livingEnemies = getLivingEnemies();
	}

	for(var i = 0; i < livingEnemies.length; ++i){
		context.beginPath();
   		context.fillStyle = "#F71463";
		context.arc(livingEnemies[i].x, livingEnemies[i].y, livingEnemies[i].r, 0, 2 * M.PI, false);
    	context.fill();

    	context.beginPath();
	    context.fillStyle = "black";
   		context.textAlign = 'center';
    	context.font = livingEnemies[i].r + "px Verdana";
    	context.fillText(M.floor(livingEnemies[i].r / 3), livingEnemies[i].x, livingEnemies[i].y + livingEnemies[i].r / 2)
	}

	moveEnemies();
}

function resetPoint(point){
	point.x = M.random() * width;
	point.y = M.random() * height;
	point.life = 1;
	point.color = undefined;
}

function movePoints(){
	for(var i = 0; i < points.length; ++i){
		if(points[i].y >= height)
			resetPoint(points[i]);
		else
			points[i].y += 1;
	}
}

function drawPoints(){
	for(var i = 0; i < points.length; ++i){
		context.beginPath();
		var transparency = Math.random() + 0.5;
		if(points[i].color != undefined)
			context.fillStyle = points[i].color;
		else
			context.fillStyle = "rgba(255, 255, 255, "+ transparency +")";
		context.fillRect(points[i].x, points[i].y, 6, 6);
		context.fill();
	}

	movePoints();
}

function moveBeams(){

	var livingBeams = getLivingBeams();
	for(var i = 0; i < livingBeams.length; ++i){
		livingBeams[i].x += livingBeams[i].vx;
		livingBeams[i].y += livingBeams[i].vy; 
		livingBeams[i].targetX += livingBeams[i].vx;
		livingBeams[i].targetY += livingBeams[i].vy; 
	}
}


function drawLoadingBeams( startAngle){

	var growAngle = 0;
	if(beamAmount != 0)
		growAngle = 360 / beamAmount;
	
	var shootAngle = startAngle;

	for(var i = 0 ; i < beamAmount; ++i){


		var growingBeamLength = player.r + beamAmount + (width >> 1);
		var sinusValue = M.sin(shootAngle * piRatio);

		if (shootAngle == 0 || shootAngle == 360){
			loadingBeams[i].targetX = loadingBeams[i].x + growingBeamLength;
			loadingBeams[i].targetY = loadingBeams[i].y;

		}
		else if (shootAngle == 180){
			loadingBeams[i].targetX = loadingBeams[i].x - growingBeamLength;
			loadingBeams[i].targetY = loadingBeams[i].y;
		}
		else{
			loadingBeams[i].targetX = M.cos(shootAngle * piRatio) * growingBeamLength + loadingBeams[i].x; 
			loadingBeams[i].targetY = sinusValue * growingBeamLength + loadingBeams[i].y;
		}

		shootAngle += growAngle;

		context.beginPath();
		context.lineWidth = 2;
		if(beams[i].lifetime == 1)
			context.strokeStyle = "rgba(255, 0, 0, 0.5)";
		else
			context.strokeStyle = "rgba(255, 255, 255, 0.2)";
		context.setLineDash([5]);
		context.moveTo(loadingBeams[i].x,loadingBeams[i].y);
		context.lineTo(loadingBeams[i].targetX,loadingBeams[i].targetY);
		context.stroke();

		context.setLineDash([]);
	}

}

function drawLivingBeams(){
	var livingBeams = getLivingBeams();
	for(var i = 0; i < livingBeams.length; ++i){
		context.beginPath();
		context.lineWidth = 2;
    	context.strokeStyle = 'white';
		context.moveTo(livingBeams[i].x,livingBeams[i].y);
		context.lineTo(livingBeams[i].targetX,livingBeams[i].targetY);
		context.stroke();	
	}
}

function emitBeams(startAngle){

	var growAngle = 0;
	if(beamAmount != 0)
		growAngle = 360 / beamAmount;
	
	var shootAngle = startAngle;

	for(var i = 0 ; i < beamAmount; ++i){
		var xFactor,
			yFactor;

		if(beams[i].lifetime != 1){

			if((shootAngle >= 0 && shootAngle <= 90) ||
				(shootAngle >= 270 && shootAngle <= 360))
				xFactor = 1;	
			else
				xFactor = -1;

			if(shootAngle >= 0 && shootAngle <= 180)
				yFactor = 1;
			else
				yFactor = -1;

			var sinusValue = M.sin(shootAngle * piRatio);

			if (shootAngle == 0 || shootAngle == 360){
				beams[i].targetX = beams[i].x + beamLength;
				beams[i].targetY = beams[i].y;
				beams[i].vx = beamLength / 5;

			}
			else if (shootAngle == 180){
				beams[i].targetX = beams[i].x - beamLength;
				beams[i].targetY = beams[i].y;
				beams[i].vx = -beamLength / 5;
			}
			else{
				beams[i].targetX = M.cos(shootAngle * piRatio) * beamLength + beams[i].x; 
				beams[i].targetY = sinusValue * beamLength + beams[i].y;
				beams[i].vx = (M.cos(shootAngle * piRatio) * beamLength) / 5 ;
				beams[i].vy = (sinusValue * beamLength) / 5 ; 

			}

			shootAngle += growAngle;
			beams[i].lifetime = 1;
		}
	}

	
	beamAmount = 0;
}

function calculateBeamAmount(){
	var beamGrowRate = 1/200 * player.life;

	if(beamAmount + beamGrowRate > 100)
		beamAmount = 100;
	else if(beamAmount < player.life)
		beamAmount += beamGrowRate;
}	

function grow(){
	var growRate = (player.life ) / player.r * factor;
	player.r += growRate;
	calculateBeamAmount();
}

function shrink(){
	var shrinkRate = player.r / (player.life * 10) * factor;

	if(player.r - shrinkRate < player.life){
		player.r = player.life;
	}
	else{
		player.r -= shrinkRate;
	}
}

function input(){
	if( keysDown[37] ){
		grow();
		startAngle = 180
		
	}
	else if( keysDown[39] ){
		grow();
		startAngle = 0;
	}
	else{
		shrink();
	}
}

function setPointer( event, down )
{
  
	keysDown[37] = down;	
    event.preventDefault()
}

function pointerUp( event )
{
    setPointer( event, false )
    buttonReleased = true;
	buttonPressed = false;
}

function pointerDown( event )
{
    setPointer( event, true )
    buttonPressed = true;
	buttonReleased = false;
}

function setKey( event, down )
{
	keysDown[event.keyCode] = down;
	event.preventDefault();
}
function keyUp( event )
{
	setKey( event, false );
	buttonReleased = true;
	buttonPressed = false;
}
function keyDown( event )
{
	setKey( event, true );
	buttonPressed = true;
	buttonReleased = false;
}

function drawPlayer(){

   	context.beginPath();
    context.fillStyle = playerColor;
	context.arc(player.x, player.y, player.r, 0, 2 * M.PI, false);
    context.fill();	

   	context.beginPath();
    context.fillStyle = "black";
    context.textAlign = 'center';
    context.font=	player.life + "px Verdana";
    context.fillText(player.life, player.x, player.y + player.r / 2)

   
}

function draw(){
	if(player.life >= 333 ){
		drawRestartBox(true);
	}
	else if(player.life > 0){
		context.fillStyle = "#000";
		context.fillRect( 0, 0, width, height );
		drawPoints();
	
		updateParticles(50);
		particles.splice(particles.length);

		if(buttonReleased)
			emitBeams(startAngle);
		if(buttonPressed)
			drawLoadingBeams(startAngle);

		drawEnemies();
		drawLivingBeams();
		drawPlayer();
		detectCollision();
		moveBeams();
		clearScreenLeavingBeams();
	}
	else{
		drawRestartBox(false);
	}
}

function run(){
	requestAnimationFrame( run );
	now = Date.now();
	factor = (now-last)/16;
	last = now;
	input();
	draw();
}

function setup(){
	

	for(var i = 0; i < 100 ; ++i){
		beams.push({
			x: width >> 1,
			y: height >> 1,
			targetX: width >> 1,
			targetY: height >> 1,
			vx: 0,
			vy: 0,
			length: 7,
			lifetime: 0,
		});
	}

	for(var i = 0; i < 100 ; ++i){
		loadingBeams.push({
			x: width >> 1,
			y: height >> 1,
			targetX: width >> 1,
			targetY: height >> 1,
			vx: 0,
			vy: 0,
			length: 7,
			lifetime: 0,
		});
	}

	for(var i = 0; i < 30; ++i){
		points.push({
			x: M.random() * width,
			y: M.random() * height,
			life: 1,
			color: undefined
		});
	}


	player={
		x: width >> 1,
		y: height >> 1,
		r: 10,
		life:10
	};

	for(var i = 0; i < 20; ++i){
		enemies.push({
			x: M.random() * width,
			y: M.random() * height,
			r: M.floor(M.random() * 20),
			vx: 0,
			vy: 0,
			life: 0
		});
	}



	D.onkeydown = keyDown;
	D.onkeyup = keyUp;

	D.onmousedown = pointerDown
	D.onmouseup = pointerUp

	run();
}

function init(){
	canvas = D.getElementById( "canvas" );
	context = canvas.getContext( "2d" );
	canvas.width = width = W.innerWidth;
	canvas.height = height = W.innerHeight;
	last = Date.now()-16
	setup();
}


W.onload = init