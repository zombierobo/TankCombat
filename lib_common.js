///////////////////////////////////////////////
//######### update the code and use #########//
///////////////////////////////////////////////


(function(){


	this.tank_model_settings = {
		width :50,
		length : 65	
	}

	this.tank_control_config = {
		tank_rotation : 1, // degrees
		gun_rotation : 2, // degrees 
		position_offset : 5 // pixels on the canvas  
	};

	this.getMapSize = function(map){
		if(map != null)
	    	return Object.keys(map).length;
	    return undefined;
	}

	this.log = function(header, message){
	  console.log('-----------------------# ' + header + ' #---------------------------------');
	  console.log(message);
	  console.log('-----------------------------------------------------------------------------'); 
	  console.log('');
	}
	
}());