function Tank(width , length , color){
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
	this.tank_body_components.push(new RectangularComponent(0,0,3/5*this.tank_size.width , 5/6.5*this.tank_size.length,'green'));
	
	// push Color Box (5)
	this.tank_body_components.push(new RectangularComponent(-(1.5/5*this.tank_size.width/2 + 0.375/6.5*this.tank_size.length+1/6.5*this.tank_size.length/2), 0,1/5*this.tank_size.width , 1/6.5*this.tank_size.length,this.tank_color));
	
	// push Body rim (2)
	this.tank_body_components.push(new RectangularComponent(0,(3/5*this.tank_size.width/2 + 0.25/5*this.tank_size.width/2), 0.25/5 * this.tank_size.width , 5/6.5*this.tank_size.length,'red'));
	
	// push Body rim (3)
	this.tank_body_components.push(new RectangularComponent(0, -(3/5*this.tank_size.width/2 + 0.25/5*this.tank_size.width/2), 0.25/5 * this.tank_size.width , 5/6.5*this.tank_size.length,'red'));
	
	// push Front/Tail Bumper (6)
	this.tank_body_components.push(new RectangularComponent( -(5/6.5*this.tank_size.length/2 + 0.5/6.5 * this.tank_size.length/2), 0,3.5/5*this.tank_size.width ,0.5/6.5 * this.tank_size.length,'orange'));
	
	// push Front/Tail Bumper (7)
	this.tank_body_components.push(new RectangularComponent( (5/6.5*this.tank_size.length/2 + 0.5/6.5 * this.tank_size.length/2), 0,3.5/5*this.tank_size.width ,0.5/6.5 * this.tank_size.length,'orange'));

	// push Tank Wheel (8)
	this.tank_body_components.push(new RectangularComponent(0,-(3/5*this.tank_size.width/2+ 0.25/5*this.tank_size.width + 0.75/5*this.tank_size.width/2),0.75/5*this.tank_size.width,this.tank_size.length,'purple'));

	// push Tank Wheel (9)
	this.tank_body_components.push(new RectangularComponent(0,(3/5*this.tank_size.width/2+ 0.25/5*this.tank_size.width +0.75/5*this.tank_size.width/2),0.75/5*this.tank_size.width,this.tank_size.length,'purple'));

	// -------------------------------------

	// Push Tank Gun components which are associated with the tank_orientation.tank_gun_angle .
	
	// push Tank Gun (10)
	this.tank_gun_components.push(new RectangularComponent(5/6.5*this.tank_size.length/2,0 ,0.4/5*this.tank_size.width ,5/6.5*this.tank_size.length,'blue'));

	// push Gun Head (11)
	this.tank_gun_components.push(new RectangularComponent(5/6.5*this.tank_size.length+0.75/6.5*this.tank_size.length/2,0,0.6/5*this.tank_size.width ,0.75/6.5*this.tank_size.length,'black'));

	// push Tank Gate (4)
	this.tank_gun_components.push(new CircularComponent(0,0, 1.5/5*this.tank_size.width/2,'black'));

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
	// used for projecting bullet 
	// returns a position vector of gun tip of the tank.

	var position_vector = {};
	position_vector.x = this.get_tank_position().x + this.get_gun_length()*Math.cos(this.get_gun_angle() * Math.PI/180);
	position_vector.y = this.get_tank_position().y + this.get_gun_length()*Math.sin(this.get_gun_angle() * Math.PI/180);
	return position_vector;
}

Tank.prototype.render = function(){
	// renders all the components of the tank with respect to its position and angle.

	// first render Tank Body Components
	ctx.beginPath();

	ctx.save();

	ctx.translate(this.current_position.x ,this.current_position.y);
	ctx.rotate(this.tank_orientation.tank_angle*Math.PI / 180);
			
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
	ctx.rotate(this.tank_orientation.gun_angle*Math.PI / 180);
		
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

function RectangularComponent(x_offset , y_offset , width ,length,color){
	// x_offset x-axis offset from centre of the Tank
	// y_offset y-axis offset from centre of the Tank

	this.x_offset = x_offset;
	this.y_offset = y_offset;
	this.width = width;
	this.length = length;
	this.color = color;
}

function CircularComponent(x_offset , y_offset , radius,color){
	// x_offset x-axis offset from centre of the Tank
	// y_offset y-axis offset from centre of the Tank

	this.x_offset = x_offset;
	this.y_offset = y_offset;
	this.radius = radius;
	this.color = color;
}