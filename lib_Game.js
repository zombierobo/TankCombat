var Game = module.exports;

Game.Game = function(game_id , map_id , max_players , max_game_time,tank_model)
{
  this.id = game_id;
  this.map_id = map_id;
  this.max_players = max_players;
  this.max_game_time = max_game_time;
  this.tank_model = tank_model;

  this.fps = 30;
  this.frame_rate = 1000/this.fps;
  
  this.state = 'in-lobby';   // possible values - 'in-lobby' , 'game-started' ,'game-terminated' 

  this.score_sheet = {};
  this.player_set = {};

  this.elapsed_time = 0;
  
  this.client_update_buffer = [];  
  this.interval ;
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
      this.state = "game-progress";
      this.interval = setInterval(this.game_loop , this.frame_rate)
      return true;
    }
    return false;
} 

Game.Game.prototype.stopGame = function(){
  if(this.state == 'game-started')
  {
    clearInterval(this.interval);
    return true;
  }
  return false;
}

Game.Game.prototype.add_client_update = function(command) {
    this.client_command_buffer[this.client_command_buffer.length] = command;
}


Game.Game.prototype.process_client_updates = function(){
    console.log('started');
    // consumes some updates posted by clients which are stored in client_updata_buffer.
    // the commands sent by clients are applied on server game state and Acknowlegement is sent.
    // todo
}

Game.Game.prototype.game_loop = function(){
    var self = this;
    self.process_client_updates();
}

// scoresheets not implemented as of now.
/*
this.Game.prototype.update_score_sheet = function(){
  
}

this.Game.prototype.get_score_sheet = function(){
  
}
*/

Game.Game.prototype.handle_bullet_collision = function(){

}
          
Game.Game.prototype.emit_game_state = function(){

}