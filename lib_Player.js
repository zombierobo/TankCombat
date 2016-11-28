var Player = module.exports = function(player_id,nick_name ,preferred_color,tank_model){
  this.id = player_id;
  if(nick_name == null || nick_name.length == 0)
    this.nick_name = 'john cena';
  else
    this.nick_name = nick_name;

  this.health = 0;

  this.score = {}; // maintain score
  this.score.kills = 0;
  this.score.deaths = 0;

  this.preferred_color = preferred_color;
  if(this.preferred_color == null)
    this.preferred_color = 'blue';

  this.tank_obj = new Tank(tank_model.width , tank_model.length ,this.preferred_color);
  this.lobby_state = 'joined' // joined , not-joined , ready 
}

Player.prototype.getId = function(){
  return this.id;
}

Player.prototype.setId = function(new_player_id){
  this.id = new_player_id;
}

Player.prototype.getNickname = function(){
  return this.nick_name;
}

Player.prototype.setNickname = function(nick_name){
  this.nick_name = nick_name;
}

Player.prototype.getHealth = function(){
  return this.health;
}

Player.prototype.setHealth = function(new_health){
  if(new_health < 0)
    new_health = 0;
  if(new_health > 100)
    new_health = 100;
  
  this.health = new_health;
}

Player.prototype.getScore = function(){
  return this.score;
}

Player.prototype.setScore = function(new_score){
  this.score = new_score;
}

Player.prototype.getColor = function(){
    return this.preferred_color;
}

Player.prototype.incrementKills = function(){
  this.score.kills += 1;
}

Player.prototype.incrementDeaths = function(){
  this.score.deaths += 1;
}

Player.prototype.setColor = function(new_color){
    if(new_color != null)
    {
      this.preferred_color = new_color;
      this.getTank().set_tank_color(new_color);
    }
}

Player.prototype.getTank = function(){
  return this.tank_obj;
} 

Player.prototype.setTank = function(new_tank_obj){
  if(new_tank_obj != null)
    this.tank_obj = new_tank_obj;
} 

Player.prototype.getLobbyState = function(){
  return this.lobby_state;
}

Player.prototype.setLobbyState = function(new_lobby_state){
    if(new_lobby_state != null)
      this.lobby_state = new_lobby_state;
}