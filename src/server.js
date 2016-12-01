//require('./lib_common.js');

var Config = require('./Config.js');
var log = Config.log;
var getMapSize = Config.getMapSize;

Tank = require('./GameObjects').Tank;
Bullet = require('./GameObjects').Bullet;
Player = require('./Player.js');
Game = require('./Game.js');

//###################################################### Express Server setup #####################################################

var gameport = 3000;
var io = require('socket.io');
var express= require('express');
var UUID = require('node-uuid');
var verbose = false;
var http = require('http');
var app = express();
var server = http.createServer(app);

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

    //Tell the server to listen for incoming connections
server.listen(gameport)

    //Log something so we know that it succeeded.
console.log('listening on port ' + gameport );

    //By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){
    if(verbose)
      console.log('trying to load %s', __dirname + '/index.html');
    res.sendFile( '/index.html' , { root:__dirname });
});

//This handler will listen for requests on /*, any file from the root of our server.
//See expressjs documentation for more info on routing.

app.get( '/*' , function( req, res, next ) {

        //This is the current file they have requested
    var file = req.params[0];

        //For debugging, we can track what files are requested.
    if(verbose) 
      console.log('\t :: Express :: file requested : ' + file);

        //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

}); //app.get *


//##################################################################################################################################

/*
  Game object   - {game_id , map_id, max_players, max_game_time,game_state};
  Player object - {player_id, nick_name , lobby_state};
*/

// Global list of Users
var users_set = {};

// Global list of Games
var games_set = {}; 

// Global list of Maps
var maps_set = {}; 


// some constants
var in_app = 'in_app';
var in_lobby = 'in_lobby';
var in_game = 'in_game';

// initialize socket.io
var io = io.listen(server);

io.on('connection', function(socket){

  var user_id = socket.id;
  users_set[user_id] = true;

  log('io::connection','a new user connected '+'user id : '+ user_id);
  log('io::connection',JSON.stringify(users_set));

  emit_games_list(socket,in_app,games_set);

  socket.on(in_app , function(message){
    handle_client_message(socket,in_app,message);
  });

  socket.on(in_lobby,function(message){
    handle_client_message(socket,in_lobby,message);
  });

  socket.on(in_game , function(message){
    handle_client_message(socket,in_game,message);
  });

  socket.on('disconnect',function(){
    // remove user from user list
    
    user_id = socket.id;
    log('socket::disconnect' ,'a user disconnected , user id : '+user_id);
    delete users_set[user_id];
    log( 'Users Set' ,JSON.stringify(users_set));

    
    // remove user from lobby or a game
    for(var game_id in games_set)
    {
      var game_obj = games_set[game_id];
      game_obj.removePlayer(user_id);
      if(game_obj.getPlayerCount() == 0)
      {
        if(game_obj.stopGame());
          delete games_set[game_id];
        log('socket::disconnect' , 'stopping game , game_id : '+game_id);
      }
    }
    log('Games set',games_set);
  });
});

function handle_client_message(socket , channel , message){
    var components = message.split('$');
    var user_id = components[0] ; // identify client
    // Check for presence: --- users_set.hasOwnProperty(user_id)
    if(user_id == null || users_set[user_id ] == null)
    {
      log("handle_client_message::"+channel , 'Unrecognized user , user_id : '+user_id);
      return;
    }
    else
    {
      //user_id = '/#'+user_id;
    }

    if(channel == in_app)
    {
      handle_app_channel(socket,user_id,components);
    }
    else if(channel == in_lobby)
    {
      handle_lobby_channel(socket,user_id,components);
    }
    else if(channel == in_game)
    {
      handle_game_channel(socket,user_id,components);
    }
    else
    {
      log('Unrecognized Channel' , 'Message :'+message);
    }
}

//############################################# App(in_app) channel handlers ###########################################################

