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
	points = [],
	player,
	keysDown = [],
	playerColor,
	beamLength = 30,
	beamAmount = 0,
	drawBeamAmount = 0,
	piRatio = M.PI / 180,
	baseVelocity = 0.2,
	buttonPressed = false,
	buttonReleased = false;



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
	for(var i = 0; i < livingBeams.length; ++i){
		var m = (livingBeams[i].targetY - livingBeams[i].y) / (livingBeams[i].targetX - livingBeams[i].x);
		var t = livingBeams[i].y - m * livingBeams[i].x;

		for(var j = 0; j < points.length; ++j){
			var collisionPoint = m * points[j].x + t;

			if(M.abs(points[j].y - collisionPoint) <= 15){
					
					if((livingBeams[i].targetX > points[j].x &&
						livingBeams[i].x < points[j].x) ||
						(livingBeams[i].targetX < points[j].x &&
						 livingBeams[i].x > points[j].x)){
						if(points[j].life == 1){
							points[j].color = "red";
							player.life += 6;
							points[j].life = 0;
						}
					}	
			}
		}
	}
}

function resetPoint(point){
	point.x = M.random() * width;
	point.y = M.random() * height;
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


function drawLoadingBeams(){

	var growAngle = 0;
	if(beamAmount != 0)
		growAngle = 360 / beamAmount;
	
	var shootAngle = 0;

	for(var i = 0 ; i < beamAmount; ++i){


		var growingBeamLength = player.r + beamAmount/2;
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
    	context.strokeStyle = 'white';
		context.moveTo(loadingBeams[i].x,loadingBeams[i].y);
		context.lineTo(loadingBeams[i].targetX,loadingBeams[i].targetY);
		context.stroke();

	}

}

function drawBeams(){

	var growAngle = 0;
	if(beamAmount != 0)
		growAngle = 360 / beamAmount;
	
	var shootAngle = 0;

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
				beams[i].vx = (M.cos(shootAngle * piRatio) * beamLength) / 30 ;
				beams[i].vy = (sinusValue * beamLength) / 5 ; 

			}

			shootAngle += growAngle;
			beams[i].lifetime = 1;
		}
	}

	var livingBeams = getLivingBeams();
	for(var i = 0; i < livingBeams.length; ++i){
		context.beginPath();
		context.lineWidth = 2;
    	context.strokeStyle = 'white';
		context.moveTo(livingBeams[i].x,livingBeams[i].y);
		context.lineTo(livingBeams[i].targetX,livingBeams[i].targetY);
		context.stroke();	
	}
	beamAmount = 0;
}

function calculateBeamAmount(){
	var beamGrowRate = 1/5;

	if(beamAmount + beamGrowRate > 36)
		beamAmount = 36;
	else
		beamAmount += beamGrowRate;
}	

function grow(){
	var growRate = (player.life * 3) / player.r * factor;
	playerColor = "green";
	player.r += growRate;
	calculateBeamAmount();
}

function shrink(){
	var shrinkRate = player.r / (player.life * 10) * factor;

	if(player.r - shrinkRate < player.life){
		playerColor = "white";
		player.r = player.life;
	}
	else{
		playerColor = "red";
		player.r -= shrinkRate;
	}
}

function input(){
	if( keysDown[37] ){
		grow();
		
	}
	else if( keysDown[39] )
		grow();
	else{
		shrink();
	}
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

   
}

function draw(){
	context.fillStyle = "#000";
	context.fillRect( 0, 0, width, height );
	drawPoints();
	
	if(buttonReleased)
		drawBeams();
	if(buttonPressed)
		drawLoadingBeams();

	drawPlayer();
	detectCollision();
	moveBeams();
	clearScreenLeavingBeams();
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
	
	for(var i = 0; i < 36 ; ++i){
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

	for(var i = 0; i < 36 ; ++i){
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

	for(var i = 0; i < 20; ++i){
		points.push({
			x: M.random() * width,
			y: M.random() * height,
			life: 1,
			color: undefined
		})
	}

	player={
		x: width >> 1,
		y: height >> 1,
		r: 10,
		life:10
	};


	D.onkeydown = keyDown;
	D.onkeyup = keyUp;

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