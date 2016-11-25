var Player = module.exports = function(player_id,nick_name ,preferred_color,tank_model){
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