function handle_app_channel(socket,user_id,components){
  // type of messages 1-'get-games-list' 2-'join-game' 3-'create-new-game'
  if(components[1] == 'get-games-list')
  {
      emit_games_list(socket,in_app,games_set);
  } // get-games-list
  else if (components[1] == 'join-game')
  {
      var game_id = components[2];
      var game_obj = games_set[game_id];
      if(game_obj)
      {
          if(game_obj.addPlayer(user_id))
              var message = 'joined-game'+'$'+game_id;
          else
              var message = 'game-room-full'+'$'+game_id;
          emit_message_to_client(socket,in_app,message)
      }
      else
      {
          var message = 'game-does-not-exist';
          emit_message_to_client(socket, in_app, message);
      }
  } // join-game
  else if(components[1] == 'create-new-game')
  {
      var map_id = components[2];
      var max_players = components[3];
      var max_game_time = components[4];

      /*
      if(maps_set[map_id] == null) // bypass as of now
      {
          var message = "game-creation-unsuccessful" + '$' + "map_id does not exist";
          emit_message_to_client(socket,in_app , message);
          return;
      }
      */

      if(max_players == null || max_game_time == null)
      {
          var message = "game-creation-unsuccessful" + '$' +"arguments not valid";
          emit_message_to_client(socket,in_app,message);
          return;
      }
      
      var game_id = UUID();
      var game_obj = new Game(game_id,map_id,max_players,max_game_time,Config.tank_model_settings);
      game_obj.addPlayer(user_id);
      games_set[game_id] = game_obj;
      log("handle_client_message::"+in_app , 'games_set : '+JSON.stringify(games_set));
      // send acknowlegement and game details to client

      var message = 'game-creation-successful' + '$' + game_id + '$' + map_id + '$' +max_players + '$' + max_game_time;
      emit_message_to_client(socket,in_app,message);
      
  }// create-new-game
  else
  {
      var message = "invalid message format";
      emit_message_to_client(socket,in_app,message);
  }
}

function emit_games_list(socket,channel,games_set) {
  var games_list = {}
  for(var game_id in games_set)
  {
    var game_obj = games_set[game_id];
    var game_state = {}
    game_state.id = game_obj.getId();
    game_state.map_id = game_obj.getMapId();
    game_state.max_players = game_obj.getMaxPlayers();
    game_state.max_game_time = game_obj.getMaxGameTime();
    game_state.player_count = game_obj.getPlayerCount();
    game_state.state = game_obj.getState();
    games_list[game_id] = game_state;
  }

  var message = 'list-of-games'+'$'+JSON.stringify(games_list);
  emit_message_to_client(socket,channel,message);
}

//#######################################################################################################################################

//############################################# Lobby(in_lobby) channel handlers ###########################################################

function handle_lobby_channel(socket,user_id,components){

    // type of messages 1- 'get-lobby-state' 2-'change-color' , 3-'change-state'( to 'ready' , 'not-ready')
    var game_id = components[1];
    if(games_set[game_id] == null)
    {
      // game with game_id does not exist.
      var message = 'game-does-not-exist';
      emit_message_to_client(socket, in_lobby, message);
      return ; 
    }

    var game_obj = games_set[game_id];

    if(game_obj.getPlayer(user_id) == null)
    {
      log('handle_lobby_channel','user_id : '+user_id+' , does not exist in the game');
      return;
    }

    if(components[2] == 'get-lobby-state')
    {
      // lobby state consists of list of (player , nickname ,color ,ready/not-ready)
      if(game_obj.getState() == 'in-lobby')
      {  
        var player_set = game_obj.getPlayerSet();
        emit_lobby_list(socket,in_lobby,game_id,player_set)
      }
      else if(game_obj.getState() == 'game-started')
      {
        var message = 'game-started' + '$' + game_id;
        emit_message_to_client(socket,in_lobby,message);
      }
      else if(game_obj.getState() == 'game-terminated')
      {
        var message = 'game-terminated' + '$' + game_id;
        emit_message_to_client(socket,in_lobby,message); 
      }
    }
    else if(components[2] == 'change-nickname')
    {
      var nickname = components[3];
      if(nickname == null || nickname.length ==0 )
        return;

      try
      {
        game_obj.getPlayer(user_id).setNickname(nickname);
      }
      catch(err)
      {
       log('handle_lobby_channel::change-nickname' , 'error occured while changing nickname of player : '+user_id); 
      }
    }
    else if(components[2] == 'change-preferred-color')
    {
      var new_color = components[3];
      if(new_color == 0 || new_color.length == 0)
        return ;

      try
      {
        game_obj.getPlayer(user_id).setColor(new_color);
      }
      catch(err)
      {
        log('handle_lobby_channel::change-preferred-color' , 'error occured while changing preferred color of player : '+user_id);
      }
    }
    else if(components[2] == 'change-lobby-state')
    {
      var new_state = components[3];
      if(new_state == null)
        return ; // invalid state
    
      try
      {
        game_obj.getPlayer(user_id).setLobbyState(new_state);        
      }
      catch(err)
      {
        log('handle_lobby_channel::change-lobby-state' , 'error occured while changing lobby state of player : '+user_id);
      }
    }
    else if(components[2] == 'leave-game-lobby')
    {
      try
      {
        game_obj.removePlayer(user_id);
      }
      catch(err)
      {
        log('handle_lobby_channel::leave-game-lobby','error while removing a player from lobby');
      }
    }
    else if(components[2] == 'start-game')
    {
      try
      {
        if(game_obj.startGame())
        {
          // all the players are in 'ready' state.
          var message = 'game-started'+'$'+game_id;          
          emit_message_to_client(socket,in_lobby,message);
        }
        else
        {
          // all the players are not in 'ready' state
          var message = 'game-not-started' + '$' + game_id;
          emit_message_to_client(socket,in_lobby,message);
        } 
      }
      catch(err)
      {
        log('handle_lobby_channel::start-game','error occured while starting a game , game_id : '+game_id);  
      }
    } 
}

