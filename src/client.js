window.onload = initializeVariables;

var log;
var getMapSize;
var Bullet;
var Tank;
var in_app = 'in_app';
var in_lobby = 'in_lobby';
var in_game = 'in_game';
var Global = {};
var socket;
var frame_rate_settings;
var tank_model_settings;
var bullet_model_settings;

function initializeVariables(){
	log = this.Config.log;
	frame_rate_settings = this.Config.frame_rate_settings;
	tank_model_settings = this.Config.tank_model_settings;
	bullet_model_settings = this.Config.bullet_model_settings;
	getMapSize = this.Config.getMapSize;
	
	Tank = this.GameObjects.Tank;
	Bullet = this.GameObjects.Bullet;
	

	Global.client_state;
	Global.user_id;
	Global.game_id;
	Global.nick_name = 'zombie';
	Global.canvas = document.getElementById('myCanvas');
	Global.ctx = Global.canvas.getContext('2d');
	Global.client_frame_rate = 1000/frame_rate_settings.client_fps;
	socket = io();
	socket.on('connect', initGame);
}



function initGame(){
	console.log('init called');
	change_client_state( in_app);

	log('CONNECTION TO SERVER','connected to server socket id : '+socket.id);
	Global.user_id = socket.id;

	socket.on(in_app , function(message){	
		handle_server_message(socket,in_app , message);
	});

	socket.on(in_lobby , function(message){
		handle_server_message(socket,in_lobby,message);
	});

	socket.on(in_game,function(message){
		handle_server_message(socket,in_game,message);
	});

	socket.on('disconnect' , function(){
		console.log('disconnectted from server');
	});
}


function handle_server_message(socket,channel , message){
	log('handle_server_message' ,'message from server , channel : '+channel + ' , message : '+message);	
	var components = message.split('$');
	
	if(channel == in_app)
	{
		handle_app_channel(socket,components);
	}
	else if(channel == in_lobby)
	{
		handle_lobby_channel(socket,components);
	}
	else if(channel == in_game)
	{
		handle_game_channel(socket,components);
	}
	else
	{
		log('handle_server_message::unrecognized channel','message : '+message);
	}
}

//######################################## App(in_app) action and event handlers ##############################################

Global.app_interval;

function handle_app_channel(socket,components){
	
	if(components[0] == 'list-of-games')
	{
		var new_games_list = JSON.parse(components[1]);
		load_game_list(new_games_list);
		log('handle_app_channel::list-of-games' , 'list-of-games : '+components[1]);
	}
	else if(components[0] == "joined-game")
	{
		var game_id = components[1];
		log('handle_app_channel::joined-game' , 'game-joined : '+game_id);
		Global.game_id = game_id;
		change_client_state(in_lobby);
	}
	else if(components[0] == "game-room-full")
	{
		var game_id = components[1];
		log('handle_app_channel::game-room-full' , 'game_id : '+ game_id + 'game room full');
	}
	else if(components[0] == "game-creation-successful")
	{
		var new_game_id = components[1];
		Global.game_id = new_game_id;
		log('handle_app_channel::game-creation-successful' , 'game-creation-successful : '+new_game_id);
		change_client_state(in_lobby);
	}
	else if(components[0] == "game-creation-unsuccessful")
	{
		log('handle_app_channel::game-creation-unsuccessful' ,'game-creation-unsuccessful : something went wrong during game creation on the server side');
	}
	else
	{
		log('handle_app_channel','unrecognized message');
	}
}

function refresh_game_list(){
	var message = Global.user_id + '$' + 'get-games-list';
	emit_message_to_server(socket,in_app,message)
}

function load_game_list(new_games_list) {
	log('load_game_list' , 'new_games_list : '+new_games_list);
	var game_list_node = $('#list-of-games');
	game_list_node.empty();
	
	if(new_games_list == null || getMapSize(new_games_list) == 0)
	{
		game_list_node.append('<li>'+'no games as of yet'+'</li>');	
		return;
	}

	for(var game_id in new_games_list)
	{
		var game_state = new_games_list[game_id];
		var li = document.createElement('li');
		li.innerHTML = 'Game ID - ' + game_state.id + ' Map Id - ' + game_state.map_id + ' in game : '
						+ game_state.player_count + ' Max Players : ' + game_state.max_players
						+ ' max game time '+ game_state.max_game_time + ' state : ' + game_state.state +
						'<br> <button id="join-button">Join</button>';
		li.querySelector('button').addEventListener('click', function(e) {
			console.log(game_id);
			join_game(game_id);
		})
		game_list_node.append(li);
	}
}

