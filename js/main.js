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
	entities = [],
	player,
	keysDown = [],
	playerColor,
	beamLength = 20,
	beamAmount = 0,
	piRatio = M.PI / 180,
	baseVelocity = 0.2,
	buttonPressed = false,
	buttonReleased = false;



function moveBeams(sendedBeams){

	for(var i = 0; i < sendedBeams; ++i){
		entities[i].x += entities[i].vx;
		entities[i].y += entities[i].vy; 
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
			entities[i].targetX = entities[i].x + beamLength;
			entities[i].targetY = entities[i].y;
			entities[i].vx = baseVelocity;

		}
		else if (shootAngle == 180){
			entities[i].targetX = entities[i].x - beamLength;
			entities[i].targetY = entities[i].y;
			entities[i].vx = -baseVelocity;
		}
		else{
			entities[i].targetX = M.cos(shootAngle * piRatio) * beamLength + entities[i].x; 
			entities[i].targetY = sinusValue * beamLength + entities[i].y;
			entities[i].vx = (M.cos(shootAngle * piRatio) * beamLength) / 30 ;
			entities[i].vy = (sinusValue * beamLength) / 30 ; 

		}

		shootAngle += growAngle;

		context.beginPath();
		context.lineWidth = 2;
    	context.strokeStyle = 'white';
		context.moveTo(entities[i].x,entities[i].y);
		context.lineTo(entities[i].targetX,entities[i].targetY);
		context.stroke();

		moveBeams(beamAmount);
	}

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
	if(buttonReleased)
		drawBeams();
	drawPlayer();
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
		entities.push({
			x: width >> 1,
			y: height >> 1,
			targetX: 0,
			targetY: 0,
			vx: 0,
			vy: 0,
			length: 7,
			lifetime: 0,
		});
	}

	entities.push(player={
		x: width >> 1,
		y: height >> 1,
		r: 10,
		life:10
	});


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