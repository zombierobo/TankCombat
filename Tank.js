///////////////////////////////////////////////
//######### update the code and use #########//
///////////////////////////////////////////////


 function Tank (width , length , color){
	/*
	how the tank looks on the canvas 

			-----x------>
	      _____________________________		
	   	 |
	   ' |             length 
	   y |           _____________    
	   . |          |             | 
	   . |	width   |	          |   
	   . |          |      .(x,y) |   ____________    
	     |          |	          |
	     |          |_____________|
	     |
	     |
	   
	   angle of reference (angle measured in clock-wise direction with respect to horizontal line)
	   0 <= angle <= 360.
	*/

	/*
		width:length::10:13
		the model has width 5cm and length 6.5cm
	*/	
	
	// Note : any number enclosed within parenthesis represents a component of the Tank as per Diagram . ex:- Gun head(11)

	if( (width/length) != 10/13)
		console.log('Tank constructor : Error in values of width and length , they are not in desired ratio');

	this.current_position = { x : 0 , y : 0};
	this.tank_orientation = {tank_angle : 0 , gun_angle : 0};
	this.tank_size={}; 
	this.tank_size.width = width;
	this.tank_size.length = length;
	this.tank_color = color;

	this.gun_size = {}; 
	this.gun_size.length = 5/6.5*this.tank_size.length+0.75/6.5*this.tank_size.length; //length of Gun(10) + Gun head(11).
	this.gun_size.width = 0.6/5*this.tank_size.width; // assuming width of Gun head(11)

	/* 
		tank_body_components and tank_gun_components are used for rendering tank. 
		each component is either Rectangular(RectangularComponent) or Circular(CircularComponent) 
	*/

	this.tank_body_components = [];
	this.tank_gun_components = [];
	
	// Push Tank Body components which are associated with the tank_orientation.tank_angle

	// push Body (1) (the number indicates the numeric id of the component in the model diagram)
	this.tank_body_components.push(new RectangularComponent(0,0,3/5*this.tank_size.width , 5/6.5*this.tank_size.length,'#777254'));
	
	// push Color Box (5)
	this.tank_body_components.push(new RectangularComponent(1.5/5*this.tank_size.width/2 + 0.375/6.5*this.tank_size.length+1/6.5*this.tank_size.length/2, 0,1/5*this.tank_size.width , 1/6.5*this.tank_size.length,this.tank_color));
	
	// push Body rim (2)
	this.tank_body_components.push(new RectangularComponent(0,(3/5*this.tank_size.width/2 + 0.25/5*this.tank_size.width/2), 0.25/5 * this.tank_size.width , 5/6.5*this.tank_size.length,'#284728'));
	
	// push Body rim (3)
	this.tank_body_components.push(new RectangularComponent(0, -(3/5*this.tank_size.width/2 + 0.25/5*this.tank_size.width/2), 0.25/5 * this.tank_size.width , 5/6.5*this.tank_size.length,'#284728'));
	
	// push Front/Tail Bumper (6)
	this.tank_body_components.push(new RectangularComponent( -(5/6.5*this.tank_size.length/2 + 0.5/6.5 * this.tank_size.length/2), 0,3.5/5*this.tank_size.width ,0.5/6.5 * this.tank_size.length,'#40433B'));
	
	// push Front/Tail Bumper (7)
	this.tank_body_components.push(new RectangularComponent( (5/6.5*this.tank_size.length/2 + 0.5/6.5 * this.tank_size.length/2), 0,3.5/5*this.tank_size.width ,0.5/6.5 * this.tank_size.length,'#40433B'));

	// push Tank Wheel (8)
	this.tank_body_components.push(new RectangularComponent(0,-(3/5*this.tank_size.width/2+ 0.25/5*this.tank_size.width + 0.75/5*this.tank_size.width/2),0.75/5*this.tank_size.width,this.tank_size.length,'#23221E'));

	// push Tank Wheel (9)
	this.tank_body_components.push(new RectangularComponent(0,(3/5*this.tank_size.width/2+ 0.25/5*this.tank_size.width +0.75/5*this.tank_size.width/2),0.75/5*this.tank_size.width,this.tank_size.length,'#23221E'));

	// -------------------------------------

	// Push Tank Gun components which are associated with the tank_orientation.tank_gun_angle .
	
	// push Tank Gun (10)
	this.tank_gun_components.push(new RectangularComponent(5/6.5*this.tank_size.length/2,0 ,0.4/5*this.tank_size.width ,5/6.5*this.tank_size.length,'#636557'));

	// push Gun Head (11)
	this.tank_gun_components.push(new RectangularComponent(5/6.5*this.tank_size.length+0.75/6.5*this.tank_size.length/2,0,0.6/5*this.tank_size.width ,0.75/6.5*this.tank_size.length,'#2A2C26'));

	// push Tank Gate (4)
	this.tank_gun_components.push(new CircularComponent(0,0, 1.5/5*this.tank_size.width/2,'#414339'));

	// --------------------------------------
}

