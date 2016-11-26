// initialize canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
window.onload = init;


var keyboard = new KeyboardState();
var frame_rate = 1000/60;

var scale = 0.5;
var tank_width = 100 * scale;
var tank_length = 130 * scale;
var tank_color = 'blue';

var t1 = new Tank(tank_width , tank_length , tank_color);
t1.set_tank_position({ x:canvas.width/2 , y:canvas.height/2});

var t2 = new Tank(tank_width , tank_length , 'red');
t2.set_tank_position({ x : (canvas.width/2 + 100) , y : canvas.height/2});

var dummy_tank = new Tank(tank_width , tank_length , 'yellow');

var tank_control_config = {};
tank_control_config.tank_rotation = 1; // degrees
tank_control_config.gun_rotation = 2; // degrees
tank_control_config.position_offset = 1;

var socket = io();

socket.on('connection' ,function(){
	console.log('connected to server : socket id - '+socket.id);
});

socket.on('list-of-games' , function(data){
	conosle.log(data);
});

function join_game(game_id) {
	socket.emit('join-game' , game_id);
}

function change_lobby_state(new_lobby_state) 
{
	socket.emit('in-lobby-change-state',new_lobby_state);
}

function init(){	
	setInterval(gameLoop , frame_rate);
}

function handle_keystroke(){
	
	var commandSet = {};
	commandSet.isUpArrow = keyboard.pressed('up');
	commandSet.isDownArrow = keyboard.pressed('down');
	commandSet.isLeftArrow = keyboard.pressed('left');
	commandSet.isRightArrow = keyboard.pressed('right');
	commandSet.isApressed = keyboard.pressed('a');
	commandSet.isDpressed = keyboard.pressed('d');
	commandSet.isSpacePressed = keyboard.pressed('space');
	
	send_command_to_server(commandSet);
	
	var dummy_tank = handle_tank_movement(t1,commandSet);

	if(areTankOverlapping(dummy_tank , t2))
	{
		console.log('collission occurs on move');
	}
	else
	{	t1.set_tank_position(dummy_tank.get_tank_position());
		t1.set_tank_angle(dummy_tank.get_tank_angle());
		t1.set_gun_angle(dummy_tank.get_gun_angle());
	}
}

function send_command_to_server(commandSet) {
	var message = JSON.stringify(commandSet);
	socket.emit('in-game' , message);
}

function handle_tank_movement(t1 ,commandSet){ 

	var tank_rotation = tank_control_config.tank_rotation; // degrees
	var gun_rotation = tank_control_config.gun_rotation; // degrees
	var position_offset = tank_control_config.position_offset;

	if( commandSet.isUpArrow && commandSet.isDownArrow)
	{
		// conflicting keystrokes
		commandSet.isDownArrow = commandSet.isUpArrow = false;
	}
	if(commandSet.isLeftArrow && commandSet.isRightArrow )
	{
		// conflicting keystrokes
		commandSet.isLeftArrow = commandSet.isRightArrow = false;
	}
	if(commandSet.isApressed && commandSet.isDpressed)
	{
		// conflicting keystrokes
		commandSet.isApressed = commandSet.isDpressed = false ;
	}

	var new_tank_position = {};
	new_tank_position.x = t1.get_tank_position().x ;
	new_tank_position.y = t1.get_tank_position().y ;
	var new_tank_angle = t1.get_tank_angle();
	var new_gun_angle = t1.get_gun_angle();
	
	// tank position update	
	if(commandSet.isUpArrow || commandSet.isDownArrow)
	{
		var tank_position = t1.get_tank_position();
		var tank_angle = t1.get_tank_angle();

		if(commandSet.isUpArrow)
		{
			new_tank_position.x = tank_position.x + position_offset * Math.cos(tank_angle * Math.PI/180);
			new_tank_position.y = tank_position.y - position_offset * Math.sin(tank_angle * Math.PI/180);	
		}
		else // isDownArrow
		{
			new_tank_position.x = tank_position.x - position_offset * Math.cos(tank_angle * Math.PI/180);
			new_tank_position.y = tank_position.y + position_offset * Math.sin(tank_angle * Math.PI/180);		
			tank_rotation = 0 - tank_rotation;
		}

	}

	// tank angle update
	if(commandSet.isLeftArrow)
	{
		new_tank_angle += tank_rotation;
		new_gun_angle += tank_rotation;
	}
	else if(commandSet.isRightArrow)
	{
		new_tank_angle -= tank_rotation;
		new_gun_angle -= tank_rotation;
	}

	// gun angle updation
	if(commandSet.isApressed)
		new_gun_angle += gun_rotation;
	else if(commandSet.isDpressed)
		new_gun_angle -= gun_rotation;


	dummy_tank.set_tank_position(new_tank_position);
	dummy_tank.set_tank_angle(new_tank_angle);
	dummy_tank.set_gun_angle(new_gun_angle);

	return dummy_tank;
}

function clear_canvas(){
	ctx.clearRect(0,0,canvas.width , canvas.height);
}


function gameLoop(){
	
	clear_canvas();
	handle_keystroke();
	t1.render();
	t2.render();
	
	/*
	var rect_body_a = getTankBodyRect(t1);
	var point_radius = 2
	var point_color = 'grey';
	
	drawPoint(rect_body_a.pointLT , point_radius,point_color);
	drawPoint(rect_body_a.pointLB , point_radius,point_color);
	drawPoint(rect_body_a.pointRT , point_radius,point_color);
	drawPoint(rect_body_a.pointRB , point_radius,point_color);

	var rect_body_b = getTankBodyRect(t2);
	drawPoint(rect_body_b.pointLT , point_radius,point_color);
	drawPoint(rect_body_b.pointLB , point_radius,point_color);
	drawPoint(rect_body_b.pointRT , point_radius,point_color);
	drawPoint(rect_body_b.pointRB , point_radius,point_color);

	var rect_gun_a = getTankGunRect(t1);
	drawPoint(rect_gun_a.pointLT , point_radius,point_color);
	drawPoint(rect_gun_a.pointLB , point_radius,point_color);
	drawPoint(rect_gun_a.pointRT , point_radius,point_color);
	drawPoint(rect_gun_a.pointRB , point_radius,point_color);

	var rect_gun_b = getTankGunRect(t2);
	drawPoint(rect_gun_b.pointLT , point_radius,point_color);
	drawPoint(rect_gun_b.pointLB , point_radius,point_color);
	drawPoint(rect_gun_b.pointRT , point_radius,point_color);
	drawPoint(rect_gun_b.pointRB , point_radius,point_color);
	*/
}

// helper functions - kind of useless

function drawCircle(x_pos , y_pos , radius , color)
{
	ctx.beginPath();
	ctx.save();
	ctx.fillStyle = color;
	ctx.arc(x_pos , y_pos,radius,0,2*Math.PI,true);
	ctx.fill();
	ctx.restore();
	ctx.closePath();
}

function drawPoint(point , radius , color)
{
	ctx.beginPath();
	ctx.save();
	ctx.fillStyle = color;
	ctx.arc(point.x , point.y ,radius,0,2*Math.PI,true);
	ctx.fill();
	ctx.restore();
	ctx.closePath();
}

