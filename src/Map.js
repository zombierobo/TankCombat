
(function(){

	var MAP_ELEMENT_CONSTANTS = {};
	MAP_ELEMENT_CONSTANTS.blank = 'blank';
	MAP_ELEMENT_CONSTANTS.block = 'block';

	var Map = function(character_representation , width ,height){
		/*
			The canvas is broken down into 10*10 pixel blocks ,
			each of these blocks represent one type of map component.
			blocks can be of type

			1 - blank , 2 - solid block 3 - can add color coding too

			The character_representation is an array of height/10 elements
			each element of the array represent a row of blocks in the map

			
			example 

			'#' -> solid block
			'b' -> blank block

			width = 33 characters * 10 = 330
			height = 9 rows * 10 = 90

			#################################
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#
			#################################

		*/

		this.width = width;
		this.height = height;
		this.mapComponents = [];

		if(character_representation.length*10 != this.height)
		{
			console.log("Map : Error : in character_representation : height not valid ");
			return;
		}
		else
		{
			for(var i = 0 ; i<character_representation.length ; i++)
			{
				var map_row = character_representation[i];
				
				console.log(map_row);

				if(map_row.length*10 != this.width)
				{
					console.log('Map : Error : in character_representation : width not valid : row number : '+i);
					return;
				}
				else
				{
					this.mapComponents[i] = [];
					
					for(var j = 0 ; j<map_row.length ; j++)
					{
						var component = MAP_ELEMENT_CONSTANTS[ this.characterMapping[ map_row[j] ] ];
						if(component != null)
							this.mapComponents[i][j] = component;
						else
						{
							console.log('Map : Error : in character_representation : invalid character : i : '+i+ ' , j : '+j);
							return;
						}
					}
				}
			}	
		}
	}

	// get methods
	Map.prototype.getWidth = function(){
		return this.width;
	}
	Map.prototype.getHeight = function(){
		return this.height;
	}
	Map.prototype.getMapComponents = function(){
		return this.mapComponents;
	}

	/*
		global variable used to store mapping between character and type of map block
	*/
	Map.prototype.characterMapping = {
		'b' : MAP_ELEMENT_CONSTANTS.blank,
		'#' : MAP_ELEMENT_CONSTANTS.block
	};

	/*
		method used to render the components of the Map.
	*/
	Map.prototype.render = function() {
		console.log('Map : render');
		if(this.mapComponents == null || this.mapComponents.length == 0)
			return;
		ctx.save();
		ctx.beginPath();
		
		for(var i = 0 ; i<this.mapComponents.length ; i++)
		{
			var map_row = this.mapComponents[i];
			for(var j = 0 ; j<map_row.length ; j++)
			{
				//console.log('inside for loop');
				var component = this.mapComponents[i][j];
				if(component == MAP_ELEMENT_CONSTANTS.block)
				{
					ctx.save();
					ctx.fillStyle = 'black';
					ctx.fillRect(j*10,i*10,10,10);
					ctx.restore();
				}
				else if (component == MAP_ELEMENT_CONSTANTS.blank)
				{
					// ignore blanks
				}
			}
		}
		ctx.closePath();
		ctx.restore();
	}


	Map.prototype.checkTankCollision = function(tank_obj){
		// todo
		/*
		 used in collision detection between a Tank and Map.

		 given a tank_obj which contains tank orientation , returns false if the tank_obj does not occupy any of the
		 map components which is of type 'solid'/ 'block'
		 returns true  otherwise
		*/
	}	

	Map.prototype.pointOfImpact(staring_point , projection_angle)
	{
		//todo
		/*
			used in projection of Bullet(Ray casting).
			given strating point ,angle of projection(projection_angle) it returns a first point of collision( collision with 
			block of type 'solid')
		*/
	}


	// helper function not used as of yet - donot look

	/*
		@param : point = { x: some_number , y : some_number } ,represents a point on canvas.
		@return : returns a string , which indicates the type of block which enlcoses the point
	*/
	Map.prototype.checkBlockForPoint = function(point){
		
		// check arguments
		if(point == null || point.x == null || point.y == null)
			return null;
		if(point.x <0 || point.y < 0 || point.x > this.getWidth() || point.y > this.getHeight())
			return null;

		var x = Math.floor(point.x / 10);
		var y = Math.floor(point.y / 10);
		var mapComp = this.getMapComponents();
		return mapComp[y][x];
	}

	Map.prototype.checkBlockForLine = function(staring_point , ending_point){
		// check arguments
		if(staring_point == null || staring_point.x == null || staring_point.y == null)
			return null;
		if(staring_point.x <0 || staring_point.y < 0 || staring_point.x > this.getWidth() || staring_point.y > this.getHeight())
			return null;
		if(ending_point == null || ending_point.x == null || ending_point.y == null)
			return null;
		if(ending_point.x <0 || ending_point.y < 0 || ending_point.x > this.getWidth() || ending_point.y > this.getHeight())
			return null;
	}

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
            module.exports = Map;
    else    
            window.GameObjects = Map;

}());