/* tank API */
Tank.prototype.set_tank_position = function( position_vector){
	if(position_vector.x == null || position_vector.y == null)
		return;
	this.current_position.x = position_vector.x;
	this.current_position.y = position_vector.y;
}

Tank.prototype.set_tank_angle = function(angle){
	if(angle != null)
	{
		if(angle < 0)
			angle += 360;

		angle = angle % 360;
		this.tank_orientation.tank_angle = angle;
	}
}

Tank.prototype.set_gun_angle = function(angle){
	if(angle != null)
	{
		if(angle < 0)
			angle += 360;
		
		angle = angle %360;
		this.tank_orientation.gun_angle = angle;
	}
}

Tank.prototype.set_tank_color = function(color){
	if(color == null)
		return;
	
	// update property
	this.tank_color = color;

	// update Tank Color Box(5) - tank body component
	this.tank_body_components[1].color = color; 
}

Tank.prototype.get_tank_position = function(){
	return this.current_position; // returns a position vector.
}

Tank.prototype.get_tank_angle = function(){
	return this.tank_orientation.tank_angle;
}

Tank.prototype.get_gun_angle = function(){
	return this.tank_orientation.gun_angle;
}

Tank.prototype.get_tank_width = function(){
	return this.tank_size.width;
}

Tank.prototype.get_tank_length = function(){
	return this.tank_size.length;
}

Tank.prototype.get_gun_width = function(){
	return this.gun_size.width;
}

Tank.prototype.get_gun_length = function(){
	return this.gun_size.length;
}

Tank.prototype.get_gun_tip = function(){
	// used for getting starting position of bullet helps in (projecting bullet) 
	// returns a position vector of gun tip of the tank.

	var position_vector = {};
	position_vector.x = this.get_tank_position().x + this.get_gun_length()*Math.cos(this.get_gun_angle() * Math.PI/180);
	position_vector.y = this.get_tank_position().y + this.get_gun_length()*Math.sin(this.get_gun_angle() * Math.PI/180);
	return position_vector;
}

Tank.prototype.get_gun_pivot = function(){
	// used to return pivot point of gun
	// used in conjunction with gun tip to check collission with other objects
	// in our tank model , the gun pivot is the centre of the tank

	return this.current_position ;
}

