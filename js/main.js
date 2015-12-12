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
	keysDown;

function drawPlayer(){
	context.arc(player.x, player.y, player.r, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();
}

function draw(){
	context.fillStyle = "#000";
	context.fillRect( 0, 0, width, height );

	drawPlayer();
}

function run(){
	requestAnimationFrame( run )
	now = Date.now()
	factor = (now-last)/16
	last = now
	draw()
}

function setup(){
	entities.push(player={
		x: width >> 1,
		y: height >> 1,
		r: 10,
		life:10
	});

	run();
}

function init(){
	canvas = D.getElementById( "canvas" );
	context = canvas.getContext( "2d" );
	canvas.width = width = W.innerWidth;
	canvas.height = height = W.innerHeight;
	setup();
}


W.onload = init