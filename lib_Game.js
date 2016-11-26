// import dependencies
Tank = require('./lib_Tank.js').Tank;
areTankOverlapping = require('./lib_Tank.js').areTankOverlapping;

var Game = {}// = module.exports;

Game.Game = function(game_id , map_id , max_players , max_game_time,tank_model)
{
  this.id = game_id;
  this.map_id = map_id;
  this.max_players = max_players;
  this.max_game_time = max_game_time;
  this.tank_model = tank_model;

  this.server_frame_rate = 1000/30; // 30 fps
  
  this.state = 'in-lobby';   // possible values - 'in-lobby' , 'game-started' ,'game-terminated' 

  this.score_sheet = {};
  this.player_set = {};

  this.elapsed_time = 0;
  
  this.client_update_buffer = [];  
  this.game_interval ;
}

Game.Game.prototype.getId = function(){
  return this.id;
}

Game.Game.prototype.getMapId = function(){
  return this.map_id;
}

Game.Game.prototype.getMaxGameTime = function(){
  return this.max_game_time;
}

Game.Game.prototype.getMaxPlayers = function(){
  return this.max_players;
}

Game.Game.prototype.getState = function(){
  return this.state;
}

Game.Game.prototype.setState = function(new_state){
  this.state = new_state;
}

Game.Game.prototype.addPlayer = function(user_id,nick_name){
    if(getMapSize(this.player_set) + 1 > this.max_players)
        return false ;      // game room full

    var player_obj = new Player(user_id,nick_name,'blue',this.tank_model);
    this.player_set[user_id] = player_obj;
    return true;
}

Game.Game.prototype.removePlayer = function(user_id){
    // remove from player_set
    delete this.player_set[user_id];
    // remove from score_sheet
    // TODO
    return true;
}

Game.Game.prototype.getPlayer = function(user_id){
  return this.player_set[user_id]; 
}

Game.Game.prototype.getPlayerSet = function() {
  return this.player_set;
}

Game.Game.prototype.getPlayerCount = function(){
  return getMapSize(this.getPlayerSet());
}

Game.Game.prototype.startGame = function(){
    if(this.state == 'in-lobby')
    {
      for(player_id in this.player_set) 
      {
        if(this.player_set[player_id].getLobbyState() != 'ready')
          return false;  // some players are not in ready lobby state
      }
      // all players are ready
      // start game.
      this.state = "game-started";
      var that = this;
      this.game_interval = setInterval(function(){that.game_loop();}, this.server_frame_rate)
      return true;
    }
    return false;
} 

Game.Game.prototype.stopGame = function(){
  if(this.state == 'game-started')
  {
    clearInterval(this.game_interval);
    this.state = 'game-terminated' ;
    return true;
  }
  return false;
}

Game.Game.prototype.addClientUpdate = function(user_id,commandSet,command_no,time_stamp){
  log('Game::addClientUpdate', 'arguments :: user_id : '+user_id+' , commandSet : '+commandSet +' , command_no : '+ command_no+
      ', time_stamp : '+time_stamp);
  if(user_id == null || commandSet == null)
    return false;
  if(this.getPlayer(user_id) == null)
    return false; // user_id does not exist in the game.

  var update = {};
  update.user_id = user_id;
  update.commandSet = commandSet;
  update.command_no = command_no;
  update.time_stamp = time_stamp;

  this.client_update_buffer[this.client_update_buffer.length] = update;
}

Game.Game.prototype.processClientUpdates = function(){
    // consumes some updates posted by clients which are stored in client_update_buffer.
    // the commands sent by clients are applied on server game state and Acknowlegement is sent.
    
    // todo - 1. collision detection between tanks.
    log('processClientUpdates','client_update_buffer : '+this.client_update_buffer);

    if(this.client_update_buffer == null )
      return;

    for(var i = 0 ; i < this.client_update_buffer ; i++)
    {
      var update = client_update_buffer[i];
      log('processClientUpdates' , 'update : '+update);

      var user_id = update.user_id;
      var commandSet = update.commandSet;

      var tank_obj = this.getPlayer(user_id).getTank();

      var dummy_tank = this.handle_tank_movement(tank_obj,commandSet);
      
      tank_obj.set_tank_position(dummy_tank.get_tank_position());
      tank_obj.set_tank_angle(dummy_tank.get_tank_angle());
      tank_obj.set_gun_angle(dummy_tank.get_gun_angle());
    }

    // empty the buffer

    this.client_update_buffer = [];
}

Game.Game.prototype.game_loop = function(){
    this.processClientUpdates();
}

// scoresheets not implemented as of now.
/*
this.Game.prototype.update_score_sheet = function(){
  
}

this.Game.prototype.get_score_sheet = function(){
  
}
*/

Game.Game.prototype.tank_control_config = {
  tank_rotation : 1, // degrees
  gun_rotation : 2, // degrees 
  position_offset : 1 // pixels on the canvas  
};


Game.Game.prototype.handle_tank_movement = function(tank_obj ,commandSet){

  var tank_rotation = this.tank_control_config.tank_rotation; // degrees
  var gun_rotation = this.tank_control_config.gun_rotation; // degrees
  var position_offset = this.tank_control_config.position_offset;

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
  new_tank_position.x = tank_obj.get_tank_position().x ;
  new_tank_position.y = tank_obj.get_tank_position().y ;
  var new_tank_angle = tank_obj.get_tank_angle();
  var new_gun_angle = tank_obj.get_gun_angle();
  
  // tank position update 
  if(commandSet.isUpArrow || commandSet.isDownArrow)
  {
    var tank_position = tank_obj.get_tank_position();
    var tank_angle = tank_obj.get_tank_angle();

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


Game.Game.prototype.handle_bullet_collision = function(){

}
          
Game.Game.prototype.emit_game_state = function(){

}

module.exports = Game;