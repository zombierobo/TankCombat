///////////////////////////////////////////////
//######### update the code and use #########//
///////////////////////////////////////////////


(function(){


	this.logEnable = false;

	this.frame_rate_settings = {
		server_fps : 60,
		client_fps : 60
	} 
	this.tank_model_settings = {
		width : 50,
		length : 65	
	}

	this.tank_control_config = {
		tank_rotation : 3, // degrees
		gun_rotation : 3, // degrees 
		position_offset : 2 // pixels on the canvas  
	};

	this.bullet_model_settings = {
		width : 5,
		length : 20,
		color : 'black'
	}

	this.bullet_control_config = {
		bullet_offset_per_frame : 30
	}

	this.game_play = {
		health_reduction_per_bullet : 10
	}

	this.getMapSize = function(map){
		if(map != null)
	    	return Object.keys(map).length;
	    return undefined;
	}

	this.log = function(header, message){
		if(!this.logEnable)
			return;
	  console.log('-----------------------# ' + header + ' #---------------------------------');
	  console.log(message);
	  console.log('-----------------------------------------------------------------------------'); 
	  console.log('');
	}
	
}());