///////////////////////////////////////////////
//######### update the code and use #########//
///////////////////////////////////////////////


function Game(game_id , map_id , max_players , max_game_time,tank_model)
{
  this.id = game_id;
  this.map_id = map_id;
  this.max_players = max_players;
  this.max_game_time = max_game_time;
  this.tank_model = tank_model;

  this.fps = 30;
  this.frame_rate = 1000/this.fps;
  
  this.state = 'in-lobby';   // possible values - 'in-lobby' , game-progress' ,'game-terminated' 

  this.score_sheet = {};
  this.player_set = {};

  this.elapsed_time = 0;
  
  this.client_update_buffer = [];  
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

Game.prototype.getMaxPlayer = function(){
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

    var player_obj = new Player(user_id,nick_name,this.tank_model);
    this.player_set[user_id] = player_obj;
    return true;
}

Game.prototype.removePlayer = function(user_id){
    delete this.player_set[user_id];
}

Game.prototype.getPlayer = function(user_id){
  return this.player_set[user_id]; 
}

Game.prototype.startGame = function(){
    for(player_id in this.player_set) 
    {
      if(this.player_set[player_id].getLobbyState() != 'ready')
        return false;  // some players are not in ready lobby state
    }
    // all players are ready
    // start game.
    this.state = "game-progress";
    setInterval(this.game_loop , this.frame_rate)
} 

Game.prototype.add_client_update = function(command) {
    this.client_command_buffer[this.client_command_buffer.length] = command;
}


Game.prototype.process_client_updates = function(){
    // consumes some updates posted by clients which are stored in client_updata_buffer.
    // the commands sent by clients are applied on server game state and Acknowlegement is sent.
    // todo
}

Game.prototype.game_loop = function(){
    this.process_client_updates()
}

// scoresheets not implemented as of now.
/*
Game.prototype.update_score_sheet = function(){
  
}

Game.prototype.get_score_sheet = function(){
  
}
*/

Game.prototype.handle_bullet_collision = function(){

}
          
Game.prototype.emit_game_state = function(){

}

function Player(player_id,nick_name ,preferred_color,tank_model){
  this.id = player_id;
  if(nick_name == null || nick_name.length == 0)
    this.nick_name = 'john cena';
  else
    this.nick_name = nick_name;

  this.health = 0;
  this.preferred_color = preferred_color;
  if(this.preferred_color == null)
    this.preferred_color = 'blue';

  this.tank_obj = new Tank(tank_model.width , tank_model.length ,this.preferred_color   );
  this.lobby_state = 'joined' // joined , not-joined , ready 
}

Player.prototype.getId = function(){
  return this.id;
}

Player.prototype.setId = function(new_player_id){
  this.id = new_player_id;
}

Player.prototype.getHealth = function(){
    return this.health;
}

Player.prototype.setHealth = function(new_health){
    this.health = new_health;
}

Player.prototype.getTank = function(){
  return this.tank_obj;
} 

Player.prototype.setTank = function(new_tank_obj){
  this.tank_obj = new_tank_obj;
} 


Player.prototype.getNickname = function(){
    return this.nick_name;
}

Player.prototype.setNickname = function(nick_name){
  this.nick_name = nick_name;
}

Player.prototype.getLobbyState = function(){
    return this.lobby_state;
}

Player.prototype.setLobbyState = function(new_lobby_state){
    if(new_lobby_state != null)
      this.lobby_state = new_lobby_state;
}

Player.prototype.getColor = function(){
    return this.preferred_color;
}

Player.prototype.setColor = function(new_color){
    if(new_color != null)
      this.preferred_color = new_color;
}
   