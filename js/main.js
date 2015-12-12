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
	beamLength = 200,
	beamAmount = 0,
	piRatio = M.PI / 180;


function drawBeams(){
	var targetX = 0,
		targetY = 0;


	var growAngle = 0;
	if(beamAmount != 0)
		growAngle = 360 / beamAmount;
	
	var shootAngle = 0;

	for(var i = 0 ; i < beamAmount; ++i){
		var sinusValue = M.sin(shootAngle * piRatio);

		if (shootAngle == 0 || shootAngle == 360){
			targetY = entities[i].y;
			targetX = entities[i].x + beamLength;
		}
		else if (shootAngle == 180){
			targetY = entities[i].y;
			targetX = entities[i].x - beamLength;	
		}	

		shootAngle += growAngle;

		context.beginPath();
		context.lineWidth = 2;
    	context.strokeStyle = 'white';
		context.moveTo(entities[0].x,entities[0].y);
		context.lineTo(targetX,targetY);
		context.stroke();
	}


	
	

}

function calculateBeamAmount(){
	var beamGrowRate = M.floor(player.r / (player.life * 5)) ;

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
	keysDown[event.keyCode] = down
	event.preventDefault()
}
function keyUp( event )
{
	setKey( event, false )
}
function keyDown( event )
{
	setKey( event, true )
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
	if(beamAmount == 36)
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
			targetX = 0,
			targetY = 0,
			vx: 0,
			vy: 0,
			length: 7
		});
	}

	entities.push(player={
		x: width >> 1,
		y: height >> 1,
		r: 100,
		life:100
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