function create_new_game(map_id , max_players , max_game_time){
	if(map_id == null)
		return false;
	if(max_players == null || max_players <=0 || max_players >=100)
		return false;
	if(max_game_time == null || max_game_time<=0 || max_game_time > 10*60*1000)
		return false;

	var message = Global.user_id + '$' + 'create-new-game' + '$' +map_id + '$' + max_players + '$' + max_game_time;
	emit_message_to_server(socket,in_app, message);
	return true;
}

function join_game(game_id){
	// returns true if the request is succesfull , false otherwise
	
	if(Global.client_state  == in_app)
	{	
		var message = Global.user_id+'$'+'join-game'+'$'+game_id;
		emit_message_to_server(socket,in_app,message);
		return true;
	}
	else
		return false;
}

//###############################################################################################################################

//######################################## Lobby(in_lobby) action and event handlers ############################################

Global.lobby_interval;

function handle_lobby_channel(socket,components){
	if(components[0] == 'lobby-state')
	{
		var game_id = components[1];
		var lobby_list = JSON.parse(components[2]);
		if(lobby_list != null)
			load_lobby_list(lobby_list);
	}
	else if(components[0] == 'game-not-started')
	{
		log('handle_lobby_channel::game-not-started' ,'some players are not in ready state');
	}
	else if(components[0] == 'game-started')
	{
		var game_id = components[1];
		log('handle_lobby_channel::game-started' , 'game stared , game_id : '+game_id);
		change_client_state(in_game);
	}
	else if (components[0] == 'game-terminated')
	{
		var game_id = components[1];
		log('handle_lobby_channel::game-terminated' , 'game game-terminated , game_id : '+game_id);
		change_client_state(in_app);		
	}
	else
	{
		log('handle_lobby_channel' , 'unrecognized message');
	}
}

function refresh_lobby_list(){
	var message = Global.user_id + '$' +Global.game_id+'$' + 'get-lobby-state';
	emit_message_to_server(socket,in_lobby,message);
}

function load_lobby_list(new_lobby_list){
	log('load_lobby_list','new_lobby_list : '+new_lobby_list);
	
	var lobby_list_node = $('#lobby-of-players');
	lobby_list_node.empty();

	if(new_lobby_list == null || getMapSize(new_lobby_list) ==0 )
	{
		lobby_list_node.append('<li>'+'no players in the lobby'+'</li>');	
		return;
	}

	for(var player_id in new_lobby_list)
	{
		var player_state = new_lobby_list[player_id];
		lobby_list_node.append('<li>' + player_state.player_id+ ' nickname : ' + player_state.nickname+ ' color : ' + player_state.color + 
								' lobby_state : ' + player_state.lobbyState+'</li>');
	}
}

function leave_game_lobby(user_id , game_id){
	// returns true if request is successful , false otherwise

	if(Global.client_state == in_lobby)
	{
		var message = user_id + '$' + game_id + '$' + 'leave-game-lobby';
		emit_message_to_server(socket,in_lobby,message);
		return true;
	}
	else
		return false;
}

function change_lobby_state(user_id,game_id , new_state){
	// returns true if request is successful , false otherwise
	
	if(user_id == null || game_id == null || new_state == null)
		return false;

	if(Global.client_state == in_lobby)
	{
		var message = user_id + '$' +game_id + '$' + 'change-lobby-state' + '$' + new_state;
		emit_message_to_server(socket , in_lobby , message);
		return true;
	}
	else
		return false;
}

function change_nickname(user_id , game_id , nickname){
	// returns true if request is successful , false otherwise
	if(nickname == null || nickname.length == 0)
		return false;

	if(Global.client_state == in_lobby)
	{
		var message = user_id + '$' +game_id + '$' + 'change-nickname' + '$' + nickname;
		emit_message_to_server(socket , in_lobby , message);
		return true;
	}
	else
		return false;	
}

function change_preferred_color(user_id , game_id , new_color){
	// returns true if request is successful , false otherwise

	if(Global.client_state == in_lobby)
	{	
		var message = user_id + '$' +game_id + '$' + 'change-preferred-color' + '$' + new_color;
		emit_message_to_server(socket , in_lobby , message);
		return true;
	}
	else
		return false;
}

