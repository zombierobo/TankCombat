require('./lib_common.js');
require('./lib_Geometry.js');
require('./lib_Tank.js');   
require('./lib_Game.js');

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


/*######################################## end of express server##########################################################*/

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
var scale = 1;
var tank_model = {
  width  : 100*scale,
  length : 130*scale
};
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
        game_obj.stopGame();
        delete games_set[game_id];
      }
    }
    log('Games set',JSON.stringify(games_set));
  });
});

function handle_client_message(socket , channel , message){
    var components = message.split('$');
    var user_id = components[0] ; // identify client
    if(user_id == null || users_set['/#'+user_id ] == null)
    {
      log("handle_client_message::"+channel , 'Unrecognized user , user_id : '+user_id);
      return;
    }
    else
    {
      user_id = '/#'+user_id;
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
      var game_obj = new Game(game_id,map_id,max_players,max_game_time,tank_model);
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
      var player_set = game_obj.getPlayerSet();
      emit_lobby_list(socket,in_lobby,game_id,player_set)
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
    else if(components[2] == 'leave-game')
    {
      try
      {
        game_obj.removePlayer(user_id);
      }
      catch(err)
      {
        log('handle_lobby_channel::leave-game','error while removing a player from lobby');
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

function handle_game_channel(socket,user_id,components){
  var game_id = components[1];
  if(games_set[game_id] == null)
  {
    // game with game_id does not exist.
    var message = 'game-does-not-exist';
    emit_message_to_client(socket, in_game, message);
    return ; 
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

function emit_message_to_client(socket,channel ,message){
  log('emit_message_to_client','client id : ' + socket.id +' , channel : '+channel +' , message : '+message);
  socket.emit(channel , message);
}

