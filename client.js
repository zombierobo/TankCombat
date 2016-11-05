// initialize canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
window.onload = init;


var keyboard = new KeyboardState();
var frame_rate = 1000/60;

var scale = 0.5;
var tank_width = 100 * scale;
var tank_length = 130 * scale;
var tank_color = 'grey';

var t1 = new Tank(tank_width , tank_length , tank_color);
t1.set_tank_position({ x:canvas.width/2 , y:canvas.height/2});

var tank_rotation = 3; // degrees
var gun_rotation = 3; // degrees
var position_offset = 2;

function init(){	
	setInterval(gameLoop , frame_rate);
}

function handle_keystroke(){
	var isUpArrow = keyboard.pressed('up');
	var isDownArrow = keyboard.pressed('down');
	var isLeftArrow = keyboard.pressed('left');
	var isRightArrow = keyboard.pressed('right');
	var isApressed = keyboard.pressed('a');
	var isDpressed = keyboard.pressed('d');
	handle_player_movement(isUpArrow , isDownArrow , isLeftArrow , isRightArrow , isApressed , isDpressed);
}

function handle_player_movement(isUpArrow , isDownArrow , isLeftArrow , isRightArrow,isApressed, isDpressed ){ 

	if( isUpArrow && isDownArrow)
	{
		// conflicting keystrokes
		isDownArrow = isUpArrow = false;
	}
	if(isLeftArrow && isRightArrow )
	{
		// conflicting keystrokes
		isLeftArrow = isRightArrow = false;
	}
	if(isApressed && isDpressed)
	{
		// conflicting keystrokes
		isApressed = isDpressed = false ;
	}


	// tank angle update
	if(isLeftArrow)
	{
		t1.set_tank_angle( t1.get_tank_angle() - tank_rotation);
		t1.set_gun_angle( t1.get_gun_angle() - tank_rotation);
	}
	else if(isRightArrow)
	{
		t1.set_tank_angle( t1.get_tank_angle() + tank_rotation);
		t1.set_gun_angle( t1.get_gun_angle() + tank_rotation);
	}

	// tank position update	
	if(isUpArrow || isDownArrow)
	{

		var tank_position = t1.get_tank_position();
		var tank_angle = t1.get_tank_angle();

		var new_tank_position = {};
		if(isUpArrow)
		{
			new_tank_position.x = tank_position.x + position_offset * Math.cos(tank_angle * Math.PI/180);
			new_tank_position.y = tank_position.y + position_offset * Math.sin(tank_angle * Math.PI/180);	
		}
		else
		{
			new_tank_position.x = tank_position.x - position_offset * Math.cos(tank_angle * Math.PI/180);
			new_tank_position.y = tank_position.y - position_offset * Math.sin(tank_angle * Math.PI/180);		
		}

		t1.set_tank_position(new_tank_position);
	}

	// gun angle updation
	if(isApressed)
		t1.set_gun_angle( t1.get_gun_angle() - gun_rotation);
	else if(isDpressed)
		t1.set_gun_angle( t1.get_gun_angle() + gun_rotation);
}

function clear_canvas(){
	ctx.clearRect(0,0,canvas.width , canvas.height);
}


function gameLoop(){
	clear_canvas();
	handle_keystroke();
	t1.render();
}




// helper functions - kind of useless

function drawCircle(x_pos , y_pos , radius , color)
{
	ctx.save();
	ctx.fillStyle = color;
	ctx.arc(x_pos , y_pos,radius,0,2*Math.PI,true);
	ctx.fill();
	ctx.restore();
}