function start_game(user_id , game_id){
	if(user_id == null || game_id == null)
		return false;
	
	if(Global.client_state == in_lobby)
	{
		var message = user_id +'$'+ game_id +'$' + 'start-game';
		emit_message_to_server(socket,in_lobby,message);	
		return true;
	}
	return false;		
}

//###################################################################################################################################

//############################################## Game(in_game) Action and Event handlers ############################################

Global.game_interval;


Global.game_state = {};


function handle_game_channel(socket,components){
	var game_id = components[0];
	if(game_id == null || game_id != Global.game_id)
	{
		log('handle_game_channel' , 'unrecognized game , game_id : '+game_id );
		return false;
	}

	if(components[1] == 'game-state')
	{
		// update from server about game state.
		var game_state = JSON.parse(components[2]);
		if(game_state == null)
		{
			log('handle_game_channel::game-state', 'game_state is null');
			return false;
		}
		else
			log('handle_game_channel::game-state' , 'game_state: '+JSON.stringify(Global.game_state.player_set));
		
		Global.game_state = game_state;
	}
}

function main_game_loop(){
	refresh_game_state();
	handle_key_stroke();
	clear_canvas();
	render_game();
	update_score_sheet();
}

function handle_key_stroke(){
	
	var keyboard = Global.keyboard;

	var commandSet = {};
	commandSet.isUpArrow = keyboard.pressed('up');
	commandSet.isDownArrow = keyboard.pressed('down');
	commandSet.isLeftArrow = keyboard.pressed('left');
	commandSet.isRightArrow = keyboard.pressed('right');
	commandSet.isApressed = keyboard.pressed('a');
	commandSet.isDpressed = keyboard.pressed('d');
	commandSet.isSpacePressed = keyboard.pressed('space');
	
	var command_no = 5;
	var time_stamp = 12111;

	var is_command = false;

	for(var command in commandSet)
	{
		if(commandSet[command] == true)
		{
			is_command = true;
			break;
		}
	}
	if(is_command)
		send_update_to_server(Global.user_id , Global.game_id , commandSet , command_no , time_stamp);
}

function send_update_to_server(user_id ,game_id,commandSet,command_no,time_stamp){
	//console.log('send_update_to_server')
	if(user_id == null || game_id == null || commandSet == null )
		return false;

	var update = {};
	update.commandSet = commandSet;
	update.command_no = command_no;
	update.time_stamp = time_stamp;

	var message = user_id + '$' + game_id +'$' + 'client-command' + '$' + JSON.stringify(update);
	emit_message_to_server(socket,in_game,message);
	return true;
}

function refresh_game_state(){
	var message = Global.user_id + '$' +Global.game_id+'$' + 'get-game-state';
	emit_message_to_server(socket,in_game,message);
}

function clear_canvas(){
	var canvas = Global.canvas;
	var ctx = Global.ctx;
	ctx.beginPath();
	ctx.clearRect(0,0,canvas.width , canvas.height);
	ctx.closePath();
}

function render_game(){
	
	// render all the tanks

	if(Global.game_state.player_set == null)
	{
		log('render_game' , 'game_state is not defined');
		return false;
	}	
	
	var player_set = Global.game_state.player_set;
	if(player_set == null )
		return false;

	for(var user_id in player_set)
	{

		var player_obj = player_set[user_id];
		var tank_obj = new Tank(tank_model_settings.width , tank_model_settings.length , player_obj.preferred_color);
		
		tank_obj.set_tank_position(player_obj.tank_properties.current_position);
		tank_obj.set_tank_orientation(player_obj.tank_properties.tank_orientation);
		tank_obj.render(Global.ctx);
	}

	// render all bullets
	if(Global.game_state.bullet_set == null)
	{
		log('render_game' , 'game_state is not defined');
		return false;
	}

	var bullet_set = Global.game_state.bullet_set;

	for(var user_id in bullet_set)
	{
		var bullet = bullet_set[user_id];
		var current_position = bullet.current_position;
		var bullet_angle = bullet.bullet_angle;
		var bullet_obj = new Bullet(bullet_model_settings.width , bullet_model_settings.length , bullet_model_settings.color , 
									current_position , bullet_angle);
		bullet_obj.render(Global.ctx);
	}

	return true;
}

