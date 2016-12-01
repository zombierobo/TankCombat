
(function(){

  // import dependencies in case of server
  
  var Config,log,frame_rate_settings,tank_model_settings,
      getMapSize,Tank,Bullet,areTankOverlapping,areBulletTankOverlapping,Player;

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  {
    //server side
    Config = require('./Config.js');
    GameObjects = require('./GameObjects.js');
    Player = require('./Player.js');
  }
  else
  {
    // browser side
    Config = this.Config;
    GameObjects = this.GameObjects;
    Player = this.Player;;
  }

  var log = Config.log;
  var frame_rate_settings = Config.frame_rate_settings;
  var tank_model_settings = Config.tank_model_settings;
  var tank_control_config = Config.tank_control_config;
  var bullet_model_settings = Config.bullet_model_settings;
  var bullet_control_config = Config.bullet_control_config;
  var game_play = Config.game_play;
  var getMapSize = Config.getMapSize;
  
  var Tank = GameObjects.Tank;
  var Bullet = GameObjects.Bullet;
  var areTankOverlapping = GameObjects.areTankOverlapping;
  var areBulletTankOverlapping = GameObjects.areBulletTankOverlapping;

  var Game = function(game_id , map_id , max_players , max_game_time,tank_model){
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

  Game.prototype.getId = function(){
    return this.id;
  }

  Game.prototype.getMapId = function(){
    return this.map_id;
  }

  Game.prototype.getMaxGameTime = function(){
    return this.max_game_time;
  }

  Game.prototype.getMaxPlayers = function(){
    return this.max_players;
  }

  Game.prototype.getState = function(){
    return this.state;
  }

  Game.prototype.setState = function(new_state){
    this.state = new_state;
  }

  Game.prototype.addPlayer = function(user_id,nick_name){
      if(getMapSize(this.player_set) + 1 > this.max_players)
          return false ;      // game room full

      var player_obj = new Player(user_id,nick_name,'blue',tank_model_settings);
      this.player_set[user_id] = player_obj;
      return true;
  }

  Game.prototype.removePlayer = function(user_id){
      // remove from player_set
      delete this.player_set[user_id];
      return true;
  }

  Game.prototype.getPlayer = function(user_id){
    return this.player_set[user_id]; 
  }

  Game.prototype.getPlayerSet = function() {
    return this.player_set;
  }

  Game.prototype.getBulletSet = function(){
    return this.bullet_set;
  }

  Game.prototype.getPlayerCount = function(){
    return getMapSize(this.getPlayerSet());
  }

  Game.prototype.startGame = function(){
      if(this.state == 'in-lobby')
      {
        for(var player_id in this.player_set) 
        {
          if(this.player_set[player_id].getLobbyState() != 'ready')
            return false;  // some players are not in ready lobby state
        }
        // all players are ready
        // start game.

        // set initial starting positions of the tanks and also health to 100

        for(var player_id in this.player_set)
        {
          var player_obj = this.player_set[player_id];
          var tank_obj = player_obj.getTank();
          if(tank_obj == null)
            continue;

          var new_position = {};
          new_position.x = Math.round(Math.random()*1080);
          new_position.y = Math.round(Math.random()*700);
          tank_obj.set_tank_position(new_position);
          //console.log('set pos , for user_id :  ' + player_id + JSON.stringify(new_position));

          // set health to 100
          player_obj.setHealth(100);
        }

        this.state = "game-started";
        var that = this;
        this.game_interval = setInterval(function(){that.game_loop();}, this.server_frame_rate)
        return true;
      }
      return false;
  } 

  Game.prototype.stopGame = function(){
    if(this.state == 'game-started')
    {
      clearInterval(this.game_interval);
      this.state = 'game-terminated' ;
      return true;
    }
    return false;
  }

  Game.prototype.addClientUpdate = function(user_id,commandSet,command_no,time_stamp){
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

  Game.prototype.processClientUpdates = function(){
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
          var dummy_tank = this.handle_tank_movement(tank_obj,null,null,commandSet,tank_control_config);

          log('processClientUpdates','dummy_tank : '+JSON.stringify(dummy_tank));
          
          isColliding = false;

          for(var other_player_id in this.player_set)
          {
            if(user_id != other_player_id)
            {
              var other_tank_obj = this.getPlayer(other_player_id).getTank();
              if(areTankOverlapping(dummy_tank , other_tank_obj))
              {
                isColliding = true;
                break;
              }
            }
          }

          if(!isColliding)
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

  Game.prototype.processBulletPosition = function(){
    var bullet_set = this.getBulletSet();
    if(bullet_set == null)
      return;

    for(var user_id in bullet_set)
    {
      var bullet_obj = bullet_set[user_id];
      var current_position = bullet_obj.get_bullet_position();
      
      if(current_position.x < 0 || current_position.x > 1920 || current_position.y < 0 || current_position.y > 1080)
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

        for(var other_user_id in this.player_set)
        {
          if(other_user_id == user_id)
            continue;

          var tank_obj_a = (this.getPlayerSet())[other_user_id].getTank();

          if(areBulletTankOverlapping(bullet_obj , tank_obj_a))
          {
            var player_obj_shooter = this.getPlayer(user_id);
            var player_obj_hit = this.getPlayer(other_user_id);
            
            // reduce life of the player who got hit
            player_obj_hit.setHealth(player_obj_hit.getHealth() - game_play.health_reduction_per_bullet);
            
            if(player_obj_hit.getHealth() == 0)
            {
              player_obj_hit.incrementDeaths();
              player_obj_hit.setHealth(100);
              player_obj_shooter.incrementKills();
            }

            // bullet out of boundary
            log('BULLET DELETE EVENT ' ,'bullet_obj : '+JSON.stringify(bullet_obj))
            delete bullet_set[user_id];
          }

          
        }
        log('AFTER BULLET UPDATE','bullet_obj : '+JSON.stringify(bullet_obj));
      }
    }
  }

  Game.prototype.game_loop = function(){
      this.processClientUpdates();
      this.processBulletPosition();
  }

  Game.prototype.handle_tank_movement = function(tank_obj , tank_list , Map_obj ,commandSet , tank_control_config){

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

  Game.prototype.handle_bullet_collision = function(){
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Game;
  else
    window.Game = Game;

}());

//require('./lib_common.js');

