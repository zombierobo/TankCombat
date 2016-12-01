(function(){

	var Config = {};

	Config.logEnable = false;

	Config.frame_rate_settings = {
		server_fps : 60,
		client_fps : 60
	} 

	Config.tank_model_settings = {
		width : 50,
		length : 65	
	}

	Config.tank_control_config = {
		tank_rotation : 3, // degrees
		gun_rotation : 3, // degrees 
		position_offset : 2 // pixels on the canvas  
	};

	Config.bullet_model_settings = {
		width : 5,
		length : 20,
		color : 'black'
	}

	Config.bullet_control_config = {
		bullet_offset_per_frame : 30
	}

	Config.game_play = {
		health_reduction_per_bullet : 10
	}

	Config.getMapSize = function(map){
		if(map != null)
	    	return Object.keys(map).length;
	    return undefined;
	}

	Config.log = function(header, message){
		if(!Config.logEnable)
			return;
		console.log('-----------------------# ' + header + ' #---------------------------------');
		console.log(message);
		console.log('-----------------------------------------------------------------------------'); 
		console.log('');
	}
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    	module.exports = Config;
  	else
    	window.Config = Config;

}());