function emit_lobby_list(socket,channel,game_id,player_set){
  var lobby_set = {};
  for(var player_id in player_set)
  {
    var player_obj = player_set[player_id];
    var player_state = {};
    player_state.player_id = player_id;
    player_state.nickname = player_obj.getNickname();
    player_state.color = player_obj.getColor();
    player_state.lobbyState = player_obj.getLobbyState();

    lobby_set[player_id] = player_state;
  }
  var message = 'lobby-state'+'$'+game_id+'$'+JSON.stringify(lobby_set);
  emit_message_to_client(socket,channel,message);
}

//#######################################################################################################################################

//############################################# Game(in_game) channel handlers ###########################################################

function handle_game_channel(socket,user_id,components){
  log('handle_game_channel' , ' user_id : ' +user_id + ' ,components : '+components);
    
  var game_id = components[1];

  //check if game exists.
  if(games_set[game_id] == null)
  {
    // game with game_id does not exist.
    var message = 'game-does-not-exist';
    emit_message_to_client(socket, in_game, message);
    log('handle_game_channel::game-does-not-exist' , ' game_id : ' +game_id);
    return ; 
  }

  var game_obj = games_set[game_id];

  // check if the player is in this game.
  if(game_obj.getPlayer(user_id) == null)
  {
    // player with user_id does not exits.
    //var message = 'user-does-not-exist';
    //emit_message_to_client(socket, in_game, message);
    log('handle_game_channel::user-does-not-exist' , ' user_id : ' +user_id); 
    return ;   
  }

  if(components[2] == 'client-command')
  {
    var update = JSON.parse(components[3]);
    if(update == null)
    {
      log('handle_game_channel::client-command' , 'update from client : '+user_id + ' , update : is null');
      return;
    }
    log('handle_game_channel::client-command' , 'update from client : '+user_id + ' , update : '+JSON.stringify(update));
    
    game_obj.addClientUpdate(user_id,update.commandSet , update.command_no , update.time_stamp);
  }
  else if(components[2] == 'get-game-state')
  {
    var player_set = game_obj.getPlayerSet();
    var bullet_set = game_obj.getBulletSet();
    
    var game_state = {};
    
    // emit individual Tank information
    var new_player_set = {}
    for(var user_id in player_set)
    {
      var player_obj = player_set[user_id];

      var player_state = {};
      player_state.id = player_obj.getId();
      player_state.nickname = player_obj.getNickname();
      player_state.health = player_obj.getHealth();
      player_state.preferred_color = player_obj.getColor();
      player_state.score = player_obj.getScore();
      player_state.tank_properties = {};
      player_state.tank_properties.current_position = player_obj.getTank().get_tank_position();
      player_state.tank_properties.tank_orientation = player_obj.getTank().get_tank_orientation();

      new_player_set[user_id] = player_state;
    }
    game_state.player_set = new_player_set;

    // emit all the bullet information
    var new_bullet_set = {}
    for(var user_id in bullet_set)
    {
      var bullet_obj = bullet_set[user_id];

      var bullet_state = {};
      bullet_state.user_id = user_id;
      bullet_state.current_position = bullet_obj.get_bullet_position();
      bullet_state.bullet_angle = bullet_obj.get_bullet_angle();
      new_bullet_set[user_id] = bullet_state;
    }
    game_state.bullet_set = new_bullet_set;

    emit_game_state(socket,game_id,game_state);
  }
  else if(components[2] == 'leave-game')
  {
    try
    {
      game_obj.removePlayer(user_id);
    }
    catch(err)
    {
      log('handle_game_channel::leave-game','error while removing a player from the game');
    }
  }
}

function emit_game_state(socket,game_id,game_state){
  var message = game_id + '$' + 'game-state' + '$' + JSON.stringify(game_state);
  emit_message_to_client(socket,in_game,message);
}

//#######################################################################################################################################

//############################################ Helper functions ###############################################################

function emit_message_to_client(socket,channel ,message){
  log('emit_message_to_client','client id : ' + socket.id +' , channel : '+channel +' , message : '+message);
  socket.emit(channel , message);
}

//#############################################################################################################################