Tank.prototype.render = function(){
	// renders all the components of the tank with respect to its position and angle.

	// first render Tank Body Components
	ctx.beginPath();

	ctx.save();

	ctx.translate(this.current_position.x ,this.current_position.y);
	var rotation_angle = 360 - this.get_tank_angle();
	
	ctx.rotate(rotation_angle*Math.PI / 180);
			
	for(var i = 0 ; i<this.tank_body_components.length ; i++)
	{	
		var component = this.tank_body_components[i];
		if(component.constructor.name == "RectangularComponent")
		{
			//console.log('rendering a Tank Body Component  : ' + 'RectangularComponent');
			ctx.save();

			ctx.fillStyle = component.color;
			ctx.translate(component.x_offset,component.y_offset);
			ctx.translate(-component.length/2 , -component.width/2);
			ctx.fillRect(0 ,0 ,component.length ,  component.width );

			ctx.restore();
		}
		else if(component.constructor.name == "CircularComponent")
		{
			//console.log('rendering a Tank Body Component  : ' + 'CircularComponent');
			ctx.save();

			ctx.fillStyle = component.color;	
			ctx.arc(component.x_offset , component.y_offset,component.radius,0,2*Math.PI,true);
			ctx.fill();

			ctx.restore();
		}
	}

	ctx.restore();
	
	// render Tank Gun Components

	ctx.save();

	ctx.translate(this.current_position.x ,this.current_position.y);
	rotation_angle = 360 - this.get_gun_angle();
	ctx.rotate(rotation_angle*Math.PI / 180);
		
	for(var i = 0 ; i<this.tank_gun_components.length ; i++)
	{	
		var component = this.tank_gun_components[i];

		if(component.constructor.name === "RectangularComponent")
		{
			//console.log('rendering a Tank Gun Component : '+'RectangularComponent');

			ctx.save();

			ctx.fillStyle = component.color;
			ctx.translate(component.x_offset,component.y_offset);
			ctx.translate(-component.length/2 , -component.width/2);
			ctx.fillRect(0 ,0 ,component.length ,  component.width )

			ctx.restore();		
		}
		else if(component.constructor.name === "CircularComponent")
		{
			//console.log('rendering a Tank Gun Component : '+'CircularComponent');
			
			ctx.save();
			ctx.fillStyle = component.color;
			ctx.arc(component.x_offset , component.y_offset,component.radius,0,2*Math.PI,true);
			ctx.fill();	
			ctx.restore();
		}
	}

	ctx.restore();

	ctx.closePath();
}

Tank.prototype.checkTankCollision = function(tank_obj){
	//todo
	/*
		used in collision detection between this Tank object and an other Tank Object(tank_obj)
		returns true if both tanks overlap each other in their respective orientation,
		false otherwise.
	*/
	return areTankOverlapping(this , tank_obj);
}

/*
	function to check if two tanks overlap with each other.
	used in collision detection

	return true if they overlap 
	false otherwise
*/

function areTankOverlapping (tank_obj_a , tank_obj_b)
{
	// check arguments
	if(tank_obj_a == null || tank_obj_b == null)
		return false;

	// check if tank body overlap

	var rect_body_a = getTankBodyRect(tank_obj_a);
	var rect_body_b = getTankBodyRect(tank_obj_b);

	if(areRectangleOverlapping(rect_body_a , rect_body_b))
	{
		console.log('areTankOverlapping : tank body - tank body overlapping');
		return true;
	}
	// check if tank guns overlap

	var rect_gun_a = getTankGunRect(tank_obj_a);
	var rect_gun_b = getTankGunRect(tank_obj_b);

	if(areRectangleOverlapping(rect_gun_a , rect_gun_b))
	{
		console.log('areTankOverlapping : gun - gun overlapping');
		return true;
	}
	// check if gun of one tank overlaps body of another

	if(areRectangleOverlapping(rect_gun_a , rect_body_b))
	{
		console.log('areTankOverlapping : gun - tank body overlapping');
		return true;
	}	
	if(areRectangleOverlapping(rect_gun_b , rect_body_a))
	{
		console.log('areTankOverlapping : tank body - gun overlapping');
		return true;
	}
	return false;       // not overlapping
}

// helper functions

