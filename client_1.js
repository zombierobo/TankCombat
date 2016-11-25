var in_app = 'in_app';
var in_lobby = 'in_lobby';
var in_game = 'in_game';

var Global = {};
Global.client_state;
Global.app_interval;
Global.lobby_interval;
Global.game_set;
Global.user_id;
Global.game_id;
Global.nick_name = 'zombie';

socket = io();

socket.on('connect',init);

function init(){
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

	// create a random game;

	//create_new_game(1,10,10*60*1000);
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
}

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
}

function handle_game_channel(socket,components){
}

function change_client_state(new_state){
	if(new_state == null)
		return;
	if(new_state == Global.client_state)
		return;

	if(Global.client_state == in_app)
		clearInterval(Global.app_interval);

	if(Global.client_state == in_lobby)
		clearInterval(Global.lobby_interval);

	if(new_state == in_app)
	{
		update_app_status_bar(in_app);
		Global.app_interval = setInterval(refresh_game_list , 3000); // refresh game list every three second.
		Global.client_state = in_app;
	}
	else if(new_state == in_lobby)
	{
		update_app_status_bar(in_lobby);
		Global.client_state = new_state;
		Global.lobby_interval = setInterval(refresh_lobby_list , 2000); // refresh lobby list every 2 second.
	}
	else if(new_state == in_game)
	{
		update_app_status_bar(in_game);
		Global.client_state = new_state;
	}
	else
	{
		log('change_client_state',' invalid new state');     
	}
}

function update_app_status_bar(state){
	$('#app-state').text(state);
}


function refresh_game_list(){
	var message = Global.user_id + '$' + 'get-games-list';
	emit_message_to_server(socket,in_app,message)
}

function refresh_lobby_list(){
	var message = Global.user_id + '$' +Global.game_id+'$' + 'get-lobby-state';
	emit_message_to_server(socket,in_lobby,message);
}

function emit_message_to_server(socket,channel,message) {
	socket.emit(channel,message);
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
		game_list_node.append('<li>' + 'Game ID - '+game_state.id +' Map Id - '+game_state.map_id+ ' in game : '+ game_state.player_count+
								' Max Players : '+game_state.max_players + ' max game time '+ game_state.max_game_time+ ' state : ' + game_state.state+'</li>');
	}
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

function leave_game(user_id , game_id){
	// returns true if request is successful , false otherwise

	if(Global.client_state == in_lobby)
	{
		var message = user_id + '$' + game_id + '$' + 'leave-game';
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

function start_game(user_id , game_id)
{
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
function emit_message_to_server(socket,channel,message){
	socket.emit(channel,message);
}