function update_score_sheet(){
	var player_set = Global.game_state.player_set;
	$('#score-sheet').empty();

	for(var player_id in player_set)
	{
		var player_obj = player_set[player_id];
		
		var nickname = player_obj.nickname;
		var health = player_obj.health;
		var kills = player_obj.score.kills;
		var deaths = player_obj.score.deaths;
		var color = player_obj.preferred_color;

		$('#score-sheet').append(
			$('<li>').append('nickname : ' + nickname +' kills : '+kills + ' deaths : '+deaths +' health : '+health)
		);
	}

}

//######################################################################################################################################


//############################################## Helper functions ####################################################################

function change_client_state(new_state){
	if(new_state == null)
		return;
	if(new_state == Global.client_state)
		return;

	if(Global.client_state == in_app)
		clearInterval(Global.app_interval);

	if(Global.client_state == in_lobby)
		clearInterval(Global.lobby_interval);

	if(Global.client_state == in_game)
	{
		// stop game loop
		clearInterval(Global.game_interval);
	
		// stop listening to key events
		Global.keyboard.destroy();
	}

	if(new_state == in_app)
	{
		update_app_status_bar(in_app);
		Global.app_interval = setInterval(refresh_game_list , 3000); // refresh game list every three second.
		Global.client_state = in_app;
		displayPhase(in_app);
	}
	else if(new_state == in_lobby)
	{
		update_app_status_bar(in_lobby);
		Global.client_state = new_state;
		Global.lobby_interval = setInterval(refresh_lobby_list , 2000); // refresh lobby list every 2 second.
		displayPhase(in_lobby);
	}
	else if(new_state == in_game)
	{
		// listen to keyboard events

		Global.keyboard = new KeyboardState();

		update_app_status_bar(in_game);
		Global.client_state = new_state;
		Global.game_interval = setInterval(main_game_loop , Global.client_frame_rate);
		displayPhase(in_game);
	}
	else
	{
		log('change_client_state',' invalid new state');     
	}
}


function update_app_status_bar(state){
	$('#app-state').text(state);
}

function emit_message_to_server(socket,channel,message) {
	socket.emit(channel,message);
}

function emit_message_to_server(socket,channel,message){
	socket.emit(channel,message);
}

function log(header, message){
	if(Global.logEnable == false)
		return;
	console.log('-----------------------# ' + header + ' #---------------------------------');
	console.log(message);
	console.log('-----------------------------------------------------------------------------'); 
	console.log('');
}
//#######################################################################################################################################



function displayPhase(phaseId) {
	console.log('Transitioning to: ' + phaseId);
	var phaseIds = [in_app, in_lobby, in_game];
	phaseIds.forEach(function(id) {
		document.querySelector('#' + id).style.display = "none";
	});

	if (phaseId == in_game) {
		document.querySelector('#app-container').style.display = "none";
	}

	document.querySelector('#' + phaseId).style.display = "inline-block";
}



function handleNewGameClick() {
	console.log("Initiating game");
	var mapid = $('#' + in_app).find('#map_id').val(),
		max_players = $('#' + in_app).find('#max_players').val(),
		game_time = $('#' + in_app).find('#game_time').val();

	console.log('mapid : ' + mapid + ' max_players : ' + max_players + ' game_time : '+game_time )
	if(max_players == null || mapid == null || game_time == null)
		return;

	create_new_game(mapid, max_players, game_time);
	//change_client_state(in_lobby);
}

function handleNicknameChange(){
	console.log("changing nickname");

	var nickname = $('#' + in_lobby).find('#nickname').val();
	$('#' + in_lobby).find('#nickname').val('');
	if(nickname == null || nickname.length == 0)
		return;

	change_nickname(Global.user_id , Global.game_id , nickname);
}

function handle_lobby_state_change(new_lobby_state){
	change_lobby_state(Global.user_id , Global.game_id , new_lobby_state);
}

$('#gameRoomCreation').on('submit', function(e) {
	e.preventDefault();
	handleNewGameClick();
});

$('#nickNameForm').on('submit' , function(e){
	e.preventDefault();
	handleNicknameChange();
});

$('#Ready-button').on('click' , function(e){
	e.preventDefault();
	var new_lobby_state = 'ready'
	handle_lobby_state_change(new_lobby_state);
});

$('#Launch-button').on('click',function(e){
	e.preventDefault();
	start_game(Global.user_id , Global.game_id);
})