/*
	@param : a tank object.
	@return : a Rectangle object , which represents the rectangle object enclosing Tank Body.
	used for collision detection purpose.
*/
function getTankBodyRect (tank_obj_a)
{
	// check arguments
	if(tank_obj_a == null)
		return null;

	var tank_length = tank_obj_a.get_tank_length();
	var tank_width = tank_obj_a.get_tank_width();
	var position = tank_obj_a.get_tank_position();
	var tank_angle = tank_obj_a.get_tank_angle();

	var phi = Math.atan2(tank_width , tank_length)*180 / Math.PI;

	var r = Math.sqrt(tank_length/2 *tank_length/2 + tank_width/2 * tank_width/2);

	var pointRT = new Point(position.x + r*Math.cos((phi + tank_angle )*Math.PI/180) , position.y - r*Math.sin((phi + tank_angle) * Math.PI/180));
	var pointLT	= new Point(position.x + r*Math.cos((180 - phi + tank_angle )*Math.PI/180) , position.y - r* Math.sin((180 - phi + tank_angle)*Math.PI/180));
	var pointLB = new Point(position.x + r*Math.cos( (180 + phi + tank_angle ) * Math.PI/180) , position.y - r* Math.sin( (180 + phi + tank_angle) * Math.PI/180))
	var pointRB = new Point(position.x + r*Math.cos( (360 - phi + tank_angle ) * Math.PI/180) , position.y - r* Math.sin( (360 - phi + tank_angle) * Math.PI/180));

	var rect_body_a = new Rectangle(pointLT , pointLB, pointRT , pointRB);
	//console.log(JSON.stringify(rect_body_a));
	return rect_body_a;
}

/*
	@param : a tank object.
	@return : a Rectangle object , which represents the rectangle enclosing Tank Gun.
	used for collision detection purpose.
*/
function getTankGunRect (tank_obj_a)
{
	//check arguments
	if(tank_obj_a == null)
		return null;

	var gun_length = tank_obj_a.get_gun_length();
	var gun_width = tank_obj_a.get_gun_width();
	var gun_pivot = tank_obj_a.get_gun_pivot();
	var gun_angle = tank_obj_a.get_gun_angle();

	var phi = Math.atan2(gun_width/2 , gun_length)*180 / Math.PI;

	var r = Math.sqrt(gun_width/2 * gun_width/2 + gun_length*gun_length);

	var pointLT	= new Point(gun_pivot.x - gun_width/2*Math.sin(gun_angle*Math.PI/180) , gun_pivot.y - gun_width/2*Math.sin((90+gun_angle)*Math.PI/180));
	var pointLB = new Point(gun_pivot.x + gun_width/2*Math.sin(gun_angle*Math.PI/180) , gun_pivot.y + gun_width/2*Math.sin((90+gun_angle)*Math.PI/180));
	var pointRT = new Point(gun_pivot.x + r*Math.cos( (gun_angle+phi) * Math.PI/180) , gun_pivot.y - r*Math.sin( (gun_angle+phi) * Math.PI/180));
	var pointRB = new Point(gun_pivot.x + r*Math.cos( (gun_angle+(360-phi))*Math.PI/180) , gun_pivot.y - r*Math.sin( (gun_angle+(360-phi))*Math.PI/180));

	var rect_gun_a = new Rectangle(pointLT , pointLB, pointRT , pointRB);
	//console.log(JSON.stringify(rect_gun_a));
	return rect_gun_a;	
} 


// the following functions are helper functions to aid rendering of the tank

function RectangularComponent (x_offset , y_offset , width ,length,color){
	// x_offset x-axis offset from centre of the Tank
	// y_offset y-axis offset from centre of the Tank

	this.x_offset = x_offset;
	this.y_offset = y_offset;
	this.width = width;
	this.length = length;
	this.color = color;
}

function CircularComponent (x_offset , y_offset , radius,color){
	// x_offset x-axis offset from centre of the Tank
	// y_offset y-axis offset from centre of the Tank

	this.x_offset = x_offset;
	this.y_offset = y_offset;
	this.radius = radius;
	this.color = color;
};
