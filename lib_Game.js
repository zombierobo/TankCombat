// import dependencies
require('./lib_common.js');
Tank = require('./lib_Tank.js').Tank;
areTankOverlapping = require('./lib_Tank.js').areTankOverlapping;

var Game = {}// = module.exports;

Game.Game = function(game_id , map_id , max_players , max_game_time,tank_model){
  this.id = game_id;
  this.map_id = map_id;
  this.max_players = max_players;
  this.max_game_time = max_game_time;
  this.tank_model = tank_model;

  this.server_frame_rate = 1000/frame_rate_settings.server_fps; // 30 fps
  
  this.state = 'in-lobby';   // possible values - 'in-lobby' , 'game-started' ,'game-terminated' 

  this.score_sheet = {};
  this.player_set = {};
  this.bullet_set = {}; // contains all the bullets in the game.

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

    var player_obj = new Player(user_id,nick_name,'blue',tank_model_settings);
    this.player_set[user_id] = player_obj;
    return true;
}

Game.Game.prototype.removePlayer = function(user_id){
    // remove from player_set
    delete this.player_set[user_id];
    return true;
}

Game.Game.prototype.getPlayer = function(user_id){
  return this.player_set[user_id]; 
}

Game.Game.prototype.getPlayerSet = function() {
  return this.player_set;
}

Game.Game.prototype.getBulletSet = function(){
  return this.bullet_set;
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

    if(this.client_update_buffer == null || this.client_update_buffer.length == 0)
      return;

    log('processClientUpdates','client_update_buffer : '+JSON.stringify(this.client_update_buffer));
    
    for(var i = 0 ; i < this.client_update_buffer.length ; i++)
    {
      var update = this.client_update_buffer[i];
      log('processClientUpdates' , 'update : '+update);

      var user_id = update.user_id;
      var commandSet = update.commandSet;

      // handle movement commands

      var tank_obj = this.getPlayer(user_id).getTank();
      if(tank_obj != null)
      {
        var dummy_tank = this.handle_tank_movement(tank_obj,null,null,commandSet);
    
        log('processClientUpdates','dummy_tank : '+JSON.stringify(dummy_tank));
        if(dummy_tank != null)
        {
          tank_obj.set_tank_position(dummy_tank.get_tank_position());
          tank_obj.set_tank_angle(dummy_tank.get_tank_angle());
          tank_obj.set_gun_angle(dummy_tank.get_gun_angle());
        }

        // handle fire command
        if(commandSet.isSpacePressed)
        {
          // check if this user_id has a bullet in game.
          if(this.bullet_set[user_id] == null)
          {
            var gun_angle = tank_obj.get_gun_angle();
            var position = tank_obj.get_gun_tip();

            var bullet_position = {};
            bullet_position.x = position.x
            bullet_position.y = position.y;

            // Tank.Bullet = function (width , length , color , current_position , projection_angle){
            var bullet_obj = new Bullet(bullet_model_settings.width , bullet_model_settings.length , bullet_model_settings.color , bullet_position , gun_angle);

            // bullet added to bullet set , the source of the bullet is user_id.
            this.bullet_set[user_id] = bullet_obj;

            log('BULLET FIRE COMMAND HANDLE','user_id : '+user_id + ' , gun tip : '+ JSON.stringify(position) + ' , gun_angle : ' + gun_angle + ' , bullet obj : '+JSON.stringify(bullet_obj));
          }
        }
      }

    }

    // empty the buffer
    this.client_update_buffer = [];
    log('latest games state',JSON.stringify(this.getPlayerSet()));
}

Game.Game.prototype.processBulletPosition = function(){
  var bullet_set = this.getBulletSet();
  if(bullet_set == null)
    return;

  for(var user_id in bullet_set)
  {
    var bullet_obj = bullet_set[user_id];
    var current_position = bullet_obj.get_bullet_position();
    
    if(current_position.x < 0 || current_position.x > 1000 || current_position.y < 0 || current_position.y > 1000)
    {
      // bullet out of boundary
      log('BULLET DELETE EVENT ' ,'bullet_obj : '+JSON.stringify(bullet_obj))
      delete bullet_set[user_id];
    }
    else
    {
      var projection_angle = bullet_obj.get_bullet_angle();
      var bullet_offset = bullet_control_config.bullet_offset_per_frame;

      var new_position = {}
      new_position.x = current_position.x + bullet_offset * Math.cos(projection_angle * Math.PI/180); 
      new_position.y = current_position.y - bullet_offset * Math.sin(projection_angle * Math.PI/180); 

      bullet_obj.set_bullet_position(new_position);

      log('AFTER BULLET UPDATE','bullet_obj : '+JSON.stringify(bullet_obj));
    }
  }
}

Game.Game.prototype.game_loop = function(){
    this.processClientUpdates();
    this.processBulletPosition();
}

Game.Game.prototype.handle_tank_movement = function(tank_obj , tank_list , Map_obj ,commandSet){

  if(tank_obj == null || commandSet == null )
    return tank_obj;

  var command_for_move = false;

  for(var command in commandSet)
  {
    if(commandSet[command])
    {
      command_for_move = true;
      break;
    }
  }

  if(!command_for_move)
    return tank_obj;    // no movement at all.

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

  var dummy_tank = new Tank(tank_model_settings.width , tank_model_settings.length,'blue');

  dummy_tank.set_tank_position(new_tank_position);
  dummy_tank.set_tank_angle(new_tank_angle);
  dummy_tank.set_gun_angle(new_gun_angle);

  return dummy_tank;
}

Game.Game.prototype.handle_bullet_collision = function(){
}
          
module.exports = Game;

// helper function
