var MAP_ELEMENT_CONSTANTS = {};
MAP_ELEMENT_CONSTANTS.blank = 'blank';
MAP_ELEMENT_CONSTANTS.block = 'block';

function MapRepresentation(character_representation , width ,height)
{
	/*
		the canvas is broken down into 10*10 pixel blocks ,
		each of these blocks represent one type of map component
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
	this.map_components = [];

	if(character_representation.length*10 != this.height)
	{
		console.log("MapRepresentation : Error : in character_representation : height not valid ");
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
				console.log('MapRepresentation : Error : in character_representation : width not valid : row number : '+i);
				return;
			}
			else
			{
				this.map_components[i] = [];
				
				for(var j = 0 ; j<map_row.length ; j++)
				{
					var component = MAP_ELEMENT_CONSTANTS[ this.character_mapping[ map_row[j] ] ];
					if(component != null)
						this.map_components[i][j] = component;
					else
					{
						console.log('MapRepresentation : Error : in character_representation : invalid character : i : '+i+ ' , j : '+j);
						return;
					}
				}
			}
		}	
	}
}

MapRepresentation.prototype.character_mapping = {
	'b' : MAP_ELEMENT_CONSTANTS.blank,
	'#' : MAP_ELEMENT_CONSTANTS.block
};

MapRepresentation.prototype.render = function() {
	console.log('MapRepresentation : render');
	if(this.map_components == null || this.map_components.length == 0)
		return;
	ctx.save();
	ctx.beginPath();
	
	for(var i = 0 ; i<this.map_components.length ; i++)
	{
		var map_row = this.map_components[i];
		for(var j = 0 ; j<map_row.length ; j++)
		{
			//console.log('inside for loop');
			var component = this.map_components[i][j];
			if(component == MAP_ELEMENT_CONSTANTS.block)
			{
				ctx.save();
				ctx.fillStyle = 'black';
				ctx.fillRect(j*10,i*10,(j*10)+10,(i*10)+10);
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

