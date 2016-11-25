///////////////////////////////////////////////
//######### update the code and use #########//
///////////////////////////////////////////////


(function(){

	this.log = function(header, message){
	  console.log('-----------------------# ' + header + ' #---------------------------------');
	  console.log(message);
	  console.log('-----------------------------------------------------------------------------'); 
	  console.log('');
	}

	this.getMapSize = function(map){
		if(map != null)
	    	return Object.keys(map).length;
	    return undefined;
	}
	
}());