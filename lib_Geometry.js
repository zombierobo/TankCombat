var Geometry = module.exports;

Geometry.Point = function(x , y)
{
	if(x == null || y == null)
	{
		console.log("Point : invalid object constructor invocation");
	}

	this.x = x;
	this.y = y;
}

Geometry.Rectangle = function(pointLT , pointLB ,pointRT, pointRB)
{
	// check arguments
	if(pointLT == null ||  pointLB == null || pointRT == null || pointRB == null)
	{
		console.log('Rectangle : Error in object constructor');
		return;
	}	

	this.pointLT = pointLT;
	this.pointLB = pointLB;
	this.pointRT = pointRT;
	this.pointRB = pointRB;
}

Geometry.areRectangleOverlapping = function(rectangle_obj_a ,rectangle_obj_b ){
	//console.log('areRectangleOverlapping : '+JSON.stringify(rectangle_obj_a) + ' : '+JSON.stringify(rectangle_obj_b));
	if(rectangle_obj_a == null || rectangle_obj_b == null)
	{
		console.log('areOverlapping : Error in arguments');
		return false;
	}

	var leftA = rectangle_obj_a.pointLT.x;  // left most point

	if(rectangle_obj_a.pointLB.x < leftA)
		leftA = rectangle_obj_a.pointLB.x;
	if(rectangle_obj_a.pointRT.x < leftA)
		leftA = rectangle_obj_a.pointRT.x;
	if(rectangle_obj_a.pointRB.x < leftA)
		leftA = rectangle_obj_a.pointRB.x;

	var rightA = rectangle_obj_a.pointLT.x; // right most point

	if(rectangle_obj_a.pointLB.x > rightA)
		rightA = rectangle_obj_a.pointLB.x;
	if(rectangle_obj_a.pointRT.x > rightA)
		rightA = rectangle_obj_a.pointRT.x;
	if(rectangle_obj_a.pointRB.x > rightA)
		rightA = rectangle_obj_a.pointRB.x;

	var topA = rectangle_obj_a.pointLT.y; // top most point

	if(rectangle_obj_a.pointLB.y < topA)
		topA = rectangle_obj_a.pointLB.y;
	if(rectangle_obj_a.pointRT.y < topA)
		topA = rectangle_obj_a.pointRT.y;
	if(rectangle_obj_a.pointRB.y < topA)
		topA = rectangle_obj_a.pointRB.y;

	var bottomA = rectangle_obj_a.pointLT.y; // bottom most point

	if(rectangle_obj_a.pointLB.y > bottomA)
		bottomA = rectangle_obj_a.pointLB.y;
	if(rectangle_obj_a.pointRT.y > bottomA)
		bottomA = rectangle_obj_a.pointRT.y;
	if(rectangle_obj_a.pointRB.y > bottomA)
		bottomA = rectangle_obj_a.pointRB.y;

	var leftB = rectangle_obj_b.pointLT.x;  // left most point

	if(rectangle_obj_b.pointLB.x < leftB)
		leftB = rectangle_obj_b.pointLB.x;
	if(rectangle_obj_b.pointRT.x < leftB)
		leftB = rectangle_obj_b.pointRT.x;
	if(rectangle_obj_b.pointRB.x < leftB)
		leftB = rectangle_obj_b.pointRB.x;

	var rightB = rectangle_obj_b.pointLT.x; // right most point

	if(rectangle_obj_b.pointLB.x > rightB)
		rightB = rectangle_obj_b.pointLB.x;
	if(rectangle_obj_b.pointRT.x > rightB)
		rightB = rectangle_obj_b.pointRT.x;
	if(rectangle_obj_b.pointRB.x > rightB)
		rightB = rectangle_obj_b.pointRB.x;

	var topB = rectangle_obj_b.pointLT.y; // top most point

	if(rectangle_obj_b.pointLB.y < topB)
		topB = rectangle_obj_b.pointLB.y;
	if(rectangle_obj_b.pointRT.y < topB)
		topB = rectangle_obj_b.pointRT.y;
	if(rectangle_obj_b.pointRB.y < topB)
		topB = rectangle_obj_b.pointRB.y;

	var bottomB = rectangle_obj_b.pointLT.y;

	if(rectangle_obj_b.pointLB.y > bottomB)
		bottomB = rectangle_obj_b.pointLB.y;
	if(rectangle_obj_b.pointRT.y > bottomB)
		bottomB = rectangle_obj_b.pointRT.y;
	if(rectangle_obj_b.pointRB.y > bottomB)
		bottomB = rectangle_obj_b.pointRB.y;

	if(leftA > rightB)
		return false; // overlapping impossible
	if(rightA < leftB)
		return false; // overlapping impossible
	if(topA > bottomB)
		return false; // overlapping impossible
	if(bottomA < topB)
		return false; // overlapping impossible

	//console.log('areRectangleOverlapping : rectangle overlapping');
	//console.log(JSON.stringify(rectangle_obj_a));
	//console.log(JSON.stringify(rectangle_obj_b));
	//console.log('-------------------------------------------');
	return true ; // overlappping
}